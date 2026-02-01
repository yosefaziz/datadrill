---
title: "Apache Kafka Use Cases"
difficulty: "Medium"
tags: ["kafka", "streaming", "messaging"]
question: "Which of the following are valid use cases for Apache Kafka? Select all that apply."
multi_select: true
answers:
  - id: a
    text: "Real-time event streaming between microservices"
    correct: true
    explanation: "Kafka excels at decoupling microservices through event-driven architecture with high throughput."
  - id: b
    text: "Log aggregation from multiple application servers"
    correct: true
    explanation: "Kafka was originally built at LinkedIn for log aggregation and remains excellent for this use case."
  - id: c
    text: "Complex JOIN operations across multiple tables"
    correct: false
    explanation: "Kafka is not a database. Complex JOINs should be done in databases or stream processing engines like Flink/ksqlDB."
  - id: d
    text: "Change Data Capture (CDC) from databases"
    correct: true
    explanation: "Kafka Connect with Debezium is widely used for CDC, capturing database changes as events."
  - id: e
    text: "Storing frequently accessed data for sub-millisecond reads"
    correct: false
    explanation: "Kafka is not designed for random access reads. Use Redis or similar for low-latency key-value lookups."
explanation: "Kafka is a distributed streaming platform best suited for high-throughput, fault-tolerant, publish-subscribe messaging. It's not a replacement for databases or caches."
---

Apache Kafka has become a cornerstone of modern data architectures, but understanding its appropriate use cases is essential.
