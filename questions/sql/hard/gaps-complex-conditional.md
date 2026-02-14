---
title: "Consecutive Stock Winning Streaks"
difficulty: "Hard"
tags: ["gaps and islands", "ROW_NUMBER", "window functions", "conditional logic", "aggregation"]
track: sql-gaps-islands
track_level: 4
track_order: 1
hints:
  - "Start by flagging each trading day as a win or loss based on whether close_price exceeds prev_close. Then focus on grouping consecutive winning days."
  - "Number all rows per ticker (including losses), then separately number only the winning rows. The difference between these two row numbers stays constant within a consecutive winning streak."
  - "Use ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY trade_date) on all rows, then ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY trade_date) on only the winning rows. Group wins by ticker and the difference of these two numbers. The total gain is the last day's close_price minus the first day's prev_close in each group."
tables:
  - name: stock_prices
    visible_data: |
      trade_date,ticker,close_price,prev_close
      2024-07-01,ACME,150.00,148.50
      2024-07-02,ACME,152.30,150.00
      2024-07-03,ACME,151.10,152.30
      2024-07-05,ACME,153.80,151.10
      2024-07-08,ACME,155.20,153.80
      2024-07-09,ACME,156.90,155.20
      2024-07-10,ACME,154.40,156.90
      2024-07-01,BOLT,82.00,81.50
      2024-07-02,BOLT,83.40,82.00
      2024-07-03,BOLT,84.10,83.40
      2024-07-05,BOLT,83.70,84.10
      2024-07-08,BOLT,85.20,83.70
    hidden_datasets:
      - |
        trade_date,ticker,close_price,prev_close
        2024-09-02,ACME,200.00,198.00
        2024-09-03,ACME,202.50,200.00
        2024-09-04,ACME,201.00,202.50
        2024-09-02,BOLT,90.00,89.50
        2024-09-03,BOLT,91.20,90.00
        2024-09-04,BOLT,92.80,91.20
        2024-09-05,BOLT,92.00,92.80
      - |
        trade_date,ticker,close_price,prev_close
        2024-11-01,ACME,170.00,169.00
        2024-11-04,ACME,172.50,170.00
        2024-11-05,ACME,173.80,172.50
        2024-11-06,ACME,175.00,173.80
        2024-11-07,ACME,174.20,175.00
        2024-11-01,BOLT,95.00,94.80
        2024-11-04,BOLT,94.50,95.00
        2024-11-05,BOLT,96.00,94.50
expected_output_query: "WITH numbered AS (SELECT trade_date, ticker, close_price, prev_close, ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY trade_date) AS rn_all, CASE WHEN close_price > prev_close THEN 1 ELSE 0 END AS is_win FROM stock_prices), wins AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY trade_date) AS rn_win FROM numbered WHERE is_win = 1), grouped AS (SELECT *, rn_all - rn_win AS grp FROM wins) SELECT ticker, MIN(trade_date) AS streak_start, MAX(trade_date) AS streak_end, COUNT(*) AS streak_days, ROUND(MAX(close_price) - MIN(prev_close), 2) AS total_gain FROM grouped GROUP BY ticker, grp ORDER BY ticker, streak_start"
---

# Consecutive Stock Winning Streaks

Write a query that finds consecutive winning streaks per stock ticker. A winning day is one where `close_price` is greater than `prev_close`. A streak is a sequence of consecutive trading days (by position in the data, not calendar days) that are all wins - a losing day in between breaks the streak.

For each streak, calculate the total gain as the difference between the closing price on the last day and the `prev_close` on the first day of the streak (the price just before the streak began).

Return `ticker`, `streak_start`, `streak_end`, `streak_days`, and `total_gain` (rounded to 2 decimal places). Order by `ticker`, then `streak_start`.

## Expected Output
ticker,streak_start,streak_end,streak_days,total_gain
ACME,2024-07-01,2024-07-02,2,3.80
ACME,2024-07-05,2024-07-09,3,5.80
BOLT,2024-07-01,2024-07-03,3,2.60
BOLT,2024-07-08,2024-07-08,1,1.50
