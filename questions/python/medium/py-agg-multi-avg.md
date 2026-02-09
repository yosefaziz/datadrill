---
title: "Department Salary Stats"
difficulty: "Medium"
tags: ["groupBy", "agg", "avg", "max", "pyspark"]
tables:
  - name: employees
    visible_data: |
      id,name,department,salary,years_experience
      1,Alice,Engineering,85000,5
      2,Bob,Engineering,92000,8
      3,Charlie,Marketing,65000,3
      4,Diana,Marketing,70000,6
      5,Eve,Engineering,78000,4
    hidden_datasets:
      - |
        id,name,department,salary,years_experience
        1,Frank,Sales,60000,2
        2,Grace,Sales,75000,7
      - |
        id,name,department,salary,years_experience
        1,Henry,HR,55000,3
        2,Ivy,HR,62000,5
        3,Jack,HR,58000,4
        4,Kate,Engineering,95000,10
expected_output_query: |
  result = employees.groupBy("department").agg(
      avg("salary").alias("avg_salary"),
      max("years_experience").alias("max_experience")
  )
---

# Department Salary Stats

Group the `employees` DataFrame by `department` and calculate average salary and maximum years of experience.

Your result should be stored in a variable called `result`.

**Hint:** Use `.agg(avg("salary").alias("avg_salary"), max("years_experience").alias("max_experience"))`.

## Expected Output
department,avg_salary,max_experience
Engineering,85000.0,8
Marketing,67500.0,6
