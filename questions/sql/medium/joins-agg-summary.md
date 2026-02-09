---
title: "JOIN with GROUP BY Summary"
difficulty: "Medium"
tags: ["JOIN", "GROUP BY", "SUM"]
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
        1,Diana
        2,Edward
      - |
        id,name
        1,Fiona
        2,George
        3,Hannah
        4,Ian
  - name: orders
    visible_data: |
      id,customer_id,amount
      1,1,100
      2,1,250
      3,2,75
      4,2,125
      5,3,300
      6,1,150
    hidden_datasets:
      - |
        id,customer_id,amount
        1,1,500
        2,2,300
        3,2,200
      - |
        id,customer_id,amount
        1,1,50
        2,2,100
        3,3,200
        4,3,300
        5,4,150
        6,4,250
        7,4,100
expected_output_query: "SELECT c.name as customer, COUNT(o.id) as order_count, SUM(o.amount) as total_amount FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name ORDER BY total_amount DESC"
---

# JOIN with GROUP BY Summary

Given the `customers` and `orders` tables, calculate the total order amount and number of orders for each customer.

Return the `customer` name, `order_count`, and `total_amount`.

Order the results by `total_amount` in descending order.

## Expected Output
customer,order_count,total_amount
Alice,3,500
Charlie,1,300
Bob,2,200
