---
title: "Employees on High-Budget Projects"
difficulty: "Medium"
tags: ["EXISTS", "correlated subquery", "WHERE"]
tables:
  - name: employees
    visible_data: |
      id,name,department
      1,Alice,Engineering
      2,Bob,Marketing
      3,Charlie,Engineering
      4,David,Sales
      5,Eve,Engineering
    hidden_datasets:
      - |
        id,name,department
        1,Frank,HR
        2,Grace,Engineering
        3,Henry,HR
      - |
        id,name,department
        1,Ivy,Sales
        2,Jack,Engineering
        3,Kate,Marketing
        4,Leo,Engineering
  - name: assignments
    visible_data: |
      employee_id,project_id
      1,101
      2,102
      3,101
      5,103
    hidden_datasets:
      - |
        employee_id,project_id
        1,201
        2,202
      - |
        employee_id,project_id
        1,301
        2,301
        3,302
        4,303
  - name: projects
    visible_data: |
      id,project_name,budget
      101,Data Platform,80000
      102,Ad Campaign,30000
      103,ML Pipeline,60000
    hidden_datasets:
      - |
        id,project_name,budget
        201,CRM System,70000
        202,Newsletter,20000
      - |
        id,project_name,budget
        301,Analytics,75000
        302,Mobile App,45000
        303,Website,55000
expected_output_query: "SELECT e.name, e.department FROM employees e WHERE EXISTS (SELECT 1 FROM assignments a JOIN projects p ON a.project_id = p.id WHERE a.employee_id = e.id AND p.budget > 50000) ORDER BY e.name"
---

# Employees on High-Budget Projects

Write a query that finds employees assigned to projects with a budget greater than 50,000.

Use a correlated `EXISTS` subquery that joins `assignments` and `projects`.

Return the employee `name` and `department`, ordered by name.

## Expected Output
name,department
Alice,Engineering
Charlie,Engineering
Eve,Engineering
