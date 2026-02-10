---
title: "Spark Data Skew Handling"
difficulty: "Medium"
tags: ["spark", "data-skew", "performance"]
question: "Your Spark job is slow because one partition has 10x more data than others after a groupBy operation. What is the best approach to resolve this?"
multi_select: false
answers:
  - id: a
    text: "Add more executors to the cluster"
    correct: false
    explanation: "Adding executors does not help with data skew because the bottleneck is a single oversized partition processed by a single task. More executors would remain idle while the skewed partition's task runs."
  - id: b
    text: "Use salting to distribute the skewed key across multiple partitions"
    correct: true
    explanation: "Salting appends a random prefix to the skewed key, spreading its data across multiple partitions for the groupBy. After aggregation on the salted key, a second aggregation combines the partial results. This converts one large task into many smaller parallel tasks."
  - id: c
    text: "Call repartition() before the groupBy to redistribute data evenly"
    correct: false
    explanation: "repartition() without specifying columns uses round-robin, which would redistribute evenly. But the subsequent groupBy would hash-partition by key again, recreating the same skew."
  - id: d
    text: "Enable Adaptive Query Execution (AQE) to automatically handle the skew"
    correct: false
    explanation: "AQE's skew handling primarily targets skewed joins by splitting skewed partitions and replicating the other side. It does not automatically resolve skew in groupBy aggregations."
explanation: "Data skew is one of the most common performance problems in Spark and a favorite interview topic. Salting is the standard technique for groupBy skew, while AQE handles join skew. Being able to diagnose skew from the Spark UI and choose the right mitigation strategy is an important practical skill."
---

Data skew causes disproportionate load on individual tasks, turning parallel operations into sequential bottlenecks and is one of the most common Spark performance issues in production.
