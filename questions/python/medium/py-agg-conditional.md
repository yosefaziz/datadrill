---
title: "Conditional Aggregation with When"
difficulty: "Medium"
interview_relevant: false
tags: ["pyspark", "when", "otherwise", "agg", "conditional"]
tables:
  - name: transactions
    visible_data: |
      id,account_id,type,amount
      1,A001,credit,500
      2,A001,debit,200
      3,A001,credit,300
      4,A002,debit,150
      5,A002,credit,700
      6,A002,debit,100
    hidden_datasets:
      - |
        id,account_id,type,amount
        1,B001,credit,1000
        2,B001,debit,400
        3,B002,credit,600
      - |
        id,account_id,type,amount
        1,C001,credit,200
        2,C001,credit,300
        3,C001,debit,100
        4,C002,debit,500
        5,C002,debit,250
expected_output_query: |
  result = transactions.groupBy("account_id").agg(
      sum(when(col("type") == "credit", col("amount")).otherwise(0)).alias("total_credits"),
      sum(when(col("type") == "debit", col("amount")).otherwise(0)).alias("total_debits")
  )
---

# Conditional Aggregation with When

Group `transactions` by `account_id` and sum credits and debits separately.

Use `when()/otherwise()` inside `sum()` to conditionally aggregate by transaction type.

Your result should be stored in a variable called `result`.


## Expected Output
account_id,total_credits,total_debits
A001,800,200
A002,700,250
