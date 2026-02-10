---
title: "Spark Partition Strategy Selection"
difficulty: "Hard"
tags: ["spark", "partitioning", "data-layout"]
question: "You are writing a large DataFrame to a data lake that will be frequently queried by date and region. What is the best partitioning strategy?"
multi_select: false
answers:
  - id: a
    text: "Use partitionBy('date') for directory-level partitioning with bucketBy on 'region' for file-level organization"
    correct: true
    explanation: "partitionBy('date') creates a directory structure that enables partition pruning on date filters, which is the highest-cardinality filter. bucketBy('region') organizes data within each date partition into fixed buckets by region, enabling predicate pushdown and avoiding shuffles for region-based joins. This two-level strategy balances pruning efficiency with file count."
  - id: b
    text: "Use partitionBy('date', 'region') for both columns"
    correct: false
    explanation: "Partitioning by both columns creates a directory per date-region combination. With many dates and regions, this produces an explosion of small files and directories (e.g., 365 days x 50 regions = 18,250 directories), degrading listing performance and creating the small file problem."
  - id: c
    text: "Use repartition('date', 'region') before writing without partitionBy"
    correct: false
    explanation: "repartition() controls the number of output files but does not create a partitioned directory structure. Without partitionBy, the query engine cannot prune irrelevant files based on date or region, forcing full table scans."
  - id: d
    text: "Use Z-order indexing on both date and region columns"
    correct: false
    explanation: "Z-ordering is a data clustering technique that interleaves sort orders, useful for columns without a clear hierarchy. However, date is a natural partition key with high pruning value, and Z-ordering alone does not provide the directory-level partition pruning that partitionBy enables for predicate pushdown."
explanation: "Partitioning strategy has enormous impact on query performance at scale. In interviews, demonstrating knowledge of the small file problem, partition pruning, bucketing, and when to combine strategies shows the practical experience needed for designing efficient data lake layouts."
---

Choosing the right partitioning strategy is one of the most impactful decisions in data lake design and directly affects query performance, storage costs, and write throughput.
