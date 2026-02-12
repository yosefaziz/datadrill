---
title: "Wrong Join Type"
difficulty: "Easy"
tags: ["JOIN", "debugging", "SQL"]
language: sql
tables:
  - name: orders
    visible_data: |
      order_id,customer_id,amount
      1,101,150
      2,102,200
      3,103,75
    hidden_datasets:
      - |
        order_id,customer_id,amount
        1,201,300
        2,202,450
      - |
        order_id,customer_id,amount
        1,301,100
        2,302,200
        3,303,150
        4,304,250
  - name: customers
    visible_data: |
      customer_id,name
      101,Alice
      102,Bob
      104,Diana
    hidden_datasets:
      - |
        customer_id,name
        201,Eve
        203,Grace
      - |
        customer_id,name
        301,Henry
        302,Ivy
        305,Kate
broken_code: |
  SELECT c.name, o.amount
  FROM orders o
  LEFT JOIN customers c ON o.customer_id = c.customer_id
expected_output_query: |
  SELECT c.name, o.amount
  FROM orders o
  INNER JOIN customers c ON o.customer_id = c.customer_id
hint: "The query is returning rows where customer name is NULL. Should it?"
---

# Wrong Join Type

The following query is supposed to show order amounts for customers, but it's including orders that don't have matching customers. Fix the query so it only shows orders that have a matching customer.


## Expected Output
name,amount
Alice,150
Bob,200
