---
title: "Monthly Cohort Retention Counts"
difficulty: "Medium"
tags: ["retention", "cohort", "DATE_TRUNC", "DATEDIFF", "conditional aggregation"]
track: sql-retention-cohort
track_level: 2
track_order: 1
hints:
  - "Start by figuring out which month each user belongs to based on their signup date, then determine how many months after signup each activity occurred."
  - "Use DATE_TRUNC('month', signup_date) to assign cohorts. Calculate the month offset between the cohort month and each activity month using DATEDIFF, then use COUNT DISTINCT with CASE expressions for each period."
  - "LEFT JOIN users to activity, group by the truncated signup month, and use COUNT(DISTINCT CASE WHEN month_offset = 0 THEN user_id END) for month 0 and the same pattern with offset = 1 for month 1."
tables:
  - name: users
    visible_data: |
      user_id,signup_date
      1,2024-01-05
      2,2024-01-12
      3,2024-01-20
      4,2024-02-03
      5,2024-02-14
      6,2024-03-01
    hidden_datasets:
      - |
        user_id,signup_date
        101,2024-06-02
        102,2024-06-18
        103,2024-07-05
        104,2024-07-22
      - |
        user_id,signup_date
        201,2024-09-01
        202,2024-09-10
        203,2024-09-25
        204,2024-10-05
        205,2024-10-15
        206,2024-11-01
  - name: activity
    visible_data: |
      user_id,activity_date
      1,2024-01-06
      1,2024-02-10
      2,2024-01-15
      3,2024-01-25
      3,2024-02-18
      4,2024-02-10
      4,2024-03-05
      5,2024-02-20
      6,2024-03-15
    hidden_datasets:
      - |
        user_id,activity_date
        101,2024-06-05
        101,2024-07-12
        102,2024-06-20
        103,2024-07-10
        103,2024-08-15
        104,2024-07-28
      - |
        user_id,activity_date
        201,2024-09-05
        202,2024-09-15
        202,2024-10-08
        203,2024-09-28
        203,2024-10-20
        204,2024-10-10
        205,2024-10-18
        206,2024-11-10
expected_output_query: "SELECT DATE_TRUNC('month', u.signup_date) AS cohort_month, COUNT(DISTINCT u.user_id) AS cohort_size, COUNT(DISTINCT CASE WHEN DATEDIFF('month', DATE_TRUNC('month', u.signup_date), DATE_TRUNC('month', a.activity_date)) = 0 THEN a.user_id END) AS month_0_active, COUNT(DISTINCT CASE WHEN DATEDIFF('month', DATE_TRUNC('month', u.signup_date), DATE_TRUNC('month', a.activity_date)) = 1 THEN a.user_id END) AS month_1_active FROM users u LEFT JOIN activity a ON u.user_id = a.user_id GROUP BY DATE_TRUNC('month', u.signup_date) ORDER BY cohort_month"
---

# Monthly Cohort Retention Counts

Write a query that groups users into monthly signup cohorts and counts how many users from each cohort were active in their signup month (month 0) and in the following month (month 1). A user is considered active in a month if they have at least one record in the activity table during that calendar month.

Return `cohort_month`, `cohort_size`, `month_0_active`, and `month_1_active`, ordered by cohort month.

## Expected Output
cohort_month,cohort_size,month_0_active,month_1_active
2024-01-01,3,3,2
2024-02-01,2,2,1
2024-03-01,1,1,0
