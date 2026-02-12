---
title: "NOT IN with NULL Trap"
difficulty: "Hard"
tags: ["NOT IN", "NULL", "debugging", "SQL"]
language: sql
tables:
  - name: employees
    visible_data: |
      id,name
      1,Alice
      2,Bob
      3,Charlie
      4,Diana
      5,Eve
    hidden_datasets:
      - |
        id,name
        1,Frank
        2,Grace
        3,Henry
      - |
        id,name
        1,Ivy
        2,Jack
        3,Kate
        4,Leo
  - name: terminated_employees
    visible_data: |
      id,employee_id,reason
      1,2,Resigned
      2,4,Layoff
      3,,Transfer
    hidden_datasets:
      - |
        id,employee_id,reason
        1,1,Resigned
        2,,Unknown
      - |
        id,employee_id,reason
        1,3,Resigned
        2,,Retired
broken_code: |
  SELECT name
  FROM employees
  WHERE id NOT IN (SELECT employee_id FROM terminated_employees)
  ORDER BY name
expected_output_query: |
  SELECT name
  FROM employees
  WHERE id NOT IN (SELECT employee_id FROM terminated_employees WHERE employee_id IS NOT NULL)
  ORDER BY name
hint: "Look at the terminated_employees table. One row has a NULL employee_id. What does NOT IN do when the list contains NULL?"
---

# NOT IN with NULL Trap

The query should find active employees (not in the terminated list), but it returns no rows at all.

Fix the subquery to handle NULLs.


## Expected Output
name
Alice
Charlie
Eve
