---
title: "Spark Streaming State Management"
difficulty: "Hard"
tags: ["spark", "structured-streaming", "state-management"]
question: "What happens to the operator state when a Spark Structured Streaming query is restarted from a checkpoint?"
multi_select: false
answers:
  - id: a
    text: "State is recovered from the checkpoint and processing resumes from the last committed offset"
    correct: true
    explanation: "Structured Streaming stores both operator state (aggregation results, window state, etc.) and source offsets in the checkpoint directory. On restart, Spark recovers the state from the latest checkpoint and replays data from the last committed offset, ensuring no data is lost or double-counted."
  - id: b
    text: "State is lost and must be rebuilt from scratch, but processing resumes from the last offset"
    correct: false
    explanation: "Checkpoint directories store both offsets and operator state. If state were lost but offsets preserved, aggregation results would be incorrect because historical data before the checkpoint would not be re-aggregated."
  - id: c
    text: "State is recovered from the checkpoint, but offsets are reset to the beginning of the source"
    correct: false
    explanation: "Resetting offsets while keeping state would cause double-counting. Checkpoints store both state and offsets together to maintain consistency. Both are recovered on restart."
  - id: d
    text: "State can only be recovered if the query plan has not changed between restarts"
    correct: false
    explanation: "While certain plan changes (like changing aggregation keys) can make checkpoint recovery impossible, many changes are compatible. Adding columns, changing filter conditions, or modifying output sinks can work with existing checkpoints. The statement is too absolute."
explanation: "Checkpoint-based state recovery is what enables Structured Streaming's fault tolerance guarantees. In interviews, understanding checkpoint contents (offsets + state + metadata), recovery behavior, and checkpoint compatibility constraints demonstrates production streaming experience."
---

State management and checkpoint recovery are essential concepts for building reliable streaming pipelines that can survive failures and planned restarts.
