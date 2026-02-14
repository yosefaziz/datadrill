---
title: "Month-Over-Month Revenue Change"
difficulty: "Easy"
tags: ["LAG", "window functions", "MoM"]
track: sql-yoy-growth
track_level: 1
track_order: 1
hints:
  - "Think about how to access a value from the previous row when your data is ordered chronologically."
  - "The LAG() window function retrieves a value from the preceding row. Pair it with ORDER BY to compare each month to the one before it."
  - "Use LAG(revenue) OVER (ORDER BY month) to get the previous month's revenue, then subtract it from the current revenue to compute the change."
tables:
  - name: monthly_revenue
    visible_data: |
      month,revenue
      2024-01-01,84500
      2024-02-01,91200
      2024-03-01,87300
      2024-04-01,95800
      2024-05-01,102400
      2024-06-01,98100
    hidden_datasets:
      - |
        month,revenue
        2025-01-01,120000
        2025-02-01,115000
        2025-03-01,130000
        2025-04-01,128000
      - |
        month,revenue
        2024-07-01,45000
        2024-08-01,45000
        2024-09-01,52000
        2024-10-01,48000
        2024-11-01,61000
expected_output_query: "SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS revenue_change FROM monthly_revenue ORDER BY month"
---

# Month-Over-Month Revenue Change

Write a query that calculates the month-over-month change in revenue for each month. For every row, include the previous month's revenue and the absolute difference between the current and previous month.

Return `month`, `revenue`, `prev_month_revenue`, and `revenue_change`. The first month should show NULL for both `prev_month_revenue` and `revenue_change` since there is no prior month to compare against. Order by `month`.

## Expected Output
month,revenue,prev_month_revenue,revenue_change
2024-01-01,84500,,
2024-02-01,91200,84500,6700
2024-03-01,87300,91200,-3900
2024-04-01,95800,87300,8500
2024-05-01,102400,95800,6600
2024-06-01,98100,102400,-4300
