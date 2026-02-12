---
title: "Group By Aggregation"
difficulty: "Medium"
interview_relevant: false
tags: ["pyspark", "groupBy", "agg", "sum", "count"]
tables:
  - name: orders
    visible_data: |
      order_id,customer_id,product,amount
      1,101,Laptop,999
      2,102,Phone,699
      3,101,Headphones,199
      4,103,Tablet,499
      5,101,Monitor,349
      6,102,Keyboard,79
    hidden_datasets:
      - |
        order_id,customer_id,product,amount
        1,201,Camera,599
        2,202,Lens,299
        3,201,Tripod,149
        4,201,Bag,79
      - |
        order_id,customer_id,product,amount
        1,301,Book,29
        2,302,Book,29
        3,301,Pen,5
        4,303,Notebook,15
        5,301,Marker,8
expected_output_query: |
  result = orders.groupBy("customer_id").agg(
      sum("amount").alias("total_amount"),
      count("order_id").alias("order_count")
  )
---

# Group By Aggregation

Group the `orders` DataFrame by `customer_id` and calculate:
- `total_amount`: The sum of all order amounts for each customer
- `order_count`: The number of orders for each customer

Your result should be stored in a variable called `result`.

**Hint:** Use `.groupBy()` followed by `.agg()` with aggregation functions.

## Expected Output
customer_id,total_amount,order_count
101,1547,3
102,778,2
103,499,1
