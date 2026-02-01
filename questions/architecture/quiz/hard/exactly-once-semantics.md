---
title: "Exactly-Once Semantics in Streaming"
difficulty: "Hard"
tags: ["streaming", "kafka", "flink", "semantics"]
question: "Which of the following correctly describe how exactly-once semantics can be achieved in stream processing? Select all that apply."
multi_select: true
answers:
  - id: a
    text: "Idempotent producers combined with transactional consumers"
    correct: true
    explanation: "Kafka achieves exactly-once through idempotent producers (preventing duplicates) and transactional writes that atomically commit offsets with output."
  - id: b
    text: "Checkpointing with two-phase commit protocols"
    correct: true
    explanation: "Flink uses distributed snapshots (Chandy-Lamport) with two-phase commit to external systems for end-to-end exactly-once guarantees."
  - id: c
    text: "Simply retrying failed messages until they succeed"
    correct: false
    explanation: "Retrying without deduplication gives at-least-once semantics, potentially causing duplicates."
  - id: d
    text: "Using TCP for reliable message delivery"
    correct: false
    explanation: "TCP ensures delivery at the network level but doesn't prevent application-level duplicates from retries or failures."
  - id: e
    text: "Deduplication using unique message IDs in the sink"
    correct: true
    explanation: "Sink-side deduplication with unique IDs (idempotent writes) is a valid pattern for achieving effective exactly-once."
explanation: "True exactly-once semantics requires coordination between source, processing, and sink. Different systems achieve this through various mechanisms: Kafka uses idempotent producers + transactions, Flink uses checkpointing + 2PC, and many systems rely on idempotent sinks."
---

Exactly-once semantics is one of the most challenging guarantees in distributed stream processing.
