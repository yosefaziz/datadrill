---
title: "Orders with Customer Names"
difficulty: "Easy"
tags: ["INNER JOIN", "basics"]
hints:
  - "You need to combine data from two tables  - think about which JOIN type keeps only matching rows."
  - "The customer_id column in orders matches the id column in customers."
tables:
  - name: orders
    visible_data: |
      id,customer_id,product,amount
      1,1,Laptop,999
      2,2,Phone,699
      3,1,Monitor,349
      4,3,Tablet,499
      5,2,Keyboard,79
    hidden_datasets:
      - |
        id,customer_id,product,amount
        1,1,Camera,599
        2,1,Lens,299
        3,2,Tripod,149
      - |
        id,customer_id,product,amount
        1,1,Book,29
        2,2,Pen,15
        3,3,Notebook,8
        4,1,Marker,5
  - name: customers
    visible_data: |
      id,name,email
      1,Alice,alice@example.com
      2,Bob,bob@example.com
      3,Charlie,charlie@example.com
    hidden_datasets:
      - |
        id,name,email
        1,David,david@test.com
        2,Eve,eve@test.com
      - |
        id,name,email
        1,Frank,frank@demo.com
        2,Grace,grace@demo.com
        3,Henry,henry@demo.com
expected_output_query: "SELECT c.name, o.product, o.amount FROM orders o INNER JOIN customers c ON o.customer_id = c.id ORDER BY c.name, o.amount DESC"
---

# Orders with Customer Names

Write a query that shows each order with the customer's name by joining the `orders` and `customers` tables.

Return the customer `name`, `product`, and `amount`.

Order by customer name, then by amount descending.

## Expected Output
name,product,amount
Alice,Laptop,999
Alice,Monitor,349
Bob,Phone,699
Bob,Keyboard,79
Charlie,Tablet,499
