---
title: "Spark cache() vs persist()"
difficulty: "Easy"
tags: ["spark", "caching", "storage"]
question: "What is the difference between cache() and persist() in Spark?"
multi_select: false
answers:
  - id: a
    text: "cache() stores data in memory only, while persist() stores on disk only"
    correct: false
    explanation: "cache() actually defaults to MEMORY_AND_DISK (for DataFrames), not memory only. persist() supports multiple storage levels but is not limited to disk."
  - id: b
    text: "cache() is shorthand for persist() with the default storage level, while persist() lets you choose the storage level"
    correct: true
    explanation: "cache() is equivalent to persist(StorageLevel.MEMORY_AND_DISK) for DataFrames. persist() accepts a StorageLevel parameter that allows you to choose from options like MEMORY_ONLY, MEMORY_AND_DISK, DISK_ONLY, and their serialized variants."
  - id: c
    text: "cache() eagerly materializes data while persist() is lazy"
    correct: false
    explanation: "Both cache() and persist() are lazy - they mark the DataFrame for caching but data is not actually cached until an action triggers computation."
  - id: d
    text: "cache() works only with RDDs while persist() works with both RDDs and DataFrames"
    correct: false
    explanation: "Both cache() and persist() work with RDDs, DataFrames, and Datasets. They are available on all Spark data abstractions."
explanation: "Caching is a key performance optimization in Spark. In interviews, knowing that both are lazy, that cache() is just persist() with a default storage level, and being able to discuss when different storage levels are appropriate shows practical Spark experience."
---

Efficient caching strategy can dramatically improve Spark job performance, especially for iterative algorithms or reused DataFrames in complex pipelines.
