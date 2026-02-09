---
title: "Double Counting from JOIN"
difficulty: "Medium"
tags: ["COUNT", "DISTINCT", "JOIN", "debugging", "SQL"]
language: sql
tables:
  - name: orders
    visible_data: |
      id,customer_id,order_date
      1,1,2024-01-05
      2,1,2024-01-10
      3,2,2024-01-08
    hidden_datasets:
      - |
        id,customer_id,order_date
        1,1,2024-02-01
        2,2,2024-02-05
      - |
        id,customer_id,order_date
        1,1,2024-03-01
        2,1,2024-03-10
        3,2,2024-03-05
        4,3,2024-03-08
  - name: order_items
    visible_data: |
      id,order_id,product,quantity
      1,1,Laptop,1
      2,1,Mouse,2
      3,2,Phone,1
      4,3,Tablet,1
      5,3,Case,1
    hidden_datasets:
      - |
        id,order_id,product,quantity
        1,1,Camera,1
        2,1,Lens,1
        3,2,Tripod,2
      - |
        id,order_id,product,quantity
        1,1,Book,1
        2,2,Pen,3
        3,3,Notebook,2
        4,3,Eraser,1
        5,4,Marker,1
broken_code: |
  SELECT o.customer_id, COUNT(*) as order_count
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  GROUP BY o.customer_id
  ORDER BY o.customer_id
expected_output_query: |
  SELECT o.customer_id, COUNT(DISTINCT o.id) as order_count
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  GROUP BY o.customer_id
  ORDER BY o.customer_id
hint: "Each order has multiple items. COUNT(*) counts item rows, not unique orders."
---

# Double Counting from JOIN

The query counts orders per customer, but the numbers are inflated because orders with multiple items create extra rows.

Fix the query to count distinct orders.

**The Bug:** `COUNT(*)` counts every row after the JOIN, including duplicated order rows. Use `COUNT(DISTINCT o.id)` to count unique orders.

## Expected Output
customer_id,order_count
1,2
2,1
