---
title: "Real-time Leaderboard"
difficulty: "Medium"
tags: ["streaming", "leaderboard", "gaming"]
prompt: |
  Design a real-time leaderboard for a mobile gaming app.

  Requirements:
  - Handle 50,000 score updates per second during peak hours
  - Leaderboard should update every 10 seconds
  - Show top 100 players with their ranks
  - Minimize infrastructure costs
  - 99.9% availability requirement

available_components:
  - kafka
  - api-gateway
  - direct-db
  - flink
  - spark-streaming
  - batch-etl
  - redis
  - postgres
  - snowflake

steps:
  - id: ingestion
    name: "Ingestion Layer"
    description: "How will you receive 50k score updates per second?"
    valid_choices:
      - component: kafka
        feedback: "Kafka handles high-throughput writes with durability and can buffer traffic spikes. Its partitioning allows horizontal scaling."
    partial_choices:
      - component: api-gateway
        feedback: "API Gateway can work but you'll need significant infrastructure to handle 50k writes/sec. Consider a message queue for buffering."
    invalid_choices:
      - component: direct-db
        feedback: "Direct database writes at 50k/sec will overwhelm most databases and create a bottleneck. Use a message queue for buffering."

  - id: processing
    name: "Processing Layer"
    description: "How will you aggregate scores every 10 seconds?"
    valid_choices:
      - component: flink
        feedback: "Flink's tumbling windows are perfect for 10-second aggregation. Low latency and exactly-once semantics make it ideal for accurate leaderboards."
    partial_choices:
      - component: spark-streaming
        feedback: "Spark Streaming works but its micro-batch model may add latency. Consider Flink for lower latency requirements."
    invalid_choices:
      - component: batch-etl
        feedback: "Batch ETL runs on schedules (hourly/daily), which is too slow for 10-second updates. Use stream processing instead."

  - id: serving
    name: "Serving Layer"
    description: "Where will you store and serve the leaderboard?"
    valid_choices:
      - component: redis
        feedback: "Redis sorted sets (ZSET) are designed for leaderboards. O(log N) insertions and O(log N + M) range queries make it extremely fast."
    partial_choices:
      - component: postgres
        feedback: "PostgreSQL can work with proper indexing, but Redis sorted sets are purpose-built for leaderboard access patterns and will be faster."
    invalid_choices:
      - component: snowflake
        feedback: "Snowflake is a data warehouse optimized for analytics, not real-time serving. Query latency would be too high for a gaming leaderboard."
---

# Real-time Leaderboard

Build a data pipeline for a gaming leaderboard that updates in near real-time.

The key challenges are:
- **High write throughput**: 50k updates/sec requires careful buffering
- **Low latency updates**: 10-second refresh means stream processing
- **Fast reads**: Gamers expect instant leaderboard loads

## Guidance

Consider these factors when selecting components:
- **Ingestion**: How do you buffer 50k writes/sec without data loss?
- **Processing**: What's the difference between batch and stream processing for 10-second windows?
- **Serving**: Which data structures are optimized for ranked data retrieval?
