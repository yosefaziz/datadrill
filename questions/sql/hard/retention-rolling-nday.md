---
title: "Rolling 7-Day Period Retention"
difficulty: "Hard"
tags: ["retention", "cohort", "DATE_TRUNC", "DATEDIFF", "integer division", "CTE"]
track: sql-retention-cohort
track_level: 3
track_order: 1
hints:
  - "Instead of calendar months, divide time after signup into fixed 7-day windows. The challenge is mapping each activity to the correct period based on how many days have passed since the user signed up."
  - "Calculate the number of days between signup and each activity, then use integer division by 7 to assign a period number. Period 0 covers days 0-6, period 1 covers days 7-13, and so on. Use a CTE to compute these values before aggregating."
  - "In a CTE, compute DATEDIFF('day', signup_date, activity_date) / 7 as the period for each user-activity pair. Join to a cohort sizes subquery, then GROUP BY cohort_month and period to get COUNT(DISTINCT user_id) and divide by cohort size for retention_pct."
tables:
  - name: users
    visible_data: |
      user_id,signup_date
      1,2024-01-03
      2,2024-01-10
      3,2024-01-15
      4,2024-02-02
      5,2024-02-08
    hidden_datasets:
      - |
        user_id,signup_date
        101,2024-04-01
        102,2024-04-05
        103,2024-04-12
        104,2024-05-01
      - |
        user_id,signup_date
        201,2024-07-01
        202,2024-07-10
        203,2024-07-15
        204,2024-07-22
        205,2024-08-01
        206,2024-08-10
  - name: activity
    visible_data: |
      user_id,activity_date
      1,2024-01-05
      1,2024-01-14
      1,2024-01-21
      2,2024-01-12
      2,2024-01-20
      3,2024-01-17
      4,2024-02-05
      4,2024-02-12
      5,2024-02-10
      5,2024-02-18
      5,2024-02-25
    hidden_datasets:
      - |
        user_id,activity_date
        101,2024-04-03
        101,2024-04-10
        102,2024-04-08
        102,2024-04-15
        103,2024-04-14
        104,2024-05-05
        104,2024-05-14
      - |
        user_id,activity_date
        201,2024-07-03
        201,2024-07-12
        201,2024-07-20
        202,2024-07-14
        202,2024-07-22
        203,2024-07-18
        203,2024-07-28
        204,2024-07-25
        205,2024-08-04
        205,2024-08-14
        206,2024-08-12
expected_output_query: "WITH cohort_activity AS (SELECT DATE_TRUNC('month', u.signup_date) AS cohort_month, a.user_id, DATEDIFF('day', u.signup_date, a.activity_date) / 7 AS period FROM users u JOIN activity a ON u.user_id = a.user_id WHERE a.activity_date >= u.signup_date), cohort_sizes AS (SELECT DATE_TRUNC('month', signup_date) AS cohort_month, COUNT(DISTINCT user_id) AS cohort_size FROM users GROUP BY DATE_TRUNC('month', signup_date)) SELECT ca.cohort_month, ca.period, COUNT(DISTINCT ca.user_id) AS retained_users, ROUND(COUNT(DISTINCT ca.user_id) * 100.0 / cs.cohort_size, 1) AS retention_pct FROM cohort_activity ca JOIN cohort_sizes cs ON ca.cohort_month = cs.cohort_month GROUP BY ca.cohort_month, ca.period, cs.cohort_size ORDER BY ca.cohort_month, ca.period"
---

# Rolling 7-Day Period Retention

Write a query that calculates rolling 7-day retention for monthly signup cohorts. Instead of using calendar months, divide the time after each user's signup into 7-day periods. Period 0 covers days 0-6 after signup, period 1 covers days 7-13, period 2 covers days 14-20, and so on. A user is retained in a period if they have at least one activity record during that window.

Group users into monthly cohorts by signup date. For each cohort and period, return the number of retained users and the retention percentage relative to the cohort size. Round percentages to one decimal place.

Return `cohort_month`, `period`, `retained_users`, and `retention_pct`, ordered by cohort month then period.

## Expected Output
cohort_month,period,retained_users,retention_pct
2024-01-01,0,3,100.0
2024-01-01,1,2,66.7
2024-01-01,2,1,33.3
2024-02-01,0,2,100.0
2024-02-01,1,2,100.0
2024-02-01,2,1,50.0
