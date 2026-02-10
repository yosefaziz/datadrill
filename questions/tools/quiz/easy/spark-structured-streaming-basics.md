---
title: "Spark Structured Streaming Basics"
difficulty: "Easy"
tags: ["spark", "structured-streaming", "streaming"]
question: "How does Spark Structured Streaming process data?"
multi_select: false
answers:
  - id: a
    text: "It treats the stream as an unbounded table and processes data in micro-batches"
    correct: true
    explanation: "Structured Streaming models incoming data as new rows appended to an unbounded input table. By default, it processes these rows in micro-batches, though a continuous processing mode also exists for lower latency."
  - id: b
    text: "It processes each record individually as it arrives for the lowest possible latency"
    correct: false
    explanation: "Per-record processing describes systems like Apache Flink's default model. Spark Structured Streaming uses micro-batch processing by default, trading some latency for higher throughput."
  - id: c
    text: "It loads all streaming data into memory before processing any of it"
    correct: false
    explanation: "Structured Streaming processes data incrementally in micro-batches. It does not wait to load all data into memory, which would be impossible for an unbounded stream."
  - id: d
    text: "It uses a completely separate API from batch DataFrames requiring different code"
    correct: false
    explanation: "One of Structured Streaming's key advantages is that it uses the same DataFrame and Dataset API as batch processing. You can reuse most batch logic for streaming with minimal changes."
explanation: "Structured Streaming's 'unbounded table' model is a core concept that interviewers test. Understanding that it unifies batch and streaming APIs while using micro-batch execution by default helps explain both its strengths and latency trade-offs compared to native streaming engines."
---

Structured Streaming is Spark's approach to stream processing and is widely used in production data pipelines for near-real-time analytics and ETL.
