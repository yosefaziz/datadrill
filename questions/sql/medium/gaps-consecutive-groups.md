---
title: "Consecutive Status Group Ranges"
difficulty: "Medium"
tags: ["gaps and islands", "ROW_NUMBER", "window functions", "grouping"]
track: sql-gaps-islands
track_level: 2
track_order: 1
hints:
  - "When a column stays the same across consecutive dates, there is a pattern you can exploit by comparing row positions to the dates themselves."
  - "Assign a ROW_NUMBER ordered by date within each status. Subtracting that number from the date produces a constant value for each consecutive group of the same status."
  - "Use check_date - ROW_NUMBER() OVER (PARTITION BY status ORDER BY check_date) * INTERVAL 1 DAY as a group key. Then GROUP BY status and that key to find each island's start, end, and duration."
tables:
  - name: server_status
    visible_data: |
      check_date,status
      2024-04-01,up
      2024-04-02,up
      2024-04-03,up
      2024-04-04,down
      2024-04-05,down
      2024-04-06,degraded
      2024-04-07,up
    hidden_datasets:
      - |
        check_date,status
        2024-07-01,down
        2024-07-02,down
        2024-07-03,up
        2024-07-04,up
        2024-07-05,up
        2024-07-06,down
      - |
        check_date,status
        2024-10-01,up
        2024-10-02,degraded
        2024-10-03,degraded
        2024-10-04,degraded
        2024-10-05,up
        2024-10-06,up
        2024-10-07,down
        2024-10-08,up
expected_output_query: "WITH grouped AS (SELECT check_date, status, check_date - ROW_NUMBER() OVER (PARTITION BY status ORDER BY check_date) * INTERVAL 1 DAY AS grp FROM server_status) SELECT status, MIN(check_date) AS start_date, MAX(check_date) AS end_date, (MAX(check_date) - MIN(check_date) + 1) AS duration_days FROM grouped GROUP BY status, grp ORDER BY start_date"
---

# Consecutive Status Group Ranges

Write a query that identifies consecutive groups of the same server status. Each group is a sequence of consecutive dates where the status remained unchanged.

Return `status`, `start_date`, `end_date`, and `duration_days` (number of days in the group, inclusive). Order the results by `start_date`.

## Expected Output
status,start_date,end_date,duration_days
up,2024-04-01,2024-04-03,3
down,2024-04-04,2024-04-05,2
degraded,2024-04-06,2024-04-06,1
up,2024-04-07,2024-04-07,1
