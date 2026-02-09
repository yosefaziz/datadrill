---
title: "Filter with Multiple Conditions"
difficulty: "Easy"
tags: ["filter", "and", "or", "pyspark"]
tables:
  - name: employees
    visible_data: |
      id,name,department,salary
      1,Alice,Engineering,85000
      2,Bob,Marketing,55000
      3,Charlie,Engineering,72000
      4,Diana,Sales,60000
      5,Eve,Engineering,68000
    hidden_datasets:
      - |
        id,name,department,salary
        1,Frank,Engineering,90000
        2,Grace,HR,50000
        3,Henry,Engineering,65000
      - |
        id,name,department,salary
        1,Ivy,Sales,70000
        2,Jack,Engineering,95000
        3,Kate,Engineering,62000
        4,Leo,Marketing,58000
expected_output_query: |
  result = employees.filter((col("department") == "Engineering") & (col("salary") > 70000))
---

# Filter with Multiple Conditions

Filter the `employees` DataFrame to include only Engineering employees with a salary greater than 70,000.

Combine conditions using `&` (AND). Remember to wrap each condition in parentheses.

Your result should be stored in a variable called `result`.

**Hint:** Use `.filter()` with `(col("department") == "Engineering") & (col("salary") > 70000)`.

## Expected Output
| id | name    | department  | salary |
|----|---------|-------------|--------|
| 1  | Alice   | Engineering | 85000  |
| 3  | Charlie | Engineering | 72000  |
