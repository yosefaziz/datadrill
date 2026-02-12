---
title: "Spark Batch vs Streaming"
difficulty: "Easy"
tags: ["spark", "batch", "streaming", "fundamentals"]
question: "When should you choose batch processing over streaming in Spark?"
multi_select: false
answers:
  - id: a
    text: "When you need to process large volumes of historical data on a schedule and latency of minutes to hours is acceptable"
    correct: true
    explanation: "Batch processing (Spark SQL, DataFrames) is ideal for scheduled jobs like nightly aggregations or backfills where you process all data at once. It is simpler to build, test, and debug than streaming, and throughput is typically higher since Spark can optimize the full query plan upfront."
  - id: b
    text: "When you need results updated within seconds of new events arriving"
    correct: false
    explanation: "Near-real-time requirements call for streaming (Structured Streaming). Batch jobs run on a schedule and cannot react to individual events as they arrive."
  - id: c
    text: "When working with any dataset larger than 1TB"
    correct: false
    explanation: "Dataset size alone does not determine the choice. Both batch and streaming handle large data. The deciding factor is latency requirements and whether you need continuous or scheduled processing."
  - id: d
    text: "Batch is legacy and streaming should always be preferred in modern pipelines"
    correct: false
    explanation: "Batch processing remains the backbone of most data platforms. Many workloads like daily reports, ML feature generation, and historical backfills are naturally batch. Streaming adds complexity and is only justified when low-latency results are required."
explanation: "Understanding when to use batch vs streaming is a fundamental architecture decision. Batch (Spark SQL) processes bounded datasets on a schedule with higher throughput and simpler debugging. Streaming (Structured Streaming) processes unbounded event streams for near-real-time results. Most production platforms use both - batch for heavy aggregations and backfills, streaming for time-sensitive metrics like trending lists or fraud detection."
---

Choosing between batch and streaming is one of the most common Spark architecture decisions in data engineering interviews. Spark supports both through Spark SQL for batch and Structured Streaming for real-time processing, often using the same DataFrame API.
