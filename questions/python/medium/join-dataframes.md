---
title: "Join DataFrames"
difficulty: "Medium"
tags: ["join", "inner join", "pyspark"]
tables:
  - name: employees
    visible_data: |
      emp_id,name,dept_id
      1,Alice,10
      2,Bob,20
      3,Charlie,10
      4,Diana,30
    hidden_datasets:
      - |
        emp_id,name,dept_id
        1,Eve,100
        2,Frank,200
        3,Grace,100
      - |
        emp_id,name,dept_id
        1,Henry,1
        2,Ivy,2
        3,Jack,1
        4,Kate,3
  - name: departments
    visible_data: |
      dept_id,dept_name
      10,Engineering
      20,Marketing
      30,Sales
    hidden_datasets:
      - |
        dept_id,dept_name
        100,Research
        200,Finance
      - |
        dept_id,dept_name
        1,IT
        2,HR
        3,Legal
expected_output_query: |
  result = employees.join(departments, "dept_id").select("name", "dept_name")
---

# Join DataFrames

Join the `employees` DataFrame with the `departments` DataFrame on `dept_id`, then select only the employee `name` and `dept_name` columns.

Your result should be stored in a variable called `result`.

**Hint:** Use `.join()` with the join key, then `.select()` the columns you need.

## Expected Output
name,dept_name
Alice,Engineering
Bob,Marketing
Charlie,Engineering
Diana,Sales
