---
title: "Exclusive Boundaries Should Be Inclusive"
difficulty: "Medium"
tags: ["BETWEEN", "boundary", "debugging", "SQL"]
language: sql
tables:
  - name: products
    visible_data: |
      id,name,price
      1,Pen,5
      2,Notebook,10
      3,Binder,15
      4,Stapler,25
      5,Calculator,50
      6,Backpack,75
    hidden_datasets:
      - |
        id,name,price
        1,Eraser,2
        2,Ruler,10
        3,Marker,30
      - |
        id,name,price
        1,Pencil,1
        2,Folder,10
        3,Tape,8
        4,Scissors,50
        5,Glue,12
broken_code: |
  SELECT name, price
  FROM products
  WHERE price > 10 AND price < 50
  ORDER BY price
expected_output_query: |
  SELECT name, price
  FROM products
  WHERE price BETWEEN 10 AND 50
  ORDER BY price
hint: "The requirements say 'between $10 and $50 inclusive'. Check whether your operators include the boundaries."
---

# Exclusive Boundaries Should Be Inclusive

The query should find products priced between $10 and $50 inclusive, but it's missing products at exactly $10 and $50.

Fix the operators to include boundary values.


## Expected Output
name,price
Notebook,10
Binder,15
Stapler,25
Calculator,50
