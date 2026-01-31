---
title: "Wrong Filter Operator"
difficulty: "Medium"
tags: ["filter", "debugging", "PySpark"]
language: pyspark
tables:
  - name: transactions
    visible_data: |
      id,customer,amount,status
      1,Alice,150,completed
      2,Bob,200,pending
      3,Charlie,75,completed
      4,Diana,300,failed
      5,Eve,125,completed
    hidden_datasets:
      - |
        id,customer,amount,status
        1,Frank,500,completed
        2,Grace,250,pending
        3,Henry,100,completed
      - |
        id,customer,amount,status
        1,Ivy,175,completed
        2,Jack,225,failed
        3,Kate,150,completed
        4,Leo,350,pending
broken_code: |
  result = transactions.filter(col("status") == "completed" | col("amount") > 100)
expected_output_query: |
  result = transactions.filter((col("status") == "completed") & (col("amount") > 100))
hint: "Check the logical operator. Are you looking for 'OR' or 'AND' conditions? Also check operator precedence."
---

# Wrong Filter Operator

The following PySpark code is supposed to find all completed transactions with an amount greater than 100. However, it's returning incorrect results. Fix the filter condition.

**The Bug:** The code uses `|` (OR) instead of `&` (AND), and is missing parentheses for correct operator precedence.

## Expected Output
| id | customer | amount | status    |
|----|----------|--------|-----------|
| 1  | Alice    | 150    | completed |
| 5  | Eve      | 125    | completed |
