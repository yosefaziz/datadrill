---
title: "CAP Theorem Basics"
difficulty: "Easy"
tags: ["distributed-systems", "fundamentals"]
question: "According to the CAP theorem, a distributed system can guarantee at most two of which three properties?"
multi_select: false
answers:
  - id: a
    text: "Consistency, Availability, Partition Tolerance"
    correct: true
    explanation: "The CAP theorem states that in a distributed system, you can only guarantee two of: Consistency (all nodes see the same data), Availability (every request receives a response), and Partition Tolerance (system continues despite network failures)."
  - id: b
    text: "Consistency, Accuracy, Performance"
    correct: false
    explanation: "This is not the CAP theorem. CAP stands for Consistency, Availability, and Partition Tolerance."
  - id: c
    text: "Concurrency, Availability, Persistence"
    correct: false
    explanation: "These are not the three properties of the CAP theorem."
  - id: d
    text: "Caching, Authentication, Partitioning"
    correct: false
    explanation: "These are unrelated concepts, not the CAP theorem properties."
explanation: "The CAP theorem, proposed by Eric Brewer, is fundamental to understanding distributed systems trade-offs. In practice, since network partitions can always happen, systems must choose between CP (consistency over availability during partitions) or AP (availability over consistency during partitions)."
---

Understanding the CAP theorem is essential for making informed decisions about distributed database and system design.
