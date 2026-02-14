---
title: "Day 1 and Day 7 Retention"
difficulty: "Easy"
tags: ["retention", "LEFT JOIN", "INTERVAL", "ROUND", "conditional aggregation"]
track: sql-retention-cohort
track_level: 1
track_order: 1
hints:
  - "Think about how to check if a user came back on a specific day relative to their signup - you need to compare two dates with a fixed offset."
  - "Use LEFT JOIN to match each signup with a login that occurred exactly N days later. Joining once for day 1 and once for day 7 lets you check both in a single query."
  - "LEFT JOIN logins on user_id WHERE login_date = signup_date + INTERVAL 1 DAY for day 1 (and +7 for day 7), then COUNT DISTINCT non-null matches and divide by total signups."
tables:
  - name: signups
    visible_data: |
      user_id,signup_date
      1,2024-01-10
      2,2024-01-10
      3,2024-01-10
      4,2024-01-11
      5,2024-01-11
      6,2024-01-12
    hidden_datasets:
      - |
        user_id,signup_date
        101,2024-03-01
        102,2024-03-01
        103,2024-03-02
        104,2024-03-02
      - |
        user_id,signup_date
        201,2024-06-15
        202,2024-06-15
        203,2024-06-15
        204,2024-06-16
        205,2024-06-16
  - name: logins
    visible_data: |
      user_id,login_date
      1,2024-01-11
      1,2024-01-17
      2,2024-01-11
      3,2024-01-15
      4,2024-01-12
      4,2024-01-18
      5,2024-01-14
      6,2024-01-13
    hidden_datasets:
      - |
        user_id,login_date
        101,2024-03-02
        101,2024-03-08
        102,2024-03-05
        103,2024-03-03
      - |
        user_id,login_date
        201,2024-06-16
        201,2024-06-22
        202,2024-06-22
        203,2024-06-17
        204,2024-06-17
        205,2024-06-20
expected_output_query: "SELECT COUNT(DISTINCT s.user_id) AS total_signups, COUNT(DISTINCT CASE WHEN l1.user_id IS NOT NULL THEN s.user_id END) AS day1_retained, ROUND(COUNT(DISTINCT CASE WHEN l1.user_id IS NOT NULL THEN s.user_id END) * 100.0 / COUNT(DISTINCT s.user_id), 1) AS day1_retention_pct, COUNT(DISTINCT CASE WHEN l7.user_id IS NOT NULL THEN s.user_id END) AS day7_retained, ROUND(COUNT(DISTINCT CASE WHEN l7.user_id IS NOT NULL THEN s.user_id END) * 100.0 / COUNT(DISTINCT s.user_id), 1) AS day7_retention_pct FROM signups s LEFT JOIN logins l1 ON s.user_id = l1.user_id AND l1.login_date = s.signup_date + INTERVAL 1 DAY LEFT JOIN logins l7 ON s.user_id = l7.user_id AND l7.login_date = s.signup_date + INTERVAL 7 DAY"
---

# Day 1 and Day 7 Retention

Write a query that calculates Day 1 and Day 7 retention rates across all signups. Day 1 retention is the percentage of users who logged in exactly 1 day after their signup date. Day 7 retention is the percentage who logged in exactly 7 days after signup.

Return a single row with `total_signups`, `day1_retained`, `day1_retention_pct`, `day7_retained`, and `day7_retention_pct`. Round percentages to one decimal place.

## Expected Output
total_signups,day1_retained,day1_retention_pct,day7_retained,day7_retention_pct
6,4,66.7,2,33.3
