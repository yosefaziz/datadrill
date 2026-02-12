---
title: "Repartition Strategy for Skewed Data"
difficulty: "Hard"
tags: ["spark", "repartition", "skew", "partitions", "tradeoff"]
track: tools-spark-architecture
track_level: 5
track_order: 2
prompt: |
  You have a DataFrame of user events with severe data skew:
  - **Total rows**: 2 billion
  - **Partition count**: 200 (default shuffle partitions)
  - **Skew**: 40% of all rows have `country = "US"`, creating a hot partition
  - **Downstream**: You need to run a `groupBy("country").agg(...)` followed by a join with a country metadata table (200 rows)

  The US partition is causing OOM errors on executors (8GB each).
  Which repartitioning strategy should you use?
options:
  - id: salt
    name: "Salted Repartition"
    description: "Add a random salt column, repartition by (country, salt), aggregate in two stages, then remove the salt."
    correct: true
    feedback: "Correct! Salting splits the hot US partition across multiple reducers. The two-stage aggregation (partial agg with salt, then final agg without) handles the skew while producing correct results."
  - id: increase
    name: "Increase Partition Count"
    description: "Set spark.sql.shuffle.partitions to 2000 to distribute data more evenly."
    correct: false
    feedback: "Increasing partitions helps somewhat but doesn't address the fundamental skew. The US rows still all hash to the same partitions since the key is still 'country'. You'd need ~800 partitions just for US data, wasting resources for the other countries."
  - id: custom
    name: "Custom Partitioner"
    description: "Implement a custom partitioner that splits US data across 10 partitions and uses default hashing for others."
    correct: false
    feedback: "Custom partitioners work in RDD API but don't integrate cleanly with DataFrame operations. The salting approach achieves the same effect using standard DataFrame APIs and works with Catalyst optimizer."
  - id: filter
    name: "Filter and Union"
    description: "Process US rows and non-US rows separately, then union the results."
    correct: false
    feedback: "This works but requires reading the data twice and managing two separate processing paths. Salting is more elegant and handles the skew in a single pass through the data."
justifications:
  - id: j1
    text: "Salting distributes the hot key across multiple partitions without changing the logical grouping"
    valid_for: ["salt"]
    points: 3
  - id: j2
    text: "Two-stage aggregation (partial then final) preserves correctness while enabling parallelism"
    valid_for: ["salt"]
    points: 3
  - id: j3
    text: "Works with Spark's Catalyst optimizer and DataFrame API"
    valid_for: ["salt"]
    points: 2
  - id: j4
    text: "Increasing partitions guarantees even distribution for any key"
    valid_for: []
    points: -2
  - id: j5
    text: "The approach handles OOM by reducing max partition size"
    valid_for: ["salt", "filter"]
    points: 2
  - id: j6
    text: "Custom partitioners provide the most control over data placement"
    valid_for: ["custom"]
    points: 1
max_justifications: 4
hints:
  - "The core issue is that one key ('US') has too many rows for a single partition"
  - "You need a technique that splits one logical key across multiple physical partitions"
  - "Think about how to aggregate correctly when data for one key is split"
---

A data pipeline is failing with OOM errors due to data skew. Choose the best repartitioning strategy and justify your decision.
