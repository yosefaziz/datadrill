---
title: "Spark Adaptive Query Execution (AQE)"
difficulty: "Medium"
tags: ["spark", "aqe", "optimization"]
question: "Which of the following are optimizations performed by Spark's Adaptive Query Execution (AQE)? Select all that apply."
multi_select: true
answers:
  - id: a
    text: "Coalescing small shuffle partitions into larger ones"
    correct: true
    explanation: "AQE detects when shuffle produces many small partitions and automatically merges them into fewer, larger partitions. This reduces task scheduling overhead and improves I/O efficiency."
  - id: b
    text: "Switching join strategy at runtime based on actual data sizes"
    correct: true
    explanation: "AQE can convert a Sort-Merge Join to a Broadcast Hash Join at runtime if it discovers one side of the join is smaller than expected after computing shuffle statistics."
  - id: c
    text: "Optimizing skewed joins by splitting large partitions"
    correct: true
    explanation: "AQE detects skewed partitions in joins and automatically splits them into smaller sub-partitions, replicating the matching partition from the other side. This distributes the work more evenly across tasks."
  - id: d
    text: "Automatically caching frequently accessed DataFrames"
    correct: false
    explanation: "AQE does not perform automatic caching. Caching must be explicitly requested by the user with cache() or persist(). AQE's optimizations are limited to runtime query plan adjustments based on shuffle statistics."
explanation: "AQE, enabled by default since Spark 3.2, is a major advancement that optimizes queries at runtime using actual data statistics rather than estimates. In interviews, being able to describe AQE's three main features - partition coalescing, join strategy switching, and skew handling - demonstrates current Spark knowledge."
---

Adaptive Query Execution represents a shift from purely static optimization to runtime-adaptive optimization and is one of the most impactful features in modern Spark.
