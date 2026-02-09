---
title: "SUM vs COUNT Confusion"
difficulty: "Medium"
tags: ["SUM", "COUNT", "aggregation", "debugging", "SQL"]
language: sql
tables:
  - name: employees
    visible_data: |
      id,name,department,salary
      1,Alice,Engineering,85000
      2,Bob,Engineering,92000
      3,Charlie,Marketing,65000
      4,Diana,Marketing,70000
      5,Eve,Engineering,78000
    hidden_datasets:
      - |
        id,name,department,salary
        1,Frank,Sales,60000
        2,Grace,Sales,75000
        3,Henry,HR,55000
      - |
        id,name,department,salary
        1,Ivy,Engineering,90000
        2,Jack,Marketing,62000
        3,Kate,Engineering,88000
        4,Leo,HR,52000
broken_code: |
  SELECT department, COUNT(salary) as total_payroll
  FROM employees
  GROUP BY department
  ORDER BY department
expected_output_query: |
  SELECT department, SUM(salary) as total_payroll
  FROM employees
  GROUP BY department
  ORDER BY department
hint: "COUNT tells you how many values exist. What function gives you the total of those values?"
---

# SUM vs COUNT Confusion

The query should calculate total payroll per department, but it's showing headcount instead of salary totals.

Fix the aggregate function.

**The Bug:** `COUNT(salary)` counts the number of salary values, not their sum. Use `SUM(salary)` for the total.

## Expected Output
department,total_payroll
Engineering,255000
Marketing,135000
