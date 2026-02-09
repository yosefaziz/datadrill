---
title: "Month-Over-Month Growth Rate"
difficulty: "Medium"
tags: ["LAG", "window functions", "percent change"]
tables:
  - name: monthly_sales
    visible_data: |
      month,total_sales
      2024-01,10000
      2024-02,12000
      2024-03,11400
      2024-04,13680
      2024-05,15048
    hidden_datasets:
      - |
        month,total_sales
        2024-07,20000
        2024-08,22000
        2024-09,19800
      - |
        month,total_sales
        2024-01,5000
        2024-02,5500
        2024-03,6050
        2024-04,5445
expected_output_query: "SELECT month, total_sales, ROUND(100.0 * (total_sales - LAG(total_sales) OVER (ORDER BY month)) / LAG(total_sales) OVER (ORDER BY month), 1) as mom_pct_change FROM monthly_sales"
---

# Month-Over-Month Growth Rate

Write a query that calculates the month-over-month percentage change in sales.

Use `LAG()` to compute: `100 * (current - previous) / previous`, rounded to 1 decimal place.

Return `month`, `total_sales`, and `mom_pct_change`. The first month has `NULL`.

## Expected Output
| month   | total_sales | mom_pct_change |
|---------|-------------|----------------|
| 2024-01 | 10000       |                |
| 2024-02 | 12000       | 20.0           |
| 2024-03 | 11400       | -5.0           |
| 2024-04 | 13680       | 20.0           |
| 2024-05 | 15048       | 10.0           |
