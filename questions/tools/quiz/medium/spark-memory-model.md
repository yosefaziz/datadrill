---
title: "Spark Executor Memory Model"
difficulty: "Medium"
tags: ["spark", "memory", "executor"]
question: "What are the two main memory regions within a Spark executor's unified memory?"
multi_select: false
answers:
  - id: a
    text: "Storage memory for caching and execution memory for shuffles, joins, and sorts"
    correct: true
    explanation: "Spark's unified memory manager divides executor memory into storage memory (for caching DataFrames and broadcast variables) and execution memory (for intermediate data during shuffles, joins, sorts, and aggregations). These regions can borrow from each other when one is underutilized."
  - id: b
    text: "Heap memory and off-heap memory"
    correct: false
    explanation: "Heap vs off-heap describes where memory is allocated (JVM managed vs direct), not how Spark logically divides memory within an executor. Both heap and off-heap can contain storage and execution regions."
  - id: c
    text: "Driver memory and executor memory"
    correct: false
    explanation: "Driver and executor are separate JVM processes, not memory regions within an executor. This describes the cluster-level memory architecture, not the executor-internal memory model."
  - id: d
    text: "User memory and Spark system memory"
    correct: false
    explanation: "While user memory and reserved memory do exist in the Spark memory model, the two main functional regions that Spark actively manages are storage and execution memory. User memory is a smaller section for user data structures."
explanation: "The unified memory model introduced in Spark 1.6 allows storage and execution to dynamically share memory, improving utilization. In interviews, understanding this model helps explain tuning parameters like spark.memory.fraction and spark.memory.storageFraction, and diagnose OOM errors."
---

Understanding Spark's memory model is essential for tuning executor configuration and diagnosing out-of-memory errors in production Spark applications.
