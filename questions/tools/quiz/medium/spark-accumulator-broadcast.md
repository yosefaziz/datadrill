---
title: "Spark Broadcast Variables vs Accumulators"
difficulty: "Medium"
tags: ["spark", "broadcast", "accumulator"]
question: "When should you use a broadcast variable instead of a regular variable in Spark?"
multi_select: false
answers:
  - id: a
    text: "When you need a large read-only dataset shared efficiently across all tasks"
    correct: true
    explanation: "Broadcast variables distribute a large read-only dataset to each executor once, rather than shipping it with every task's closure. This is efficient for lookup tables, configuration maps, or ML model parameters that all tasks need but should not be duplicated per task."
  - id: b
    text: "When you need a shared counter that tasks can increment"
    correct: false
    explanation: "Shared counters that tasks update are accumulators, not broadcast variables. Accumulators are write-only from tasks and read-only from the Driver, while broadcast variables are the opposite - read-only from tasks."
  - id: c
    text: "When you need to collect results from executors back to the Driver"
    correct: false
    explanation: "Collecting results to the Driver is done with actions like collect() or reduce(). Broadcast variables send data from the Driver to executors, not the other way around."
  - id: d
    text: "When you need to persist data between different Spark jobs"
    correct: false
    explanation: "Broadcast variables exist only for the lifetime of a single Spark application. For persisting data between jobs, use external storage like HDFS, S3, or a database."
explanation: "Broadcast variables and accumulators are Spark's two shared variable mechanisms. Understanding when to use each - broadcast for efficient read-only distribution, accumulators for write-only aggregation - is a practical skill that interviewers test to gauge hands-on Spark experience."
---

Broadcast variables are a critical optimization for avoiding redundant data serialization in Spark jobs that need to share reference data across tasks.
