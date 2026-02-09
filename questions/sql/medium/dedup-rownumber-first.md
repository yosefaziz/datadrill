---
title: "First Order per Customer"
difficulty: "Medium"
tags: ["ROW_NUMBER", "deduplication"]
tables:
  - name: customer_orders
    visible_data: |
      id,customer_id,order_date,amount
      1,1,2024-01-05,150
      2,2,2024-01-03,200
      3,1,2024-01-10,300
      4,3,2024-01-08,100
      5,2,2024-01-12,250
      6,3,2024-01-15,175
    hidden_datasets:
      - |
        id,customer_id,order_date,amount
        1,10,2024-02-01,500
        2,10,2024-02-10,600
        3,11,2024-02-05,400
      - |
        id,customer_id,order_date,amount
        1,20,2024-03-01,50
        2,21,2024-03-02,75
        3,20,2024-03-05,80
        4,22,2024-03-03,60
        5,21,2024-03-08,90
expected_output_query: "SELECT customer_id, order_date, amount FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as rn FROM customer_orders) sub WHERE rn = 1 ORDER BY customer_id"
---

# First Order per Customer

Write a query that finds each customer's first (earliest) order.

Use `ROW_NUMBER()` partitioned by `customer_id`, ordered by `order_date ASC`, then filter for the first row.

Return `customer_id`, `order_date`, and `amount`, ordered by customer_id.

## Expected Output
| customer_id | order_date | amount |
|-------------|------------|--------|
| 1           | 2024-01-05 | 150    |
| 2           | 2024-01-03 | 200    |
| 3           | 2024-01-08 | 100    |
