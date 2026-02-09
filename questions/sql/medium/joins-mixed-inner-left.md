---
title: "Mixed INNER and LEFT JOIN"
difficulty: "Medium"
tags: ["INNER JOIN", "LEFT JOIN", "multi-table"]
tables:
  - name: employees
    visible_data: |
      id,name,department_id,project_id
      1,Alice,1,10
      2,Bob,1,NULL
      3,Charlie,2,11
      4,David,2,10
      5,Eve,1,NULL
    hidden_datasets:
      - |
        id,name,department_id,project_id
        1,Frank,1,10
        2,Grace,2,NULL
        3,Henry,1,11
      - |
        id,name,department_id,project_id
        1,Ivy,1,10
        2,Jack,1,11
        3,Kate,2,NULL
        4,Leo,2,10
        5,Mia,3,NULL
        6,Noah,3,12
  - name: departments
    visible_data: |
      id,name
      1,Engineering
      2,Sales
    hidden_datasets:
      - |
        id,name
        1,Engineering
        2,Sales
      - |
        id,name
        1,Engineering
        2,Sales
        3,Marketing
  - name: projects
    visible_data: |
      id,title
      10,Alpha
      11,Beta
    hidden_datasets:
      - |
        id,title
        10,Alpha
        11,Beta
      - |
        id,title
        10,Alpha
        11,Beta
        12,Gamma
expected_output_query: "SELECT e.name as employee, d.name as department, p.title as project FROM employees e INNER JOIN departments d ON e.department_id = d.id LEFT JOIN projects p ON e.project_id = p.id ORDER BY e.name"
---

# Mixed INNER and LEFT JOIN

Given three tables -- `employees`, `departments`, and `projects` -- write a query to show each employee with their department and project.

Every employee must belong to a department (use `INNER JOIN`), but not every employee is assigned to a project (use `LEFT JOIN`). If an employee has no project, show `NULL` for the project title.

Return the `employee` name, `department` name, and `project` title.

Order the results by employee name.

## Expected Output
| employee | department  | project |
|----------|-------------|---------|
| Alice    | Engineering | Alpha   |
| Bob      | Engineering | NULL    |
| Charlie  | Sales       | Beta    |
| David    | Sales       | Alpha   |
| Eve      | Engineering | NULL    |
