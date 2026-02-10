---
title: "Spark Shuffle Operations"
difficulty: "Medium"
tags: ["spark", "shuffle", "transformations"]
question: "Which of the following operations cause a shuffle in Spark? Select all that apply."
multi_select: true
answers:
  - id: a
    text: "groupBy().agg()"
    correct: true
    explanation: "groupBy() requires all rows with the same key to be co-located on the same partition, which necessitates a shuffle to redistribute data across the cluster."
  - id: b
    text: "join() without a broadcast hint"
    correct: true
    explanation: "A standard join without broadcast requires both sides to be shuffled so that matching keys end up on the same partition. This is one of the most expensive shuffle operations."
  - id: c
    text: "repartition()"
    correct: true
    explanation: "repartition() explicitly triggers a full shuffle to redistribute data across the specified number of partitions, regardless of current data distribution."
  - id: d
    text: "filter()"
    correct: false
    explanation: "filter() is a narrow transformation that operates independently on each partition without requiring data movement between partitions. It never causes a shuffle."
explanation: "Identifying which operations cause shuffles is a critical Spark skill tested in interviews. Shuffles are the most expensive operations in Spark because they involve disk I/O, serialization, and network transfer. Minimizing unnecessary shuffles is the primary lever for Spark performance optimization."
---

Shuffle awareness is one of the most important skills for writing efficient Spark applications, as shuffles are typically the dominant cost in Spark jobs.
