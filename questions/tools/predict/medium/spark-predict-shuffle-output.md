---
title: "Predict Shuffle Output"
difficulty: "Medium"
tags: ["spark", "shuffle", "partitions", "predict"]
track: tools-spark-architecture
track_level: 4
track_order: 2
code: |
  # spark.conf.set("spark.sql.shuffle.partitions", "4")

  sales = spark.createDataFrame([
      ("Electronics", 100), ("Electronics", 200), ("Electronics", 150),
      ("Books", 50), ("Books", 75),
      ("Clothing", 300),
      ("Food", 25), ("Food", 50), ("Food", 75), ("Food", 100)
  ], ["category", "amount"])

  result = (
      sales
      .groupBy("category")
      .agg(
          count("*").alias("num_sales"),
          sum("amount").alias("total_amount")
      )
  )
  result.show()
language: "python"
tables:
  - name: "sales"
    visible_data: |
      category,amount
      Electronics,100
      Electronics,200
      Electronics,150
      Books,50
      Books,75
      Clothing,300
      Food,25
      Food,50
      Food,75
      Food,100
    hidden_datasets:
      - ""
expected_columns: ["category", "num_sales", "total_amount"]
expected_rows:
  - ["Books", "2", "125"]
  - ["Clothing", "1", "300"]
  - ["Electronics", "3", "450"]
  - ["Food", "4", "250"]
hints:
  - "groupBy triggers a shuffle - all rows with the same key go to the same partition"
  - "count('*') counts rows per group, sum('amount') adds the amount values"
  - "Think about what data each partition receives after the shuffle"
---

Given the sales data and the groupBy + aggregation code, predict the exact output. Consider what happens during the shuffle: which rows end up together, and what are the aggregated values?
