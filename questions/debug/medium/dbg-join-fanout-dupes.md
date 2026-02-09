---
title: "Fan-Out Inflates Totals"
difficulty: "Medium"
tags: ["JOIN", "fan-out", "SUM", "DISTINCT", "debugging", "SQL"]
language: sql
tables:
  - name: orders
    visible_data: |
      id,customer_id,amount
      1,1,500
      2,1,300
      3,2,700
    hidden_datasets:
      - |
        id,customer_id,amount
        1,1,1000
        2,2,800
      - |
        id,customer_id,amount
        1,1,200
        2,1,300
        3,2,400
        4,2,500
  - name: payments
    visible_data: |
      id,order_id,payment_date
      1,1,2024-01-05
      2,1,2024-01-10
      3,2,2024-01-08
      4,3,2024-01-12
    hidden_datasets:
      - |
        id,order_id,payment_date
        1,1,2024-02-01
        2,1,2024-02-05
        3,2,2024-02-10
      - |
        id,order_id,payment_date
        1,1,2024-03-01
        2,2,2024-03-05
        3,2,2024-03-10
        4,3,2024-03-15
        5,4,2024-03-20
broken_code: |
  SELECT o.customer_id, SUM(o.amount) as total_spent
  FROM orders o
  JOIN payments p ON o.id = p.order_id
  GROUP BY o.customer_id
  ORDER BY o.customer_id
expected_output_query: |
  SELECT customer_id, SUM(amount) as total_spent
  FROM orders
  GROUP BY customer_id
  ORDER BY customer_id
hint: "Order 1 has two payments. What happens to its amount when you SUM after joining?"
---

# Fan-Out Inflates Totals

The query is supposed to show total spending per customer, but the amounts are too high. Order 1 has two payments, causing its amount to be counted twice.

Fix the query to avoid the fan-out.

**The Bug:** Joining orders to payments creates duplicate rows when an order has multiple payments, inflating the SUM. Remove the unnecessary join since we only need order amounts.

## Expected Output
| customer_id | total_spent |
|-------------|-------------|
| 1           | 800         |
| 2           | 700         |
