---
title: "Spark Shuffle Internals"
difficulty: "Hard"
tags: ["spark", "shuffle", "internals"]
question: "During a Spark shuffle, what happens between the map and reduce phases?"
multi_select: false
answers:
  - id: a
    text: "Map tasks write sorted, partitioned data to local disk; reduce tasks fetch their partitions from map task nodes over the network"
    correct: true
    explanation: "In the map phase, each task sorts its output by the reduce partition ID and writes it to local disk files (one per reducer or consolidated). In the reduce phase, tasks fetch their assigned partitions from all map task locations over the network. The shuffle manager (SortShuffleManager) coordinates this exchange using the Driver's MapOutputTracker to locate data."
  - id: b
    text: "Map tasks write shuffle data to HDFS or S3 so reduce tasks can read from distributed storage"
    correct: false
    explanation: "Shuffle data is always written to local disk on the executor's node, not to distributed storage like HDFS or S3. This is why losing an executor before shuffle read completes requires recomputing the map stage."
  - id: c
    text: "Map tasks send data directly to reduce tasks via TCP without any disk writes"
    correct: false
    explanation: "Spark always writes shuffle data to local disk before it is fetched by reduce tasks. This design choice provides fault tolerance (data survives task failures) and handles cases where shuffle data exceeds memory. The disk write is a deliberate design decision, not a limitation."
  - id: d
    text: "The Driver collects all shuffle data and redistributes it to reduce tasks"
    correct: false
    explanation: "Shuffle data flows directly between executors (map node to reduce node) without passing through the Driver. The Driver only stores metadata about which executors hold which shuffle blocks. Routing data through the Driver would create a massive bottleneck."
explanation: "Understanding shuffle internals helps explain many Spark performance characteristics: why local disk I/O matters, why losing executors causes stage recomputation, and why the external shuffle service exists. This is senior-level knowledge that interviewers use to assess depth of understanding."
---

Shuffle is the most performance-critical operation in Spark, and understanding its internal mechanics is essential for diagnosing and resolving production performance issues.
