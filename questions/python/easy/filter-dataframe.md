---
title: "Filter DataFrame"
difficulty: "Easy"
interview_relevant: false
tags: ["pyspark", "filter", "where", "basics"]
tables:
  - name: employees
    visible_data: |
      id,name,department,salary
      1,Alice,Engineering,75000
      2,Bob,Marketing,55000
      3,Charlie,Engineering,80000
      4,Diana,Sales,60000
      5,Eve,Engineering,70000
    hidden_datasets:
      - |
        id,name,department,salary
        1,Frank,Engineering,90000
        2,Grace,HR,50000
        3,Henry,Engineering,85000
      - |
        id,name,department,salary
        1,Ivy,Sales,65000
        2,Jack,Engineering,95000
        3,Kate,Engineering,72000
        4,Leo,Marketing,58000
expected_output_query: |
  result = employees.filter(col("department") == "Engineering")
---

# Filter DataFrame

Filter the `employees` DataFrame to include only employees in the Engineering department.

Your result should be stored in a variable called `result`.


## Expected Output
id,name,department,salary
1,Alice,Engineering,75000
3,Charlie,Engineering,80000
5,Eve,Engineering,70000
