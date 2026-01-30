---
title: "Department Salary Rankings"
difficulty: "Hard"
tags: ["window functions", "JOIN", "RANK"]
tables:
  - name: employees
    visible_data: |
      id,name,department_id,salary
      1,Alice,1,50000
      2,Bob,1,60000
      3,Charlie,1,55000
      4,David,2,70000
      5,Eve,2,65000
    hidden_datasets:
      - |
        id,name,department_id,salary
        1,Frank,1,80000
        2,Grace,1,80000
        3,Henry,1,70000
        4,Ivy,2,90000
        5,Jack,2,85000
        6,Kate,2,85000
      - |
        id,name,department_id,salary
        1,Leo,1,100000
        2,Mia,2,100000
        3,Noah,3,100000
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
expected_output_query: "SELECT d.name as department, e.name as employee, e.salary, RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) as salary_rank FROM employees e JOIN departments d ON e.department_id = d.id ORDER BY d.name, salary_rank"
---

# Department Salary Rankings

Write a query that ranks employees by salary within their department.

Return the department name, employee name, salary, and their rank within the department (highest salary = rank 1).

Order the results by department name, then by rank.

## Expected Output
| department  | employee | salary | salary_rank |
|-------------|----------|--------|-------------|
| Engineering | Bob      | 60000  | 1           |
| Engineering | Charlie  | 55000  | 2           |
| Engineering | Alice    | 50000  | 3           |
| Sales       | David    | 70000  | 1           |
| Sales       | Eve      | 65000  | 2           |
