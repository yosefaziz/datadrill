---
title: "Select All Users"
difficulty: "Easy"
tags: ["SELECT", "basics"]
tables:
  - name: users
    visible_data: |
      id,name,email
      1,Alice,alice@example.com
      2,Bob,bob@example.com
      3,Charlie,charlie@example.com
    hidden_datasets:
      - |
        id,name,email
        1,David,david@test.com
        2,Eve,eve@test.com
      - |
        id,name,email
        1,Frank,frank@demo.com
        2,Grace,grace@demo.com
        3,Henry,henry@demo.com
        4,Ivy,ivy@demo.com
expected_output_query: "SELECT * FROM users"
---

# Select All Users

Write a query to select all columns from the `users` table.

## Expected Output
| id | name    | email               |
|----|---------|---------------------|
| 1  | Alice   | alice@example.com   |
| 2  | Bob     | bob@example.com     |
| 3  | Charlie | charlie@example.com |
