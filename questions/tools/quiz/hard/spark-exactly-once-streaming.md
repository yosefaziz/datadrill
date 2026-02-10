---
title: "Spark Exactly-Once Streaming Semantics"
difficulty: "Hard"
tags: ["spark", "structured-streaming", "exactly-once"]
question: "How does Spark Structured Streaming achieve exactly-once processing guarantees?"
multi_select: false
answers:
  - id: a
    text: "Replayable sources combined with idempotent sinks and checkpointed offsets"
    correct: true
    explanation: "Exactly-once requires three coordinated components: replayable sources (like Kafka) that can re-read data from specific offsets, checkpointed offsets that track which data has been processed, and idempotent sinks that produce the same result when writing the same data multiple times. On failure, Spark replays from the last checkpoint, and idempotent writes prevent duplicates."
  - id: b
    text: "Distributed transactions that atomically commit across all executors"
    correct: false
    explanation: "Spark does not use distributed transactions across executors for exactly-once semantics. The overhead of distributed transactions would be prohibitive at scale. Instead, it relies on the replay-checkpoint-idempotent pattern."
  - id: c
    text: "Deduplicating every record using unique IDs before processing"
    correct: false
    explanation: "Per-record deduplication is expensive and not how Structured Streaming achieves exactly-once. While dropDuplicates() exists for application-level dedup, the system-level guarantee comes from replayable sources and checkpointing."
  - id: d
    text: "Buffering all data in memory until processing is confirmed successful"
    correct: false
    explanation: "In-memory buffering would limit throughput, risk data loss on failures, and not scale. Structured Streaming relies on source replayability rather than buffering to recover from failures."
explanation: "Exactly-once semantics is a nuanced topic in streaming systems. The key insight is that it requires end-to-end coordination between source, engine, and sink. Interviewers often probe whether candidates understand that exactly-once is not a property of the engine alone but of the entire pipeline."
---

Exactly-once processing guarantees are among the most important and misunderstood concepts in streaming architectures, making this a high-value interview topic for senior data engineers.
