---
title: "Rolling Weekly Active Users"
difficulty: "Medium"
tags: ["COUNT", "DISTINCT", "rolling window", "self-join", "active users"]
track: sql-active-users
track_level: 2
track_order: 1
hints:
  - "This is not a simple group-by-week problem - you need a sliding 7-day window ending on each date."
  - "For each date, look back 6 days to form a 7-day window. A self-join or correlated subquery can gather all activity within that range."
  - "Join user_activity to its own distinct dates, then for each date d count distinct users where activity_date is between d - 6 days and d."
tables:
  - name: user_activity
    visible_data: |
      user_id,activity_date,action
      101,2024-03-01,view
      102,2024-03-01,click
      101,2024-03-02,view
      103,2024-03-03,purchase
      101,2024-03-04,click
      102,2024-03-04,view
      104,2024-03-05,view
      103,2024-03-06,click
      105,2024-03-07,view
      101,2024-03-07,purchase
      102,2024-03-08,view
      104,2024-03-08,click
      106,2024-03-08,view
    hidden_datasets:
      - |
        user_id,activity_date,action
        201,2024-06-01,view
        201,2024-06-08,view
        201,2024-06-15,click
      - |
        user_id,activity_date,action
        301,2024-09-01,view
        302,2024-09-01,click
        303,2024-09-02,view
        301,2024-09-02,view
        304,2024-09-03,purchase
        301,2024-09-07,view
        302,2024-09-07,click
        305,2024-09-08,view
        301,2024-09-08,view
        304,2024-09-09,click
expected_output_query: "WITH dates AS (SELECT DISTINCT activity_date FROM user_activity) SELECT d.activity_date, COUNT(DISTINCT ua.user_id) AS wau FROM dates d JOIN user_activity ua ON ua.activity_date BETWEEN d.activity_date - INTERVAL 6 DAY AND d.activity_date GROUP BY d.activity_date ORDER BY d.activity_date"
---

# Rolling Weekly Active Users

Write a query that calculates the rolling 7-day weekly active user count (WAU) for each date that has activity. For a given date, count the distinct users who were active on that date or any of the 6 preceding days.

This is a rolling window per day, not a calendar week grouping.

Return `activity_date` and the count as `wau`, ordered by date.

## Expected Output
activity_date,wau
2024-03-01,2
2024-03-02,2
2024-03-03,3
2024-03-04,3
2024-03-05,4
2024-03-06,4
2024-03-07,5
2024-03-08,6
