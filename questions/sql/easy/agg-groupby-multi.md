---
title: "Employees by Department and City"
difficulty: "Easy"
tags: ["GROUP BY", "multiple columns", "COUNT"]
tables:
  - name: employees
    visible_data: |
      id,name,department,city
      1,Alice,Engineering,NYC
      2,Bob,Engineering,NYC
      3,Charlie,Engineering,SF
      4,David,Marketing,NYC
      5,Eve,Marketing,SF
      6,Frank,Marketing,SF
    hidden_datasets:
      - |
        id,name,department,city
        1,Grace,Sales,LA
        2,Henry,Sales,LA
        3,Ivy,Sales,NYC
      - |
        id,name,department,city
        1,Jack,HR,NYC
        2,Kate,HR,NYC
        3,Leo,HR,SF
        4,Mia,Engineering,LA
        5,Noah,Engineering,LA
expected_output_query: "SELECT department, city, COUNT(*) as employee_count FROM employees GROUP BY department, city ORDER BY department, city"
---

# Employees by Department and City

Write a query that counts employees in each department and city combination.

Return the `department`, `city`, and `employee_count`, ordered by department then city.

## Expected Output
department,city,employee_count
Engineering,NYC,2
Engineering,SF,1
Marketing,NYC,1
Marketing,SF,2
