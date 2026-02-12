---
title: "Review Inefficient Spark Job"
difficulty: "Medium"
tags: ["spark", "code review", "performance", "review"]
track: tools-spark-architecture
track_level: 7
track_order: 1
code: |
  from pyspark.sql import SparkSession
  from pyspark.sql.functions import col, sum, count, broadcast

  spark = SparkSession.builder.appName("daily_report").getOrCreate()

  # Read data
  orders = spark.read.parquet("s3://data/orders/")        # 500M rows, 50GB
  products = spark.read.parquet("s3://data/products/")     # 10K rows, 5MB
  customers = spark.read.parquet("s3://data/customers/")   # 2M rows, 1GB

  # Issue 1
  order_count = orders.count()
  print(f"Processing {order_count} orders")

  # Issue 2
  enriched = orders.join(products, "product_id")
  enriched = enriched.join(customers, "customer_id")

  # Issue 3
  result = enriched.groupBy("category", "region").agg(
      sum("amount").alias("total"),
      count("*").alias("orders")
  )

  # Issue 4
  result.write.mode("overwrite").parquet("s3://output/report/")

  top_categories = result.orderBy(col("total").desc()).limit(10)
  top_categories.show()
language: "python"
context: "This PySpark job runs daily to generate a sales report. It reads orders (500M rows), joins with products and customers, aggregates by category and region, and writes the output. It currently takes 45 minutes and uses 100 executors."
issues:
  - id: i1
    text: "orders.count() triggers a full scan of the 50GB orders table before any processing begins"
    is_real: true
    severity: "warning"
    explanation: "count() is an action that triggers a full table scan just to print a log message. This wastes time reading 50GB unnecessarily. Use a lazy approach or remove it."
    points: 2
  - id: i2
    text: "The products join should use broadcast() since it's only 5MB"
    is_real: true
    severity: "bug"
    explanation: "Products is only 5MB, well under the 10MB broadcast threshold. While Spark may auto-broadcast it, explicitly using broadcast(products) ensures the optimization and avoids a potential 50GB shuffle."
    points: 3
  - id: i3
    text: "The customers join (1GB) should also use broadcast()"
    is_real: false
    severity: null
    explanation: "At 1GB, the customers table is too large to broadcast efficiently. Broadcasting it would send 1GB to each of 100 executors, consuming 100GB of memory cluster-wide. A shuffle join is appropriate here."
    points: 2
  - id: i4
    text: "Writing result then reading it back for top_categories triggers two separate Spark jobs"
    is_real: true
    severity: "bug"
    explanation: "After writing the result, Spark discards it from memory. The orderBy().limit(10) re-reads the written data and triggers a second job. Cache the result or compute top_categories before writing."
    points: 3
  - id: i5
    text: "The parquet write should specify partitionBy for better downstream query performance"
    is_real: true
    severity: "minor"
    explanation: "While not causing incorrect results, partitioning the output by 'category' or 'region' would improve read performance for downstream queries that filter on these columns."
    points: 1
hints:
  - "Look for unnecessary Spark actions (operations that trigger computation)"
  - "Consider whether each join strategy is optimal for the table sizes"
  - "Check if any computation is being repeated unnecessarily"
---

Review this PySpark job for performance issues. Identify which of the listed potential issues are real problems, classify their severity (bug/warning/nit), and which are false positives.
