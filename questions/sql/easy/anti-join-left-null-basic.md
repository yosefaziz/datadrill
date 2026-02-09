---
title: "Customers with No Orders"
difficulty: "Easy"
tags: ["LEFT JOIN", "IS NULL", "anti-join"]
tables:
  - name: customers
    visible_data: |
      id,name,email
      1,Alice,alice@example.com
      2,Bob,bob@example.com
      3,Charlie,charlie@example.com
      4,David,david@example.com
      5,Eve,eve@example.com
    hidden_datasets:
      - |
        id,name,email
        1,Frank,frank@test.com
        2,Grace,grace@test.com
        3,Henry,henry@test.com
      - |
        id,name,email
        1,Ivy,ivy@demo.com
        2,Jack,jack@demo.com
        3,Kate,kate@demo.com
        4,Leo,leo@demo.com
        5,Mia,mia@demo.com
        6,Noah,noah@demo.com
  - name: orders
    visible_data: |
      id,customer_id,product,amount
      1,1,Laptop,999
      2,2,Phone,699
      3,1,Tablet,499
    hidden_datasets:
      - |
        id,customer_id,product,amount
        1,1,Desk,450
      - |
        id,customer_id,product,amount
        1,2,Printer,300
        2,4,Scanner,200
        3,2,Mouse,50
        4,6,Webcam,80
expected_output_query: "SELECT c.name FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.customer_id IS NULL ORDER BY c.name"
---

# Customers with No Orders

Write a query that finds customers who have not placed any orders.

Use a `LEFT JOIN` with an `IS NULL` check to identify customers without matching orders.

Return only the customer `name`, ordered alphabetically.

## Expected Output
| name    |
|---------|
| Charlie |
| David   |
| Eve     |
