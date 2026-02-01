---
title: "Design a Streaming Data Pipeline"
difficulty: "Medium"
tags: ["streaming", "pipeline", "real-time"]
prompt: |
  A fintech startup says they need a "streaming pipeline" for their trading platform. They want to process financial transactions and detect fraud in real-time.

  What questions would you ask before proposing a streaming architecture?

clarifying_questions:
  - id: q1
    text: "What is the acceptable latency for fraud detection?"
    category: crucial
    reveals:
      constraint: latency
      value: "sub-second"
  - id: q2
    text: "How many transactions per second do you need to handle?"
    category: crucial
    reveals:
      constraint: throughput
      value: "10000 TPS"
  - id: q3
    text: "What happens if the system goes down - can you lose messages?"
    category: crucial
    reveals:
      constraint: durability
      value: "zero message loss"
  - id: q4
    text: "Do you need exactly-once processing guarantees?"
    category: crucial
    reveals:
      constraint: semantics
      value: "exactly-once required"
  - id: q5
    text: "What's your team's experience with streaming technologies?"
    category: helpful
    reveals:
      constraint: expertise
      value: "limited Kafka experience"
  - id: q6
    text: "Do you need to join streaming data with historical data?"
    category: helpful
    reveals:
      constraint: historical_join
      value: "yes for ML models"
  - id: q7
    text: "What cloud provider are you using?"
    category: helpful
    reveals:
      constraint: cloud
      value: "AWS"
  - id: q8
    text: "What font should error messages use?"
    category: irrelevant
  - id: q9
    text: "Should we use tabs or spaces in the code?"
    category: irrelevant
  - id: q10
    text: "What's the company's favorite color for monitoring dashboards?"
    category: irrelevant

architecture_options:
  - id: kafka-flink
    name: "Kafka + Apache Flink"
    description: "Kafka for message durability, Flink for stateful stream processing. Strong exactly-once guarantees."
    valid_when:
      - constraint: durability
        value: "zero message loss"
      - constraint: semantics
        value: "exactly-once required"
    feedback_if_wrong: "Kafka + Flink is designed for exactly-once processing with strong durability. Without confirming these are requirements, you might be overcomplicating the architecture."
  - id: kinesis-lambda
    name: "AWS Kinesis + Lambda"
    description: "Fully managed AWS streaming with serverless compute. Easy to set up but limited processing guarantees."
    valid_when:
      - constraint: cloud
        value: "AWS"
    feedback_if_wrong: "Kinesis + Lambda is simpler but offers at-least-once semantics by default. If exactly-once is required, this may not be sufficient."
  - id: kafka-streams
    name: "Kafka Streams"
    description: "Library for stream processing that runs as part of your application. Lower operational overhead than Flink."
    valid_when:
      - constraint: durability
        value: "zero message loss"
    feedback_if_wrong: "Kafka Streams is good for durability but exactly-once semantics require careful configuration. Make sure you understand the processing requirements."
  - id: pulsar
    name: "Apache Pulsar"
    description: "Unified messaging and streaming platform. Multi-tenancy and geo-replication built-in."
    valid_when: []
    feedback_if_wrong: "Pulsar is powerful but adds complexity. Without specific requirements for its unique features, simpler options may be better."

max_questions: 3
---

# Design a Streaming Data Pipeline

Financial systems have strict requirements around data processing. This scenario tests whether you ask about the critical guarantees needed before choosing a streaming architecture.

## Guidance

For streaming architectures, focus on:
- **Processing guarantees**: At-least-once vs exactly-once
- **Durability**: Can you afford to lose messages?
- **Latency requirements**: Seconds, milliseconds, or sub-millisecond?
- **Throughput**: Messages per second at peak
- **Avoid**: Style or preference questions that don't affect architecture
