---
title: "Spark Structured Streaming Watermarks"
difficulty: "Medium"
tags: ["spark", "structured-streaming", "watermarks"]
question: "What is the purpose of watermarks in Spark Structured Streaming?"
multi_select: false
answers:
  - id: a
    text: "Define how long to wait for late data before finalizing window aggregations"
    correct: true
    explanation: "Watermarks tell Spark how late data can arrive relative to the maximum event time seen so far. Once the watermark passes a window's end time, that window is considered complete and its state can be dropped. This balances completeness against resource usage."
  - id: b
    text: "Track consumer offsets for exactly-once processing guarantees"
    correct: false
    explanation: "Offset tracking is handled by Spark's checkpointing mechanism, not watermarks. Checkpoints record which data has been processed, while watermarks handle late-arriving data."
  - id: c
    text: "Limit the rate at which data is read from the source"
    correct: false
    explanation: "Rate limiting is configured through source-specific options like maxOffsetsPerTrigger for Kafka. Watermarks are unrelated to ingestion rate."
  - id: d
    text: "Evict stale partitions from the executor cache"
    correct: false
    explanation: "Cache eviction is managed by Spark's memory manager based on storage pressure. Watermarks manage streaming state for window operations, not the data cache."
explanation: "Watermarks are essential for stateful streaming operations. Without them, Spark would need to keep all window state forever, eventually running out of memory. In interviews, explaining the trade-off between watermark duration, late data tolerance, and state size shows practical streaming experience."
---

Watermarks are a critical concept for building production streaming pipelines that handle late-arriving data without unbounded state growth.
