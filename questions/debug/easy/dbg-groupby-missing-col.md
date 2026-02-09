---
title: "Missing Column in GROUP BY"
difficulty: "Easy"
tags: ["GROUP BY", "aggregation", "debugging", "SQL"]
language: sql
tables:
  - name: orders
    visible_data: |
      id,region,category,amount
      1,East,Electronics,500
      2,East,Clothing,200
      3,West,Electronics,700
      4,East,Electronics,300
      5,West,Clothing,150
      6,West,Electronics,400
    hidden_datasets:
      - |
        id,region,category,amount
        1,North,Food,100
        2,North,Food,200
        3,South,Drinks,150
      - |
        id,region,category,amount
        1,Central,Books,50
        2,Central,Books,75
        3,Central,Toys,100
        4,Coastal,Books,60
        5,Coastal,Toys,80
broken_code: |
  SELECT region, category, SUM(amount) as total
  FROM orders
  GROUP BY region
  ORDER BY region, category
expected_output_query: |
  SELECT region, category, SUM(amount) as total
  FROM orders
  GROUP BY region, category
  ORDER BY region, category
hint: "Every non-aggregated column in SELECT must appear in the GROUP BY clause."
---

# Missing Column in GROUP BY

The query should show total sales by region AND category, but `category` is missing from the GROUP BY clause.

Fix the query by adding the missing column to GROUP BY.

**The Bug:** `category` is in SELECT but not in GROUP BY. DuckDB may error or produce unexpected results.

## Expected Output
| region | category    | total |
|--------|-------------|-------|
| East   | Clothing    | 200   |
| East   | Electronics | 800   |
| West   | Clothing    | 150   |
| West   | Electronics | 1100  |
