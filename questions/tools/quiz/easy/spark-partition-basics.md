---
title: "Spark Partition Basics"
difficulty: "Easy"
tags: ["spark", "partitioning", "shuffle"]
question: "What happens when you call repartition(10) on a DataFrame that currently has 5 partitions?"
multi_select: false
answers:
  - id: a
    text: "A full shuffle redistributes data across 10 new partitions"
    correct: true
    explanation: "repartition() always triggers a full shuffle, redistributing all data across the specified number of partitions using round-robin or hash partitioning. This ensures even data distribution but is expensive due to network I/O."
  - id: b
    text: "Each of the 5 existing partitions is split into 2 partitions without shuffling"
    correct: false
    explanation: "repartition() does not simply split existing partitions. It performs a full shuffle to redistribute data, which is why it can both increase and decrease partition count."
  - id: c
    text: "Spark throws an error because you cannot increase partitions beyond the original count"
    correct: false
    explanation: "You can freely increase or decrease partition count with repartition(). There is no restriction on the target number relative to the current count."
  - id: d
    text: "5 empty partitions are added alongside the existing 5 data partitions"
    correct: false
    explanation: "repartition() redistributes data across all target partitions evenly. It does not leave any partitions empty or preserve the original partition boundaries."
explanation: "Understanding repartition() and its full-shuffle behavior is critical for Spark performance tuning. In interviews, candidates are expected to know that repartition() is expensive and to explain when coalesce() would be more efficient for reducing partition count."
---

Partitioning directly impacts parallelism and shuffle overhead in Spark, making it a frequent topic in data engineering performance discussions.
