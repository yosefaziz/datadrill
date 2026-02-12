---
title: "Review Streaming Pipeline"
difficulty: "Hard"
tags: ["spark", "streaming", "structured streaming", "code review", "review"]
track: tools-spark-architecture
track_level: 7
track_order: 2
code: |
  from pyspark.sql import SparkSession
  from pyspark.sql.functions import col, window, sum, current_timestamp
  from pyspark.sql.types import StructType, StringType, DoubleType, TimestampType

  spark = SparkSession.builder.appName("streaming_sales").getOrCreate()

  schema = StructType() \
      .add("order_id", StringType()) \
      .add("amount", DoubleType()) \
      .add("category", StringType()) \
      .add("event_time", TimestampType())

  # Read from Kafka
  orders = (
      spark.readStream
      .format("kafka")
      .option("kafka.bootstrap.servers", "kafka:9092")
      .option("subscribe", "orders")
      .load()
      .selectExpr("CAST(value AS STRING)")
      .select(from_json(col("value"), schema).alias("data"))
      .select("data.*")
  )

  # Issue 1: Windowed aggregation
  windowed = (
      orders
      .withWatermark("event_time", "10 minutes")
      .groupBy(
          window("event_time", "1 hour", "15 minutes"),
          "category"
      )
      .agg(sum("amount").alias("hourly_total"))
  )

  # Issue 2: Join with static lookup
  categories = spark.read.parquet("s3://data/categories/")
  enriched = windowed.join(categories, "category")

  # Issue 3: Write output
  query = (
      enriched.writeStream
      .outputMode("complete")
      .format("parquet")
      .option("path", "s3://output/streaming_report/")
      .option("checkpointLocation", "s3://checkpoints/streaming_report/")
      .trigger(processingTime="1 minute")
      .start()
  )

  query.awaitTermination()
language: "python"
context: "This Structured Streaming pipeline reads order events from Kafka, computes hourly revenue by category using sliding windows, enriches with category metadata, and writes to S3. It should run continuously with at-least-once semantics."
issues:
  - id: i1
    text: "The output mode 'complete' rewrites all results on every trigger, which grows unboundedly over time"
    is_real: true
    severity: "bug"
    explanation: "With complete mode, every trigger writes the entire result table. As more windows accumulate, this grows without bound. Use 'append' mode with watermark-based window completion, or 'update' mode for partial results."
    points: 3
  - id: i2
    text: "The watermark of 10 minutes is too short for a 1-hour window with 15-minute slide"
    is_real: true
    severity: "warning"
    explanation: "A 10-minute watermark means data arriving more than 10 minutes late is dropped. For 1-hour windows, late-arriving data could miss a window that's still logically open. Consider a watermark of at least 1 hour."
    points: 3
  - id: i3
    text: "The static DataFrame join (categories) will not be refreshed as the stream runs"
    is_real: true
    severity: "warning"
    explanation: "The categories DataFrame is read once at startup. If category mappings change, the stream won't pick up updates. Consider periodically restarting or using a streaming-streaming join with a change feed."
    points: 2
  - id: i4
    text: "from_json is not imported in the code"
    is_real: true
    severity: "bug"
    explanation: "The code uses from_json() but only imports col, window, sum, and current_timestamp from pyspark.sql.functions. This will cause a NameError at runtime."
    points: 3
  - id: i5
    text: "current_timestamp is imported but never used"
    is_real: true
    severity: "minor"
    explanation: "This is a minor code quality issue. Unused imports should be removed to keep the code clean."
    points: 1
hints:
  - "Think about what happens over days or weeks of continuous operation"
  - "Consider the relationship between watermark duration, window size, and late data"
  - "Check all the imports - is anything missing or unused?"
---

Review this Structured Streaming pipeline for correctness and operational issues. Identify real problems and classify their severity.
