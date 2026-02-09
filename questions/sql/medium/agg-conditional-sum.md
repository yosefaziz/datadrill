---
title: "Conditional Sum with CASE"
difficulty: "Medium"
tags: ["CASE", "SUM", "conditional aggregation"]
tables:
  - name: transactions
    visible_data: |
      id,account_id,type,amount
      1,1,credit,500
      2,1,debit,200
      3,1,credit,300
      4,2,debit,150
      5,2,credit,600
      6,2,debit,100
    hidden_datasets:
      - |
        id,account_id,type,amount
        1,10,credit,1000
        2,10,debit,400
        3,11,credit,750
      - |
        id,account_id,type,amount
        1,20,credit,200
        2,20,debit,50
        3,20,credit,300
        4,21,debit,100
        5,21,debit,200
        6,22,credit,500
        7,22,debit,500
expected_output_query: "SELECT account_id, SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits, SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits FROM transactions GROUP BY account_id ORDER BY account_id"
---

# Conditional Sum with CASE

Given the `transactions` table, calculate the total credits and total debits for each account.

Use conditional aggregation with `CASE` inside `SUM` to separate credit and debit amounts.

Return the `account_id`, `total_credits`, and `total_debits`.

Order the results by `account_id`.

## Expected Output
account_id,total_credits,total_debits
1,800,200
2,600,250
