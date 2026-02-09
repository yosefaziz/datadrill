---
title: "Day-Over-Day Revenue Change"
difficulty: "Medium"
tags: ["LAG", "window functions", "change detection"]
tables:
  - name: daily_revenue
    visible_data: |
      rev_date,revenue
      2024-01-01,5000
      2024-01-02,5500
      2024-01-03,4800
      2024-01-04,6200
      2024-01-05,5900
    hidden_datasets:
      - |
        rev_date,revenue
        2024-03-01,8000
        2024-03-02,7500
        2024-03-03,9000
      - |
        rev_date,revenue
        2024-06-01,3000
        2024-06-02,3200
        2024-06-03,2800
        2024-06-04,3500
        2024-06-05,3100
        2024-06-06,4000
expected_output_query: "SELECT rev_date, revenue, revenue - LAG(revenue) OVER (ORDER BY rev_date) as daily_change FROM daily_revenue"
---

# Day-Over-Day Revenue Change

Write a query that calculates the day-over-day change in revenue.

Use `LAG()` to get the previous day's revenue and subtract it from the current day.

Return `rev_date`, `revenue`, and `daily_change`. The first row should have `NULL` for `daily_change`.

## Expected Output
rev_date,revenue,daily_change
2024-01-01,5000,
2024-01-02,5500,500
2024-01-03,4800,-700
2024-01-04,6200,1400
2024-01-05,5900,-300
