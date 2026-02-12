---
title: "WHERE Clause Kills LEFT JOIN"
difficulty: "Medium"
tags: ["LEFT JOIN", "WHERE", "ON", "debugging", "SQL"]
language: sql
tables:
  - name: customers
    visible_data: |
      id,name
      1,Alice
      2,Bob
      3,Charlie
      4,Diana
    hidden_datasets:
      - |
        id,name
        1,Eve
        2,Frank
        3,Grace
      - |
        id,name
        1,Henry
        2,Ivy
        3,Jack
        4,Kate
        5,Leo
  - name: orders
    visible_data: |
      id,customer_id,status,amount
      1,1,shipped,500
      2,1,pending,200
      3,2,shipped,300
      4,3,pending,100
    hidden_datasets:
      - |
        id,customer_id,status,amount
        1,1,shipped,800
        2,2,pending,400
      - |
        id,customer_id,status,amount
        1,1,shipped,100
        2,1,shipped,200
        3,3,pending,300
        4,4,shipped,400
broken_code: |
  SELECT c.name, o.amount
  FROM customers c
  LEFT JOIN orders o ON c.id = o.customer_id
  WHERE o.status = 'shipped'
  ORDER BY c.name
expected_output_query: |
  SELECT c.name, o.amount
  FROM customers c
  LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'shipped'
  ORDER BY c.name
hint: "The WHERE clause filters after the join. What happens to rows where order columns are NULL?"
---

# WHERE Clause Kills LEFT JOIN

The query should show all customers with their shipped order amounts (NULL if no shipped orders). But customers without shipped orders are disappearing.

Move the filter condition from WHERE to the ON clause.


## Expected Output
name,amount
Alice,500
Bob,300
Charlie,
Diana,
