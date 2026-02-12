---
title: "Predict DAG Stages"
difficulty: "Easy"
tags: ["spark", "DAG", "stages", "predict"]
track: tools-spark-architecture
track_level: 4
track_order: 1
code: |
  orders = spark.read.parquet("orders")       # 100 partitions
  customers = spark.read.parquet("customers")  # 50 partitions
  products = spark.read.parquet("products")    # 20 partitions

  result = (
      orders
      .join(customers, "customer_id")   # Join 1
      .join(products, "product_id")     # Join 2
      .groupBy("category")
      .agg(sum("amount").alias("total"))
      .orderBy(desc("total"))
  )
  result.show()
language: "python"
tables:
  - name: "orders"
    visible_data: |
      customer_id,product_id,amount
      1,101,50.00
      2,102,30.00
      1,103,20.00
    hidden_datasets:
      - ""
  - name: "customers"
    visible_data: |
      customer_id,name
      1,Alice
      2,Bob
    hidden_datasets:
      - ""
  - name: "products"
    visible_data: |
      product_id,category
      101,Electronics
      102,Books
      103,Electronics
    hidden_datasets:
      - ""
expected_columns: ["Metric", "Value"]
given_columns: [0]
expected_rows:
  - ["Number of stages", "4"]
  - ["Number of shuffle boundaries", "3"]
  - ["Stage 1 operation", "Read tables + Join 1"]
  - ["Stage 2 operation", "Join 2 + groupBy"]
  - ["Final stage operation", "orderBy (sort)"]
cell_options:
  "0,1": ["2", "3", "4", "5", "6"]
  "1,1": ["1", "2", "3", "4", "5"]
  "2,1":
    - "Read tables + Join 1"
    - "Read tables only"
    - "Join 1 + Join 2"
    - "Shuffle for groupBy"
  "3,1":
    - "Join 2 + groupBy"
    - "Shuffle for Join 1"
    - "Read products only"
    - "orderBy (sort)"
  "4,1":
    - "orderBy (sort)"
    - "Join 2 + groupBy"
    - "groupBy + orderBy"
    - "Final collect"
hints:
  - "Each wide transformation (join, groupBy, orderBy) creates a shuffle boundary"
  - "Spark tries to pipeline narrow transformations together in one stage"
  - "Two joins + one groupBy + one orderBy = how many shuffles?"
---

Examine the Spark code above and predict the execution plan. How many stages will this job produce, and what happens at each shuffle boundary?

Fill in the prediction grid with the correct values for each metric.
