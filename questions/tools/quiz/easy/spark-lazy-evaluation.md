---
title: "Spark Lazy Evaluation"
difficulty: "Easy"
tags: ["spark", "lazy-evaluation", "fundamentals"]
question: "What does 'lazy evaluation' mean in Apache Spark?"
multi_select: false
answers:
  - id: a
    text: "Transformations are recorded but not executed until an action is called"
    correct: true
    explanation: "Spark builds a DAG (directed acyclic graph) of transformations but delays execution until an action like collect(), count(), or write() triggers actual computation. This allows Spark to optimize the entire pipeline before running it."
  - id: b
    text: "Spark delays execution until sufficient cluster resources become available"
    correct: false
    explanation: "Resource scheduling is handled by the cluster manager. Lazy evaluation refers to when transformations are executed, not resource availability."
  - id: c
    text: "Data is loaded into memory on-demand rather than all at once"
    correct: false
    explanation: "While Spark does process partitions incrementally, lazy evaluation specifically refers to the deferred execution of transformations until an action is triggered, not data loading strategy."
  - id: d
    text: "Spark processes the minimum number of partitions needed for each operation"
    correct: false
    explanation: "Partition pruning is a separate optimization. Lazy evaluation means the entire transformation pipeline is deferred until an action requires a result."
explanation: "Lazy evaluation is one of Spark's most important concepts. It enables the Catalyst optimizer to see the full query plan before execution, allowing optimizations like predicate pushdown and stage fusion. Interviewers often test whether candidates understand that transformations return immediately without doing work."
---

Lazy evaluation is foundational to how Spark optimizes execution plans and is one of the first concepts interviewers explore when assessing Spark knowledge.
