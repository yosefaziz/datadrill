---
title: "Salary Quartile Buckets"
difficulty: "Hard"
tags: ["NTILE", "window functions", "percentile"]
tables:
  - name: employees
    visible_data: |
      id,name,salary
      1,Alice,50000
      2,Bob,60000
      3,Charlie,70000
      4,Diana,80000
      5,Eve,55000
      6,Frank,75000
      7,Grace,65000
      8,Henry,90000
    hidden_datasets:
      - |
        id,name,salary
        1,Ivy,40000
        2,Jack,60000
        3,Kate,80000
        4,Leo,100000
      - |
        id,name,salary
        1,Mia,30000
        2,Noah,45000
        3,Olivia,55000
        4,Paul,65000
        5,Quinn,75000
        6,Rose,85000
expected_output_query: "SELECT name, salary, NTILE(4) OVER (ORDER BY salary) as salary_quartile FROM employees ORDER BY salary"
---

# Salary Quartile Buckets

Write a query that divides employees into 4 salary quartiles using `NTILE(4)`.

Quartile 1 has the lowest salaries, quartile 4 has the highest.

Return `name`, `salary`, and `salary_quartile`, ordered by salary ascending.

## Expected Output
| name    | salary | salary_quartile |
|---------|--------|-----------------|
| Alice   | 50000  | 1               |
| Eve     | 55000  | 1               |
| Bob     | 60000  | 2               |
| Grace   | 65000  | 2               |
| Charlie | 70000  | 3               |
| Frank   | 75000  | 3               |
| Diana   | 80000  | 4               |
| Henry   | 90000  | 4               |
