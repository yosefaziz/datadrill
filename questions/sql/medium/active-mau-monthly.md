---
title: "Monthly Active Users Count"
difficulty: "Medium"
tags: ["COUNT", "DISTINCT", "DATE_TRUNC", "active users"]
track: sql-active-users
track_level: 2
track_order: 2
hints:
  - "You need to group activity by calendar month, not by a rolling 30-day window."
  - "Use DATE_TRUNC('month', ...) to collapse each date into the first day of its month."
  - "Apply DATE_TRUNC to the activity date, then count distinct user IDs within each truncated month."
tables:
  - name: user_activity
    visible_data: |
      user_id,activity_date,action
      101,2024-01-05,view
      102,2024-01-10,click
      101,2024-01-15,purchase
      103,2024-01-20,view
      101,2024-02-02,view
      102,2024-02-08,click
      104,2024-02-14,view
      105,2024-02-20,purchase
      103,2024-02-25,click
      101,2024-03-01,view
      101,2024-03-10,click
      102,2024-03-15,view
    hidden_datasets:
      - |
        user_id,activity_date,action
        201,2024-04-01,view
        201,2024-04-15,click
        201,2024-04-30,purchase
      - |
        user_id,activity_date,action
        301,2024-07-01,view
        302,2024-07-01,click
        303,2024-07-02,view
        304,2024-07-03,purchase
        305,2024-07-04,view
        306,2024-07-05,click
        301,2024-08-01,view
        301,2024-08-15,click
expected_output_query: "SELECT DATE_TRUNC('month', activity_date) AS activity_month, COUNT(DISTINCT user_id) AS mau FROM user_activity GROUP BY DATE_TRUNC('month', activity_date) ORDER BY activity_month"
---

# Monthly Active Users Count

Write a query that counts the number of distinct active users per calendar month. A user active on multiple days within the same month should only be counted once for that month.

Return `activity_month` (the first day of each month) and the count as `mau`, ordered by month.

## Expected Output
activity_month,mau
2024-01-01,3
2024-02-01,5
2024-03-01,2
