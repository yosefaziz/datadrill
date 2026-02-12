---
title: "Missing GROUP BY Column"
difficulty: "Easy"
tags: ["GROUP BY", "aggregation", "debugging", "SQL"]
language: sql
tables:
  - name: sales
    visible_data: |
      id,product,category,amount
      1,Laptop,Electronics,999
      2,Phone,Electronics,699
      3,Desk,Furniture,299
      4,Chair,Furniture,149
      5,Tablet,Electronics,499
    hidden_datasets:
      - |
        id,product,category,amount
        1,Camera,Electronics,599
        2,Lens,Electronics,299
        3,Tripod,Electronics,149
      - |
        id,product,category,amount
        1,Book,Books,29
        2,Novel,Books,19
        3,Lamp,Furniture,59
        4,Table,Furniture,199
broken_code: |
  SELECT category, SUM(amount) as total
  FROM sales
expected_output_query: |
  SELECT category, SUM(amount) as total
  FROM sales
  GROUP BY category
hint: "When using aggregate functions like SUM, you need to specify which column(s) to group by."
---

# Missing GROUP BY Column

The following query is supposed to calculate the total sales amount per category, but it's missing something important. Fix the query.


## Expected Output
category,total
Electronics,2197
Furniture,448
