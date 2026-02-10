---
title: "Spark Structured Streaming Output Modes"
difficulty: "Medium"
tags: ["spark", "structured-streaming", "output-modes"]
question: "When should you use 'update' output mode instead of 'append' in Structured Streaming?"
multi_select: false
answers:
  - id: a
    text: "When performing aggregations and you want only changed rows emitted each micro-batch"
    correct: true
    explanation: "Update mode emits only the rows that were updated since the last trigger, making it efficient for aggregations where you want incremental results. Append mode cannot be used with aggregations without watermarks because aggregate results can change as new data arrives."
  - id: b
    text: "When you need the complete aggregated table written every micro-batch"
    correct: false
    explanation: "Writing the complete result table every trigger is 'complete' mode, not 'update' mode. Complete mode rewrites the entire result each time, which is suitable for dashboards but expensive for large state."
  - id: c
    text: "When performing simple transformations like filter and select without aggregations"
    correct: false
    explanation: "For simple transformations without aggregations, 'append' mode is typically the right choice since each input row produces exactly one output row that never changes."
  - id: d
    text: "When you need exactly-once delivery guarantees at the sink"
    correct: false
    explanation: "Exactly-once guarantees depend on the combination of source, checkpointing, and sink capabilities, not the output mode. All three output modes can participate in exactly-once processing with the right configuration."
explanation: "Output mode selection is a practical Structured Streaming design decision tested in interviews. Append works for simple transforms, update is efficient for aggregations when you only need changes, and complete is for full result rewrites. Choosing wrong can cause errors or poor performance."
---

Selecting the correct output mode is fundamental to Structured Streaming application design and directly affects both correctness and performance.
