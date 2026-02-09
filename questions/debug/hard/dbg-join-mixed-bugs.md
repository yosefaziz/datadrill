---
title: "Multiple Join Bugs"
difficulty: "Hard"
tags: ["JOIN", "debugging", "multi-bug", "SQL"]
language: sql
tables:
  - name: customers
    visible_data: |
      id,name
      1,Alice
      2,Bob
      3,Charlie
    hidden_datasets:
      - |
        id,name
        1,David
        2,Eve
      - |
        id,name
        1,Frank
        2,Grace
        3,Henry
        4,Ivy
  - name: orders
    visible_data: |
      id,customer_id,amount
      1,1,500
      2,1,300
      3,2,700
    hidden_datasets:
      - |
        id,customer_id,amount
        1,1,400
        2,2,600
      - |
        id,customer_id,amount
        1,1,100
        2,1,200
        3,3,300
        4,4,400
  - name: order_items
    visible_data: |
      id,order_id,product
      1,1,Laptop
      2,1,Mouse
      3,2,Phone
      4,3,Tablet
      5,3,Case
    hidden_datasets:
      - |
        id,order_id,product
        1,1,Camera
        2,2,Lens
        3,2,Bag
      - |
        id,order_id,product
        1,1,Book
        2,2,Pen
        3,3,Notebook
        4,4,Marker
        5,4,Eraser
broken_code: |
  SELECT c.name, COUNT(*) as order_count
  FROM customers c
  LEFT JOIN orders o ON c.id = o.customer_id
  JOIN order_items oi ON o.id = oi.order_id
  GROUP BY c.name
  ORDER BY c.name
expected_output_query: |
  SELECT c.name, COUNT(DISTINCT o.id) as order_count
  FROM customers c
  LEFT JOIN orders o ON c.id = o.customer_id
  LEFT JOIN order_items oi ON o.id = oi.order_id
  GROUP BY c.name
  ORDER BY c.name
hint: "There are two bugs: (1) the second JOIN should also be LEFT JOIN to keep all customers, and (2) COUNT(*) double-counts orders with multiple items."
---

# Multiple Join Bugs

This query has two bugs. It should show the number of orders per customer (including customers with 0 orders), but it's both losing customers and inflating counts.

Find and fix both bugs.

**Bug 1:** The second `JOIN` (to order_items) is INNER, which drops customers with no orders. Change to `LEFT JOIN`.

**Bug 2:** `COUNT(*)` counts item rows, not distinct orders. Use `COUNT(DISTINCT o.id)`.

## Expected Output
| name    | order_count |
|---------|-------------|
| Alice   | 2           |
| Bob     | 1           |
| Charlie | 0           |
