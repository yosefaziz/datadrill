---
title: "FIRST_VALUE and LAST_VALUE"
difficulty: "Hard"
tags: ["FIRST_VALUE", "LAST_VALUE", "window functions"]
tables:
  - name: quarterly_revenue
    visible_data: |
      quarter,department,revenue
      Q1,Sales,50000
      Q2,Sales,60000
      Q3,Sales,45000
      Q4,Sales,70000
      Q1,Engineering,80000
      Q2,Engineering,75000
      Q3,Engineering,90000
      Q4,Engineering,85000
    hidden_datasets:
      - |
        quarter,department,revenue
        Q1,Marketing,30000
        Q2,Marketing,35000
        Q3,Marketing,25000
      - |
        quarter,department,revenue
        Q1,HR,20000
        Q2,HR,22000
        Q3,HR,18000
        Q4,HR,21000
        Q1,Sales,40000
        Q2,Sales,55000
expected_output_query: "SELECT quarter, department, revenue, FIRST_VALUE(revenue) OVER (PARTITION BY department ORDER BY revenue DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as max_revenue, LAST_VALUE(revenue) OVER (PARTITION BY department ORDER BY revenue DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as min_revenue FROM quarterly_revenue ORDER BY department, quarter"
---

# FIRST_VALUE and LAST_VALUE

Write a query that shows each quarter's revenue alongside the highest and lowest revenue in its department.

Use `FIRST_VALUE()` on revenue ordered DESC to get the max, and `LAST_VALUE()` to get the min.

**Important:** `LAST_VALUE` requires an explicit frame: `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.

Return `quarter`, `department`, `revenue`, `max_revenue`, and `min_revenue`, ordered by department then quarter.

## Expected Output
| quarter | department  | revenue | max_revenue | min_revenue |
|---------|-------------|---------|-------------|-------------|
| Q1      | Engineering | 80000   | 90000       | 75000       |
| Q2      | Engineering | 75000   | 90000       | 75000       |
| Q3      | Engineering | 90000   | 90000       | 75000       |
| Q4      | Engineering | 85000   | 90000       | 75000       |
| Q1      | Sales       | 50000   | 70000       | 45000       |
| Q2      | Sales       | 60000   | 70000       | 45000       |
| Q3      | Sales       | 45000   | 70000       | 45000       |
| Q4      | Sales       | 70000   | 70000       | 45000       |
