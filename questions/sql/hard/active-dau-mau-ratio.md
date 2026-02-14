---
title: "DAU/MAU Stickiness Ratio"
difficulty: "Hard"
tags: ["CTE", "COUNT", "DISTINCT", "DATE_TRUNC", "JOIN", "active users", "stickiness"]
track: sql-active-users
track_level: 3
track_order: 1
hints:
  - "You need two separate aggregations - one at the daily grain and one at the monthly grain - then combine them."
  - "Build a CTE for daily active users (GROUP BY date) and another for monthly active users (GROUP BY truncated month), then join the daily CTE to the monthly CTE by matching each day to its month."
  - "Use DATE_TRUNC('month', activity_date) as the join key between your DAU and MAU CTEs. Compute stickiness as ROUND(CAST(dau AS DECIMAL) / mau, 2)."
tables:
  - name: user_activity
    visible_data: |
      user_id,activity_date,action
      101,2024-01-02,view
      102,2024-01-02,click
      103,2024-01-02,view
      101,2024-01-10,purchase
      102,2024-01-10,view
      104,2024-01-10,click
      101,2024-01-20,view
      105,2024-01-20,click
      101,2024-02-03,view
      102,2024-02-03,click
      101,2024-02-03,purchase
      103,2024-02-15,view
      101,2024-02-15,click
      104,2024-02-15,view
    hidden_datasets:
      - |
        user_id,activity_date,action
        201,2024-04-01,view
        201,2024-04-02,view
        201,2024-04-03,view
      - |
        user_id,activity_date,action
        301,2024-07-01,view
        302,2024-07-01,click
        303,2024-07-01,view
        301,2024-07-15,purchase
        304,2024-07-15,view
        301,2024-08-01,view
        305,2024-08-01,click
expected_output_query: "WITH daily AS (SELECT activity_date, COUNT(DISTINCT user_id) AS dau FROM user_activity GROUP BY activity_date), monthly AS (SELECT DATE_TRUNC('month', activity_date) AS activity_month, COUNT(DISTINCT user_id) AS mau FROM user_activity GROUP BY DATE_TRUNC('month', activity_date)) SELECT d.activity_date, d.dau, m.mau, ROUND(CAST(d.dau AS DECIMAL) / m.mau, 2) AS stickiness FROM daily d JOIN monthly m ON DATE_TRUNC('month', d.activity_date) = m.activity_month ORDER BY d.activity_date"
---

# DAU/MAU Stickiness Ratio

Write a query that calculates the DAU/MAU stickiness ratio for each day. For every date with activity, compute the daily active users (DAU), the monthly active users (MAU) for that date's calendar month, and the ratio between them. A higher ratio indicates users return more frequently.

Return `activity_date`, `dau`, `mau`, and `stickiness` (rounded to 2 decimal places), ordered by date.

## Expected Output
activity_date,dau,mau,stickiness
2024-01-02,3,5,0.6
2024-01-10,3,5,0.6
2024-01-20,2,5,0.4
2024-02-03,2,4,0.5
2024-02-15,3,4,0.75
