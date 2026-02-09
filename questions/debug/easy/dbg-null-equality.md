---
title: "NULL Equality Comparison Bug"
difficulty: "Easy"
tags: ["NULL", "IS NULL", "debugging", "SQL"]
language: sql
tables:
  - name: users
    visible_data: |
      id,name,email
      1,Alice,alice@example.com
      2,Bob,
      3,Charlie,charlie@example.com
      4,Diana,
      5,Eve,eve@example.com
    hidden_datasets:
      - |
        id,name,email
        1,Frank,frank@test.com
        2,Grace,
        3,Henry,
      - |
        id,name,email
        1,Ivy,
        2,Jack,jack@demo.com
        3,Kate,
        4,Leo,leo@demo.com
        5,Mia,
        6,Noah,noah@demo.com
broken_code: |
  SELECT name
  FROM users
  WHERE email = NULL
  ORDER BY name
expected_output_query: |
  SELECT name
  FROM users
  WHERE email IS NULL
  ORDER BY name
hint: "In SQL, nothing equals NULL — not even NULL itself. How do you check for NULL values?"
---

# NULL Equality Comparison Bug

The query below is supposed to find users who have no email address, but it returns no rows at all.

Fix the query so it correctly finds users with NULL emails.

**The Bug:** `email = NULL` always evaluates to `NULL` (not TRUE), so no rows match. Use `IS NULL` instead.

## Expected Output
| name  |
|-------|
| Bob   |
| Diana |
