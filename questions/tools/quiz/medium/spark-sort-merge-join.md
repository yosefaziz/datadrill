---
title: "Spark Join Strategy for Large DataFrames"
difficulty: "Medium"
tags: ["spark", "joins", "sort-merge"]
question: "What is the default join strategy Spark uses when joining two large DataFrames?"
multi_select: false
answers:
  - id: a
    text: "Sort-Merge Join"
    correct: true
    explanation: "For two large DataFrames, Spark defaults to Sort-Merge Join. Both sides are shuffled by the join key, sorted within each partition, and then merged. This strategy handles large datasets efficiently because it only requires sequential scans after sorting."
  - id: b
    text: "Shuffle Hash Join"
    correct: false
    explanation: "Shuffle Hash Join is used when one side is significantly smaller than the other (but too large for broadcast). It is not the default - Spark prefers Sort-Merge Join because it handles larger datasets more reliably without risking OOM from building hash tables."
  - id: c
    text: "Broadcast Nested Loop Join"
    correct: false
    explanation: "Broadcast Nested Loop Join is only used for non-equi joins (joins without an equality condition) when one side can be broadcast. It is not the default strategy for equi-joins between large tables."
  - id: d
    text: "Broadcast Hash Join"
    correct: false
    explanation: "Broadcast Hash Join is used when one side fits in memory (below spark.sql.autoBroadcastJoinThreshold). For two large DataFrames, neither side can be broadcast, so this strategy is not applicable."
explanation: "Join strategy selection is a critical topic in Spark interviews. Sort-Merge Join is the default for large-to-large joins because it scales well and avoids building large hash tables. Knowing when Spark chooses each join strategy helps with query plan analysis and performance tuning."
---

Understanding Spark's join strategies and when each is applied is essential for optimizing the most expensive operations in data pipelines.
