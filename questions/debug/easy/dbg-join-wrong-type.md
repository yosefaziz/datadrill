---
title: "Wrong JOIN Drops Unassigned Employees"
difficulty: "Easy"
tags: ["JOIN", "debugging", "SQL"]
language: sql
tables:
  - name: employees
    visible_data: |
      id,name,department_id
      1,Alice,1
      2,Bob,2
      3,Charlie,
      4,David,1
      5,Eve,
    hidden_datasets:
      - |
        id,name,department_id
        1,Frank,1
        2,Grace,
        3,Henry,2
      - |
        id,name,department_id
        1,Ivy,1
        2,Jack,2
        3,Kate,
        4,Leo,
        5,Mia,1
  - name: departments
    visible_data: |
      id,dept_name
      1,Engineering
      2,Marketing
    hidden_datasets:
      - |
        id,dept_name
        1,Sales
        2,HR
      - |
        id,dept_name
        1,Engineering
        2,Marketing
broken_code: |
  SELECT e.name, d.dept_name
  FROM employees e
  INNER JOIN departments d ON e.department_id = d.id
  ORDER BY e.name
expected_output_query: |
  SELECT e.name, d.dept_name
  FROM employees e
  LEFT JOIN departments d ON e.department_id = d.id
  ORDER BY e.name
hint: "Some employees have no department assigned. Should they be excluded from the results?"
---

# Wrong JOIN Drops Unassigned Employees

The query below is meant to list ALL employees with their department name (or NULL if unassigned). But some employees are missing from the results.

Fix the query so that employees without a department still appear.

**The Bug:** `INNER JOIN` excludes employees with NULL `department_id`. Use `LEFT JOIN` instead.

## Expected Output
name,dept_name
Alice,Engineering
Bob,Marketing
Charlie,
David,Engineering
Eve,
