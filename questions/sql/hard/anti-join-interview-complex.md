---
title: "Inactive Customers with Past Orders"
difficulty: "Hard"
tags: ["anti-join", "GROUP BY", "HAVING", "date filtering"]
tables:
  - name: customers
    visible_data: |
      id,name,signup_date
      1,Alice,2023-01-15
      2,Bob,2023-03-20
      3,Charlie,2023-06-10
      4,David,2023-02-01
      5,Eve,2023-09-05
    hidden_datasets:
      - |
        id,name,signup_date
        1,Frank,2023-01-01
        2,Grace,2023-04-15
        3,Henry,2023-07-20
      - |
        id,name,signup_date
        1,Ivy,2023-02-10
        2,Jack,2023-05-01
        3,Kate,2023-08-15
        4,Leo,2023-03-20
  - name: orders
    visible_data: |
      id,customer_id,order_date,amount
      1,1,2023-06-01,500
      2,1,2023-11-15,300
      3,2,2023-08-10,700
      4,3,2023-07-20,200
      5,4,2023-04-05,150
      6,4,2023-05-10,250
      7,5,2023-10-01,400
      8,5,2023-12-20,600
    hidden_datasets:
      - |
        id,customer_id,order_date,amount
        1,1,2023-06-01,300
        2,2,2023-09-15,500
        3,3,2023-11-01,200
      - |
        id,customer_id,order_date,amount
        1,1,2023-03-01,100
        2,2,2023-07-10,200
        3,2,2023-12-01,300
        4,3,2023-09-05,400
        5,4,2023-06-15,250
expected_output_query: "SELECT c.name, MAX(o.order_date) as last_order_date FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name HAVING MAX(o.order_date) < '2024-01-01' AND MAX(o.order_date) < DATE '2023-10-01' ORDER BY last_order_date"
---

# Inactive Customers with Past Orders

Write a query that finds customers whose most recent order was before October 2023 — they were once active but have gone quiet.

Join customers with orders, group by customer, and use `HAVING` to filter for those whose latest order is before `2023-10-01`.

Return the customer `name` and `last_order_date`, ordered by last order date.

## Expected Output
| name    | last_order_date |
|---------|-----------------|
| David   | 2023-05-10      |
| Charlie | 2023-07-20      |
| Bob     | 2023-08-10      |
