---
title: "Broadcast Join vs Shuffle Join"
difficulty: "Medium"
tags: ["spark", "joins", "broadcast", "shuffle", "tradeoff"]
track: tools-spark-architecture
track_level: 5
track_order: 1
prompt: |
  You have two DataFrames to join:
  - **orders**: 500 million rows, 50GB, partitioned by order_date
  - **products**: 10,000 rows, 5MB, partitioned by product_id

  The join key is product_id. Your cluster has 100 executors with 4GB memory each.
  You need to join these for a daily aggregation report.

  Which join strategy should you use?
options:
  - id: broadcast
    name: "Broadcast Hash Join"
    description: "Broadcast the smaller DataFrame to all executors, then join locally on each partition."
    correct: true
    feedback: "Correct! The products table at 5MB is well under the broadcast threshold (default 10MB). Broadcasting avoids a 50GB shuffle of the orders table, saving significant network I/O and time."
  - id: shuffle
    name: "Sort-Merge Shuffle Join"
    description: "Shuffle both DataFrames by the join key, sort, then merge matching partitions."
    correct: false
    feedback: "A shuffle join would work but is inefficient here. It would shuffle the entire 50GB orders table across the network. Since products is only 5MB, broadcasting it avoids this massive shuffle entirely."
  - id: bucket
    name: "Bucket Join"
    description: "Pre-bucket both tables by product_id and read them with matching bucket counts."
    correct: false
    feedback: "Bucketing is useful for repeated joins on the same key, but it requires upfront work to rewrite both tables. For a one-time join with a small lookup table, broadcast is simpler and faster."
justifications:
  - id: j1
    text: "The smaller table fits easily in executor memory (5MB << 4GB)"
    valid_for: ["broadcast"]
    points: 3
  - id: j2
    text: "Avoids shuffling the 50GB orders table across the network"
    valid_for: ["broadcast"]
    points: 3
  - id: j3
    text: "Broadcast threshold default is 10MB and our table is 5MB"
    valid_for: ["broadcast"]
    points: 2
  - id: j4
    text: "Both tables are already partitioned by the join key"
    valid_for: []
    points: -2
  - id: j5
    text: "Sort-merge is always faster for large-to-small joins"
    valid_for: []
    points: -2
  - id: j6
    text: "Network I/O is the main bottleneck for joins at this scale"
    valid_for: ["broadcast"]
    points: 2
max_justifications: 4
hints:
  - "Consider the sizes of both tables relative to executor memory"
  - "What is the cost of shuffling 50GB vs broadcasting 5MB?"
  - "Spark's auto-broadcast threshold is 10MB by default"
---

Choose the optimal join strategy and select the justifications that best support your choice.
