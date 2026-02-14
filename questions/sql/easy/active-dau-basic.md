---
title: "Daily Active Users Count"
difficulty: "Easy"
tags: ["COUNT", "DISTINCT", "GROUP BY", "active users"]
track: sql-active-users
track_level: 1
track_order: 1
hints:
  - "A user who performs multiple actions in a day should only be counted once."
  - "Use COUNT(DISTINCT ...) to avoid double-counting users within the same day."
  - "Group by the date column and count distinct user IDs, then order by date."
tables:
  - name: user_activity
    visible_data: |
      user_id,activity_date,action
      101,2024-03-01,view
      101,2024-03-01,click
      102,2024-03-01,view
      103,2024-03-01,purchase
      101,2024-03-02,view
      102,2024-03-02,click
      102,2024-03-02,purchase
      104,2024-03-02,view
      101,2024-03-03,click
      103,2024-03-03,view
      103,2024-03-03,click
      104,2024-03-03,purchase
      105,2024-03-03,view
    hidden_datasets:
      - |
        user_id,activity_date,action
        201,2024-06-10,view
        201,2024-06-10,click
        201,2024-06-10,purchase
        201,2024-06-11,view
      - |
        user_id,activity_date,action
        301,2024-09-01,view
        302,2024-09-01,click
        303,2024-09-01,view
        304,2024-09-01,purchase
        305,2024-09-01,view
        301,2024-09-02,view
expected_output_query: "SELECT activity_date, COUNT(DISTINCT user_id) AS dau FROM user_activity GROUP BY activity_date ORDER BY activity_date"
---

# Daily Active Users Count

Write a query that counts the number of distinct active users for each day. A user who performs multiple actions on the same day should only be counted once.

Return `activity_date` and the count as `dau`, ordered by date.

## Expected Output
activity_date,dau
2024-03-01,3
2024-03-02,3
2024-03-03,4
