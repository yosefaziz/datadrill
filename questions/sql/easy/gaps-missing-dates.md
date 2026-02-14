---
title: "Find Missing Login Dates"
difficulty: "Easy"
tags: ["gaps and islands", "generate_series", "date gaps", "anti-join"]
track: sql-gaps-islands
track_level: 1
track_order: 1
hints:
  - "Think about generating a complete set of dates between the first and last login, then comparing it to what actually exists."
  - "DuckDB can generate a sequence of dates using generate_series. You can UNNEST the result and cast to DATE to get individual rows."
  - "Use UNNEST(generate_series(min_date, max_date, INTERVAL 1 DAY))::DATE to create all dates, then LEFT JOIN with daily_logins and filter for NULLs."
tables:
  - name: daily_logins
    visible_data: |
      user_id,login_date
      1,2024-03-01
      1,2024-03-02
      1,2024-03-04
      1,2024-03-05
      1,2024-03-08
      1,2024-03-10
    hidden_datasets:
      - |
        user_id,login_date
        1,2024-06-01
        1,2024-06-04
        1,2024-06-05
        1,2024-06-07
      - |
        user_id,login_date
        1,2024-09-10
        1,2024-09-11
        1,2024-09-12
        1,2024-09-13
        1,2024-09-14
expected_output_query: "WITH date_range AS (SELECT UNNEST(generate_series((SELECT MIN(login_date) FROM daily_logins), (SELECT MAX(login_date) FROM daily_logins), INTERVAL 1 DAY))::DATE AS cal_date) SELECT d.cal_date AS missing_date FROM date_range d LEFT JOIN daily_logins l ON d.cal_date = l.login_date WHERE l.login_date IS NULL ORDER BY missing_date"
---

# Find Missing Login Dates

Write a query that identifies dates where a user did not log in, given their login history. The range of dates to consider spans from the user's first login to their last login.

Return each gap as `missing_date`, ordered by date.

## Expected Output
missing_date
2024-03-03
2024-03-06
2024-03-07
2024-03-09
