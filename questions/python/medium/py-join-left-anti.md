---
title: "Find Inactive Users"
difficulty: "Medium"
interview_relevant: false
tags: ["pyspark", "join", "left_anti"]
tables:
  - name: all_users
    visible_data: |
      user_id,name,signup_date
      1,Alice,2024-01-01
      2,Bob,2024-01-05
      3,Charlie,2024-01-10
      4,Diana,2024-01-15
      5,Eve,2024-01-20
    hidden_datasets:
      - |
        user_id,name,signup_date
        10,Frank,2024-02-01
        11,Grace,2024-02-05
        12,Henry,2024-02-10
      - |
        user_id,name,signup_date
        20,Ivy,2024-03-01
        21,Jack,2024-03-05
        22,Kate,2024-03-10
        23,Leo,2024-03-15
  - name: active_users
    visible_data: |
      user_id,last_login
      1,2024-06-01
      3,2024-06-05
      5,2024-06-10
    hidden_datasets:
      - |
        user_id,last_login
        10,2024-07-01
      - |
        user_id,last_login
        20,2024-08-01
        22,2024-08-05
expected_output_query: |
  result = all_users.join(active_users, "user_id", "left_anti")
---

# Find Inactive Users

Find users who are NOT in the `active_users` DataFrame using a left anti join.

This returns all rows from `all_users` that have no matching `user_id` in `active_users`.

Your result should be stored in a variable called `result`.

**Hint:** Use `.join(active_users, "user_id", "left_anti")`.

## Expected Output
user_id,name,signup_date
2,Bob,2024-01-05
4,Diana,2024-01-15
