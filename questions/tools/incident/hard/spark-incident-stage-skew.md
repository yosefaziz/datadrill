---
title: "Stage with 100x Task Duration Variance"
difficulty: "Hard"
tags: ["spark", "skew", "performance", "tasks", "incident"]
track: tools-spark-architecture
track_level: 6
track_order: 2
alert: "ALERT: Spark job 'user_sessionization' SLA breach - expected completion in 30 min, currently running for 4 hours. Stage 5 shows 199/200 tasks completed, 1 task running for 3.5 hours (median task time: 2 min)."
investigation_steps:
  - id: s1
    action: "Check Stage 5 task duration distribution"
    clue: "199 tasks: median 2min, p95 5min, max 8min. Task 147: running 3.5hrs, shuffle read 45GB, records processed 800M."
    category: essential
  - id: s2
    action: "Check the groupBy key distribution"
    clue: "Stage 5 is groupBy('user_id'). User ID 'bot-crawler-001' has 800M events (60% of total data). Next largest user has 50K events."
    category: essential
  - id: s3
    action: "Check executor running task 147"
    clue: "Executor 38: CPU at 100%, memory at 85% (7.2GB of 8.5GB used), heavy GC pressure but not OOM. Spilling to disk: 30GB."
    category: essential
  - id: s4
    action: "Check if speculative execution is enabled"
    clue: "spark.speculation=true, but task 147 has no speculative copy because it's making progress (just slowly)."
    category: helpful
  - id: s5
    action: "Check data source for anomalies"
    clue: "The 'bot-crawler-001' user ID appeared 3 days ago and generates 300M events/day. It's an automated bot."
    category: essential
  - id: s6
    action: "Check cluster resource utilization"
    clue: "49 of 50 executors are idle, waiting for task 147. Cluster utilization: 2%."
    category: helpful
  - id: s7
    action: "Check Spark version and AQE settings"
    clue: "Spark 3.2, AQE enabled but spark.sql.adaptive.skewJoin.enabled=false (not applicable here - this is a groupBy, not a join)."
    category: helpful
root_causes:
  - id: rc1
    text: "A bot user ID ('bot-crawler-001') generates 60% of all events, creating extreme data skew in the groupBy partition"
    correct: true
    feedback: "Correct! The bot account is creating extreme skew. One partition has 800M rows while the median has ~6.7M. This single task dominates the entire stage duration."
  - id: rc2
    text: "The cluster doesn't have enough executors to handle the workload"
    correct: false
    feedback: "The cluster has 50 executors but 49 are idle. The problem isn't capacity - it's that all the work is concentrated in one partition."
  - id: rc3
    text: "Speculative execution should be creating backup copies of the slow task"
    correct: false
    feedback: "Speculation creates copies when a task appears stuck, but task 147 is making progress (just slowly due to 800M records). A speculative copy would be equally slow."
  - id: rc4
    text: "Shuffle partition count (200) is too low for the data volume"
    correct: false
    feedback: "Even with more partitions, all 800M bot records share the same user_id and would hash to the same partition."
fixes:
  - id: f1
    text: "Filter out known bot user IDs before the groupBy operation"
    correct: true
    points: 3
    feedback: "Removing bot traffic upstream prevents the skew entirely and reduces data volume by 60%."
  - id: f2
    text: "Implement salted aggregation: add salt to user_id for the groupBy, then merge partial results"
    correct: true
    points: 2
    feedback: "Salting would distribute the bot's data across multiple partitions. However, filtering bots is simpler if they don't need to be in the output."
  - id: f3
    text: "Process bot and non-bot data separately, union the results"
    correct: true
    points: 2
    feedback: "This isolates the skewed data and allows different optimization strategies for each segment."
  - id: f4
    text: "Increase spark.sql.shuffle.partitions to 10000"
    correct: false
    points: 0
    feedback: "More partitions don't help because all bot events share the same user_id key."
  - id: f5
    text: "Add an upstream data quality gate to detect and quarantine anomalous user IDs"
    correct: true
    points: 2
    feedback: "Proactive detection prevents similar issues from new bot accounts in the future."
max_investigation_steps: 5
max_fixes: 3
hints:
  - "One task is processing orders of magnitude more data than others"
  - "Check what makes the slow partition's key special"
  - "Consider whether the skewed data even needs to be in the final output"
---

A critical Spark pipeline is breaching its SLA. One task in a 200-task stage is taking 100x longer than the rest. Investigate and resolve the issue.
