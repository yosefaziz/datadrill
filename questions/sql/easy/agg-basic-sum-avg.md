---
title: "Department Sales Summary"
difficulty: "Easy"
tags: ["SUM", "AVG", "GROUP BY", "aggregation"]
tables:
  - name: sales
    visible_data: |
      id,salesperson,department,amount
      1,Alice,Electronics,1200
      2,Bob,Electronics,800
      3,Charlie,Clothing,600
      4,David,Clothing,900
      5,Eve,Electronics,1000
      6,Frank,Clothing,300
    hidden_datasets:
      - |
        id,salesperson,department,amount
        1,Grace,Food,500
        2,Henry,Food,700
        3,Ivy,Food,400
      - |
        id,salesperson,department,amount
        1,Jack,Books,150
        2,Kate,Books,250
        3,Leo,Toys,400
        4,Mia,Toys,600
        5,Noah,Books,100
expected_output_query: "SELECT department, SUM(amount) as total_sales, ROUND(AVG(amount), 0) as avg_sale FROM sales GROUP BY department ORDER BY department"
---

# Department Sales Summary

Write a query that calculates the total and average sales amount per department.

Return the `department`, `total_sales` (sum), and `avg_sale` (average, rounded to 0 decimals).

Order by department name alphabetically.

## Expected Output
| department  | total_sales | avg_sale |
|-------------|-------------|----------|
| Clothing    | 1800        | 600      |
| Electronics | 3000        | 1000     |
