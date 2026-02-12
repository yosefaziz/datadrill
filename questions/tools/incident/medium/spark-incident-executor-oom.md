---
title: "Executor OOM During Shuffle"
difficulty: "Medium"
tags: ["spark", "OOM", "shuffle", "memory", "incident"]
track: tools-spark-architecture
track_level: 6
track_order: 1
alert: "ALERT: Spark job 'daily_aggregation' failed after 45 minutes. Stage 3 (shuffle read) failed with: java.lang.OutOfMemoryError: Java heap space on executor 12. 47 of 200 tasks completed before failure."
investigation_steps:
  - id: s1
    action: "Check Spark UI - Stage 3 task metrics"
    clue: "One task shows shuffle read of 12GB while others average 200MB. The 12GB task is on executor 12."
    category: essential
  - id: s2
    action: "Check executor 12 memory configuration"
    clue: "Executor memory: 8GB, spark.memory.fraction: 0.6 (4.8GB usable). Overhead: 1GB."
    category: essential
  - id: s3
    action: "Check input data partition sizes"
    clue: "Input has 200 partitions. Most are ~500MB but partition 47 is 15GB (contains all records for key 'US')."
    category: essential
  - id: s4
    action: "Check GC logs on executor 12"
    clue: "Full GC occurring every 2 seconds in the last 5 minutes before crash. Old gen at 99%."
    category: helpful
  - id: s5
    action: "Check if dynamic allocation is enabled"
    clue: "spark.dynamicAllocation.enabled=true, currently using 50 of max 100 executors."
    category: irrelevant
  - id: s6
    action: "Check recent code changes"
    clue: "No code changes in the last week. Same job ran successfully yesterday."
    category: irrelevant
  - id: s7
    action: "Check upstream data volume"
    clue: "Today's input is 2x larger than yesterday due to a marketing campaign in the US market."
    category: essential
root_causes:
  - id: rc1
    text: "Data skew on the 'US' key causing one partition to be 60x larger than average, exceeding executor memory during shuffle read"
    correct: true
    feedback: "Correct! The combination of data skew (US key) and increased data volume caused one shuffle partition to exceed the 4.8GB usable memory on the executor."
  - id: rc2
    text: "Executor memory is too low at 8GB for this workload"
    correct: false
    feedback: "While more memory would delay the failure, it doesn't address the root cause. The skew means one partition will always be disproportionately large. Increasing memory is a band-aid, not a fix."
  - id: rc3
    text: "Too few shuffle partitions (200) for the data volume"
    correct: false
    feedback: "More partitions would help if data were evenly distributed, but skew means the US key still goes to one partition regardless of partition count."
  - id: rc4
    text: "Dynamic allocation is not scaling up enough executors"
    correct: false
    feedback: "Adding more executors doesn't help when the bottleneck is a single oversized partition. The task processing that partition still runs on one executor."
fixes:
  - id: f1
    text: "Add salted repartitioning to break up the skewed US key across multiple partitions"
    correct: true
    points: 3
    feedback: "This directly addresses the root cause by splitting the hot key across multiple partitions."
  - id: f2
    text: "Enable Spark 3.x Adaptive Query Execution (AQE) with skew join optimization"
    correct: true
    points: 3
    feedback: "AQE can automatically detect and split skewed partitions at runtime."
  - id: f3
    text: "Increase executor memory to 16GB"
    correct: false
    points: 0
    feedback: "This is a temporary workaround that doesn't address the underlying skew. The next data spike will cause the same issue."
  - id: f4
    text: "Increase spark.sql.shuffle.partitions to 2000"
    correct: false
    points: 0
    feedback: "More partitions won't help because the skew is on a single key - all US records still hash to the same partition."
  - id: f5
    text: "Add a data quality check to alert when any key exceeds a size threshold"
    correct: true
    points: 2
    feedback: "Good proactive measure to catch skew issues early, though it doesn't fix the current problem."
max_investigation_steps: 5
max_fixes: 3
hints:
  - "Look at the task metrics - is the workload evenly distributed?"
  - "Compare the failed task's shuffle read size to executor memory"
  - "What changed between yesterday (success) and today (failure)?"
---

A production Spark job that has been running reliably has suddenly failed. Investigate the alert, identify the root cause, and propose fixes.
