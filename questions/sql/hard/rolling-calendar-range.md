---
title: "Calendar-Aware Rolling Sum"
difficulty: "Hard"
tags: ["window functions", "RANGE BETWEEN", "INTERVAL", "date gaps"]
tables:
  - name: daily_sales
    visible_data: |
      sale_date,amount
      2024-01-01,500
      2024-01-02,300
      2024-01-04,700
      2024-01-05,200
      2024-01-08,600
      2024-01-09,400
    hidden_datasets:
      - |
        sale_date,amount
        2024-03-01,1000
        2024-03-03,800
        2024-03-05,600
      - |
        sale_date,amount
        2024-06-01,100
        2024-06-02,200
        2024-06-05,300
        2024-06-06,400
        2024-06-10,500
expected_output_query: "SELECT sale_date, amount, SUM(amount) OVER (ORDER BY sale_date RANGE BETWEEN INTERVAL 2 DAY PRECEDING AND CURRENT ROW) as rolling_3day_sum FROM daily_sales ORDER BY sale_date"
---

# Calendar-Aware Rolling Sum

Write a query that calculates a 3-calendar-day rolling sum that respects date gaps.

Use `RANGE BETWEEN INTERVAL 2 DAY PRECEDING AND CURRENT ROW` instead of `ROWS BETWEEN` so that skipped dates are handled correctly.

Return `sale_date`, `amount`, and `rolling_3day_sum`.

Notice how Jan 4 only includes itself (Jan 3 is missing), and Jan 8 only includes itself (Jan 6-7 missing).

## Expected Output
sale_date,amount,rolling_3day_sum
2024-01-01,500,500
2024-01-02,300,800
2024-01-04,700,700
2024-01-05,200,900
2024-01-08,600,600
2024-01-09,400,1000
