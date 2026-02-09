---
title: "7-Day Rolling Average"
difficulty: "Medium"
tags: ["window functions", "AVG", "ROWS BETWEEN"]
tables:
  - name: daily_metrics
    visible_data: |
      metric_date,value
      2024-01-01,100
      2024-01-02,120
      2024-01-03,90
      2024-01-04,130
      2024-01-05,110
      2024-01-06,140
      2024-01-07,105
      2024-01-08,125
    hidden_datasets:
      - |
        metric_date,value
        2024-03-01,200
        2024-03-02,180
        2024-03-03,220
      - |
        metric_date,value
        2024-06-01,50
        2024-06-02,60
        2024-06-03,70
        2024-06-04,80
        2024-06-05,90
        2024-06-06,100
        2024-06-07,110
        2024-06-08,120
expected_output_query: "SELECT metric_date, value, ROUND(AVG(value) OVER (ORDER BY metric_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 1) as rolling_avg FROM daily_metrics"
---

# 7-Day Rolling Average

Write a query that calculates a 7-day rolling average of daily metric values.

Use `AVG()` with `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` to include the current day and 6 prior days.

Return `metric_date`, `value`, and `rolling_avg` (rounded to 1 decimal).

## Expected Output
| metric_date | value | rolling_avg |
|-------------|-------|-------------|
| 2024-01-01  | 100   | 100.0       |
| 2024-01-02  | 120   | 110.0       |
| 2024-01-03  | 90    | 103.3       |
| 2024-01-04  | 130   | 110.0       |
| 2024-01-05  | 110   | 110.0       |
| 2024-01-06  | 140   | 115.0       |
| 2024-01-07  | 105   | 113.6       |
| 2024-01-08  | 125   | 117.1       |
