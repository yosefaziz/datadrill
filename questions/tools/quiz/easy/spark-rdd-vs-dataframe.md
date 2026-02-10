---
title: "Spark RDD vs DataFrame"
difficulty: "Easy"
tags: ["spark", "dataframe", "rdd"]
question: "What is the main advantage of Spark DataFrames over RDDs?"
multi_select: false
answers:
  - id: a
    text: "DataFrames can process data in a distributed manner while RDDs cannot"
    correct: false
    explanation: "Both RDDs and DataFrames process data in a distributed manner across the cluster. Distributed processing is a core feature of all Spark abstractions."
  - id: b
    text: "DataFrames benefit from the Catalyst optimizer for automatic query optimization"
    correct: true
    explanation: "DataFrames use a schema-aware API that enables the Catalyst optimizer to apply automatic optimizations like predicate pushdown, column pruning, and join reordering. RDDs are opaque to the optimizer since they use arbitrary lambda functions."
  - id: c
    text: "DataFrames can handle larger datasets than RDDs"
    correct: false
    explanation: "Both RDDs and DataFrames can handle the same scale of data. The advantage of DataFrames is optimization, not capacity."
  - id: d
    text: "RDDs have been deprecated and DataFrames are the only supported API"
    correct: false
    explanation: "RDDs are not deprecated. They remain the low-level foundation of Spark and are appropriate for certain use cases like fine-grained control over physical data placement."
explanation: "The Catalyst optimizer is what makes DataFrames significantly faster than RDDs for most workloads. In interviews, being able to explain why DataFrames outperform RDDs - automatic optimizations rather than just a different API - demonstrates understanding of Spark internals."
---

Knowing when to use DataFrames vs RDDs and understanding the role of the Catalyst optimizer is essential for writing performant Spark applications.
