---
title: "Employee and Manager Names"
difficulty: "Easy"
tags: ["self-join", "JOIN"]
tables:
  - name: employees
    visible_data: |
      id,name,manager_id
      1,Alice,
      2,Bob,1
      3,Charlie,1
      4,David,2
      5,Eve,2
    hidden_datasets:
      - |
        id,name,manager_id
        1,Frank,
        2,Grace,1
        3,Henry,1
      - |
        id,name,manager_id
        1,Ivy,
        2,Jack,1
        3,Kate,2
        4,Leo,2
        5,Mia,1
        6,Noah,3
expected_output_query: "SELECT e.name as employee_name, m.name as manager_name FROM employees e JOIN employees m ON e.manager_id = m.id ORDER BY e.name"
---

# Employee and Manager Names

Write a query that shows each employee alongside their manager's name using a self-join.

Return `employee_name` and `manager_name`. Only include employees who have a manager.

Order the results by employee name.

## Expected Output
| employee_name | manager_name |
|---------------|--------------|
| Bob           | Alice        |
| Charlie       | Alice        |
| David         | Bob          |
| Eve           | Bob          |
