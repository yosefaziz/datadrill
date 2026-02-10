---
title: "Spark Speculative Execution"
difficulty: "Medium"
tags: ["spark", "speculation", "fault-tolerance"]
question: "What is speculative execution in Spark?"
multi_select: false
answers:
  - id: a
    text: "Launching duplicate copies of slow tasks on other nodes to mitigate stragglers"
    correct: true
    explanation: "When enabled (spark.speculation=true), Spark monitors task durations and launches duplicate copies of tasks that are running significantly slower than the median. Whichever copy finishes first is used, and the other is killed. This mitigates stragglers caused by hardware issues or data skew."
  - id: b
    text: "Pre-computing results for predicted future queries to reduce latency"
    correct: false
    explanation: "Spark does not pre-compute results for future queries. Speculative execution addresses slow-running tasks in current jobs, not future query prediction."
  - id: c
    text: "Running multiple query plans simultaneously and choosing the fastest"
    correct: false
    explanation: "Running multiple plans describes Adaptive Query Execution's approach to runtime optimization. Speculative execution duplicates individual slow tasks, not entire query plans."
  - id: d
    text: "Executing stages that depend on each other in parallel to reduce job time"
    correct: false
    explanation: "Dependent stages cannot run in parallel since they need the previous stage's output. Independent stages can run in parallel, but that is standard scheduling, not speculative execution."
explanation: "Speculative execution is a fault-tolerance feature for handling stragglers - tasks that are much slower than their peers. In interviews, knowing when to enable it (heterogeneous clusters, unreliable hardware) and when to disable it (non-idempotent operations, resource-constrained clusters) shows operational maturity."
---

Speculative execution is a practical reliability feature that helps maintain consistent job completion times in large-scale Spark deployments.
