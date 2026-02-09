---
title: "Top N Employees per Department"
difficulty: "Medium"
tags: ["ROW_NUMBER", "PARTITION BY", "Top-N"]
tables:
  - name: employees
    visible_data: |
      id,name,department,salary
      1,Alice,Engineering,95000
      2,Bob,Engineering,88000
      3,Charlie,Engineering,72000
      4,David,Sales,68000
      5,Eve,Sales,75000
      6,Frank,Sales,82000
    hidden_datasets:
      - |
        id,name,department,salary
        1,Grace,Engineering,105000
        2,Henry,Sales,92000
        3,Ivy,Marketing,78000
      - |
        id,name,department,salary
        1,Jack,Engineering,110000
        2,Kate,Engineering,98000
        3,Leo,Sales,65000
        4,Mia,Sales,71000
        5,Noah,Marketing,85000
        6,Olivia,Marketing,90000
expected_output_query: "SELECT name, department, salary FROM (SELECT name, department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rn FROM employees) sub WHERE rn <= 2 ORDER BY department, salary DESC"
---

# Top N Employees per Department

Given the `employees` table, find the top 2 highest-paid employees in each department.

Use `ROW_NUMBER()` with `PARTITION BY` to rank employees within each department by salary (highest first), then filter to keep only the top 2.

Return the `name`, `department`, and `salary`.

Order the results by `department`, then by `salary` descending.

## Expected Output
name,department,salary
Alice,Engineering,95000
Bob,Engineering,88000
Frank,Sales,82000
Eve,Sales,75000
