---
title: "Employees in High-Budget Departments"
difficulty: "Easy"
tags: ["IN", "subquery"]
tables:
  - name: employees
    visible_data: |
      id,name,department_id
      1,Alice,1
      2,Bob,2
      3,Charlie,1
      4,David,3
      5,Eve,2
    hidden_datasets:
      - |
        id,name,department_id
        1,Frank,1
        2,Grace,2
        3,Henry,3
      - |
        id,name,department_id
        1,Ivy,1
        2,Jack,2
        3,Kate,3
        4,Leo,1
        5,Mia,4
        6,Noah,2
  - name: departments
    visible_data: |
      id,dept_name,budget
      1,Engineering,500000
      2,Marketing,200000
      3,Sales,350000
    hidden_datasets:
      - |
        id,dept_name,budget
        1,Engineering,600000
        2,Support,100000
        3,Research,400000
      - |
        id,dept_name,budget
        1,Engineering,500000
        2,Marketing,150000
        3,Sales,350000
        4,Support,50000
expected_output_query: "SELECT e.name FROM employees e WHERE e.department_id IN (SELECT id FROM departments WHERE budget > 300000) ORDER BY e.name"
---

# Employees in High-Budget Departments

Write a query that finds all employees who work in departments with a budget greater than 300,000.

Use a subquery with the `IN` operator to filter employees.

Return only the employee `name`, ordered alphabetically.

## Expected Output
name
Alice
Charlie
David
