---
title: "Wrong Comparison Operator"
difficulty: "Easy"
tags: ["WHERE", "comparison", "debugging", "SQL"]
language: sql
tables:
  - name: products
    visible_data: |
      id,name,price,stock
      1,Laptop,999,15
      2,Phone,699,10
      3,Tablet,499,5
      4,Monitor,349,10
      5,Keyboard,79,25
    hidden_datasets:
      - |
        id,name,price,stock
        1,Camera,599,8
        2,Lens,299,3
        3,Tripod,149,20
      - |
        id,name,price,stock
        1,Book,29,50
        2,Pen,5,100
        3,Mouse,39,10
        4,Desk,449,10
broken_code: |
  SELECT name, price, stock
  FROM products
  WHERE stock > 10
  ORDER BY name
expected_output_query: |
  SELECT name, price, stock
  FROM products
  WHERE stock >= 10
  ORDER BY name
hint: "The boundary value of 10 should be included. Check the comparison operator."
---

# Wrong Comparison Operator

The query should find all products with stock of 10 or more, but products with exactly 10 units are being excluded.

Fix the comparison operator to include the boundary value.


## Expected Output
name,price,stock
Keyboard,79,25
Laptop,999,15
Monitor,349,10
Phone,699,10
