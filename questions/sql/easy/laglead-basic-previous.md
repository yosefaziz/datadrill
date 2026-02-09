---
title: "Previous Month Revenue"
difficulty: "Easy"
tags: ["LAG", "window functions"]
tables:
  - name: monthly_revenue
    visible_data: |
      month,revenue
      2024-01,10000
      2024-02,12000
      2024-03,11500
      2024-04,13000
      2024-05,14500
    hidden_datasets:
      - |
        month,revenue
        2024-07,20000
        2024-08,18000
        2024-09,22000
      - |
        month,revenue
        2024-01,5000
        2024-02,6000
        2024-03,5500
        2024-04,7000
        2024-05,6500
        2024-06,8000
expected_output_query: "SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) as prev_revenue FROM monthly_revenue"
---

# Previous Month Revenue

Write a query that shows each month's revenue alongside the previous month's revenue using the `LAG` window function.

Return the `month`, `revenue`, and the previous month's revenue as `prev_revenue`. The first month should have `NULL` for `prev_revenue`.

## Expected Output
month,revenue,prev_revenue
2024-01,10000,
2024-02,12000,10000
2024-03,11500,12000
2024-04,13000,11500
2024-05,14500,13000
