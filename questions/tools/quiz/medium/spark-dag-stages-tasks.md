---
title: "Spark DAG Stages and Tasks"
difficulty: "Medium"
tags: ["spark", "dag", "stages"]
question: "How does Spark determine stage boundaries when executing a job?"
multi_select: false
answers:
  - id: a
    text: "At shuffle operations caused by wide transformations"
    correct: true
    explanation: "Spark breaks the DAG into stages at shuffle boundaries. Wide transformations like groupBy, join, and repartition require data exchange between partitions, creating a new stage. Narrow transformations like map and filter are pipelined within a single stage."
  - id: b
    text: "At every transformation in the DAG"
    correct: false
    explanation: "Narrow transformations (map, filter, select) are pipelined together within a single stage. Only wide transformations that require shuffles create stage boundaries."
  - id: c
    text: "Based on available memory and executor resources"
    correct: false
    explanation: "Stage boundaries are determined by the logical structure of the computation (shuffle dependencies), not by physical resources. Resource constraints affect parallelism within stages, not stage boundaries."
  - id: d
    text: "Based on user-defined stage annotations in the code"
    correct: false
    explanation: "Spark automatically determines stage boundaries from the dependency graph. There is no API for users to manually define stage boundaries."
explanation: "Understanding how Spark constructs stages from the DAG is essential for debugging performance issues. In interviews, being able to trace a query through its stages, identify shuffle boundaries, and explain why certain operations trigger new stages shows deep Spark knowledge."
---

The relationship between DAG structure, stage boundaries, and shuffle operations is central to understanding Spark job execution and performance characteristics.
