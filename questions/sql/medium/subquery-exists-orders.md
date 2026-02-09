---
title: "Customers with Orders"
difficulty: "Medium"
tags: ["EXISTS", "correlated subquery"]
tables:
  - name: customers
    visible_data: |
      id,name,city
      1,Alice,NYC
      2,Bob,LA
      3,Charlie,NYC
      4,David,SF
      5,Eve,LA
    hidden_datasets:
      - |
        id,name,city
        1,Frank,Chicago
        2,Grace,Chicago
        3,Henry,Boston
      - |
        id,name,city
        1,Ivy,NYC
        2,Jack,LA
        3,Kate,SF
        4,Leo,NYC
  - name: orders
    visible_data: |
      id,customer_id,amount
      1,1,500
      2,1,300
      3,3,700
      4,5,200
    hidden_datasets:
      - |
        id,customer_id,amount
        1,1,800
        2,3,400
      - |
        id,customer_id,amount
        1,2,100
        2,2,200
        3,4,300
expected_output_query: "SELECT c.name, c.city FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY c.name"
---

# Customers with Orders

Write a query that finds all customers who have placed at least one order using an `EXISTS` subquery.

Return the customer `name` and `city`, ordered by name.

## Expected Output
| name    | city |
|---------|------|
| Alice   | NYC  |
| Charlie | NYC  |
| Eve     | LA   |
