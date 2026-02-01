---
title: "OLAP vs OLTP"
difficulty: "Easy"
tags: ["databases", "fundamentals"]
question: "Which of the following is a characteristic of OLAP (Online Analytical Processing) systems?"
multi_select: false
answers:
  - id: a
    text: "Optimized for high-volume transaction processing"
    correct: false
    explanation: "This describes OLTP systems, which handle many small transactions like order processing."
  - id: b
    text: "Uses normalized schemas to minimize data redundancy"
    correct: false
    explanation: "Normalized schemas are typical of OLTP systems. OLAP systems often use denormalized schemas like star or snowflake."
  - id: c
    text: "Designed for complex analytical queries over large datasets"
    correct: true
    explanation: "OLAP systems are optimized for read-heavy analytical workloads, aggregations, and complex queries across large amounts of historical data."
  - id: d
    text: "Prioritizes write speed over read performance"
    correct: false
    explanation: "OLAP systems prioritize read performance for analytics. OLTP systems focus more on write performance for transactions."
explanation: "OLAP systems (like data warehouses) are designed for business intelligence and analytics, while OLTP systems (like operational databases) handle day-to-day transactions. Understanding when to use each is crucial for data architecture."
---

OLAP and OLTP represent two fundamentally different approaches to data management.
