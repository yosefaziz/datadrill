---
title: "Batch vs Stream Processing"
difficulty: "Easy"
tags: ["batch", "streaming", "fundamentals"]
question: "Which processing paradigm is best suited for generating a daily sales report from yesterday's transactions?"
multi_select: false
answers:
  - id: a
    text: "Stream processing with Apache Flink"
    correct: false
    explanation: "While Flink can do batch, stream processing is designed for continuous data, not bounded historical datasets."
  - id: b
    text: "Batch processing with Apache Spark"
    correct: true
    explanation: "Daily reports on historical data are a classic batch use case. The data is bounded (yesterday's transactions) and doesn't need real-time updates."
  - id: c
    text: "Real-time processing with Apache Storm"
    correct: false
    explanation: "Storm is for real-time stream processing. A daily report doesn't require sub-second latency."
  - id: d
    text: "In-memory caching with Redis"
    correct: false
    explanation: "Redis is a cache/data store, not a processing engine for generating reports."
explanation: "Batch processing is ideal for bounded datasets where latency isn't critical. Stream processing is better when you need continuous, low-latency results on unbounded data."
---

Choosing between batch and stream processing depends on your latency requirements and data characteristics.
