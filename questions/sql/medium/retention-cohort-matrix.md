---
title: "Cohort Retention Rate Matrix"
difficulty: "Medium"
tags: ["retention", "cohort", "DATE_TRUNC", "DATEDIFF", "ROUND", "conditional aggregation"]
track: sql-retention-cohort
track_level: 2
track_order: 2
hints:
  - "Think of each signup month as a cohort. For each cohort, you need to calculate what percentage of users were active 0, 1, and 2 months after their signup month."
  - "Use DATE_TRUNC to assign cohorts and DATEDIFF on the truncated months to compute the month offset. Then use conditional aggregation (COUNT DISTINCT with CASE) for each offset, dividing by cohort size and rounding."
  - "For each month offset (0, 1, 2), compute ROUND(COUNT(DISTINCT CASE WHEN offset = N THEN user_id END) * 100.0 / COUNT(DISTINCT u.user_id), 1). Group everything by the truncated signup month."
tables:
  - name: users
    visible_data: |
      user_id,signup_date
      1,2024-01-08
      2,2024-01-15
      3,2024-01-22
      4,2024-02-05
      5,2024-02-12
    hidden_datasets:
      - |
        user_id,signup_date
        101,2024-04-03
        102,2024-04-18
        103,2024-05-07
        104,2024-05-20
      - |
        user_id,signup_date
        201,2024-08-01
        202,2024-08-14
        203,2024-08-25
        204,2024-09-03
        205,2024-09-18
  - name: activity
    visible_data: |
      user_id,activity_date
      1,2024-01-10
      1,2024-02-05
      1,2024-03-12
      2,2024-01-20
      2,2024-02-18
      3,2024-01-25
      4,2024-02-08
      4,2024-03-10
      5,2024-02-15
      5,2024-03-20
      5,2024-04-05
    hidden_datasets:
      - |
        user_id,activity_date
        101,2024-04-10
        101,2024-05-08
        102,2024-04-22
        102,2024-05-15
        102,2024-06-10
        103,2024-05-12
        104,2024-05-25
        104,2024-06-18
      - |
        user_id,activity_date
        201,2024-08-05
        201,2024-09-10
        202,2024-08-18
        202,2024-09-22
        202,2024-10-15
        203,2024-08-28
        204,2024-09-08
        204,2024-10-12
        205,2024-09-20
expected_output_query: "SELECT DATE_TRUNC('month', u.signup_date) AS cohort_month, COUNT(DISTINCT u.user_id) AS cohort_size, ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF('month', DATE_TRUNC('month', u.signup_date), DATE_TRUNC('month', a.activity_date)) = 0 THEN a.user_id END) * 100.0 / COUNT(DISTINCT u.user_id), 1) AS month_0_pct, ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF('month', DATE_TRUNC('month', u.signup_date), DATE_TRUNC('month', a.activity_date)) = 1 THEN a.user_id END) * 100.0 / COUNT(DISTINCT u.user_id), 1) AS month_1_pct, ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF('month', DATE_TRUNC('month', u.signup_date), DATE_TRUNC('month', a.activity_date)) = 2 THEN a.user_id END) * 100.0 / COUNT(DISTINCT u.user_id), 1) AS month_2_pct FROM users u LEFT JOIN activity a ON u.user_id = a.user_id GROUP BY DATE_TRUNC('month', u.signup_date) ORDER BY cohort_month"
---

# Cohort Retention Rate Matrix

Write a query that builds a cohort retention matrix. Group users by their signup month to form cohorts. For each cohort, calculate the percentage of users who were active in their signup month (month 0), one month later (month 1), and two months later (month 2). A user counts as active in a month if they have any activity record in that calendar month.

Return `cohort_month`, `cohort_size`, `month_0_pct`, `month_1_pct`, and `month_2_pct`. Round all percentages to one decimal place. Order by cohort month.

## Expected Output
cohort_month,cohort_size,month_0_pct,month_1_pct,month_2_pct
2024-01-01,3,100.0,66.7,33.3
2024-02-01,2,100.0,100.0,50.0
