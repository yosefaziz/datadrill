---
title: "Reduce Shuffle in Spark Pipeline"
difficulty: "Medium"
tags: ["spark", "optimization", "shuffle", "performance", "optimize"]
track: tools-spark-architecture
track_level: 7
track_order: 3
slow_query: |
  from pyspark.sql.functions import col, sum, count, avg, broadcast

  # Current pipeline: 3 shuffles, takes 45 minutes
  orders = spark.read.parquet("orders")              # 500M rows
  products = spark.read.parquet("products")           # 10K rows, 5MB
  customers = spark.read.parquet("customers")         # 2M rows, 200MB

  # Step 1: Join orders with products (SHUFFLE 1)
  enriched = orders.join(products, "product_id")

  # Step 2: Join with customers (SHUFFLE 2)
  enriched = enriched.join(customers, "customer_id")

  # Step 3: Aggregate (SHUFFLE 3)
  result = (
      enriched
      .groupBy("category", "region")
      .agg(
          sum("amount").alias("total_revenue"),
          count("*").alias("order_count"),
          avg("amount").alias("avg_order_value")
      )
  )

  result.write.parquet("output/daily_report")
language: "python"
tables:
  - name: "orders"
    visible_data: |
      order_id,product_id,customer_id,amount
      1,101,1001,50.00
      2,102,1002,30.00
    hidden_datasets:
      - ""
  - name: "products"
    visible_data: |
      product_id,category
      101,Electronics
      102,Books
    hidden_datasets:
      - ""
  - name: "customers"
    visible_data: |
      customer_id,region
      1001,West
      1002,East
    hidden_datasets:
      - ""
expected_output_query: ""
anti_patterns:
  - pattern: "orders\\.join\\(products"
    message: "The products table (5MB) should use broadcast() to avoid a shuffle: orders.join(broadcast(products), ...)"
  - pattern: "\\.repartition\\("
    message: "Adding repartition() creates an extra shuffle. Use broadcast joins to eliminate shuffles instead."
  - pattern: "\\.cache\\(\\)"
    message: "Caching the full 500M row enriched DataFrame wastes memory. Focus on eliminating shuffles through broadcast joins."
optimization_hints:
  - "Products is only 5MB - can you avoid shuffling it?"
  - "Look at each join and ask: does this really need a shuffle?"
  - "The goal is to reduce from 3 shuffles to 1 (only the groupBy shuffle is unavoidable)"
hints:
  - "broadcast() tells Spark to send a small DataFrame to all executors instead of shuffling"
  - "The customers table at 200MB may also be broadcastable if executors have enough memory"
  - "Every shuffle eliminated saves network I/O proportional to the larger table's size"
---

This Spark pipeline performs 3 shuffles and takes 45 minutes. Optimize the code to reduce the number of shuffles. The groupBy shuffle is unavoidable, but the join shuffles can be eliminated.

Rewrite the pipeline to be more efficient. Your code should avoid the listed anti-patterns.
