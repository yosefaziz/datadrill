---
title: "Spark Driver and Executor Roles"
difficulty: "Easy"
tags: ["spark", "architecture", "cluster"]
question: "In Apache Spark, what is the primary role of the Driver program?"
multi_select: false
answers:
  - id: a
    text: "Store cached data and intermediate shuffle files"
    correct: false
    explanation: "Executors are responsible for storing cached data and intermediate shuffle files, not the Driver."
  - id: b
    text: "Coordinate task execution and maintain the SparkContext across the cluster"
    correct: true
    explanation: "The Driver runs the main() function, creates the SparkContext, builds the DAG of stages, and schedules tasks on executors. It is the central coordinator of a Spark application."
  - id: c
    text: "Manage cluster resources and allocate containers to applications"
    correct: false
    explanation: "Resource management is the responsibility of the cluster manager (YARN, Mesos, or Kubernetes), not the Driver."
  - id: d
    text: "Perform data transformations and actions on partitions"
    correct: false
    explanation: "Executors perform the actual computation on data partitions. The Driver coordinates but does not execute data transformations."
explanation: "Understanding the Driver vs. Executor distinction is fundamental in Spark interviews. The Driver is the control plane that plans and schedules work, while Executors are the data plane that performs computation. Knowing this helps explain common issues like Driver OOM errors from collecting too much data."
---

The separation between Driver and Executor roles is a core concept in Spark's distributed execution model and frequently tested in data engineering interviews.
