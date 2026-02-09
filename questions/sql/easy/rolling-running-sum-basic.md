---
title: "Running Sales Total"
difficulty: "Easy"
tags: ["window functions", "SUM", "running total"]
tables:
  - name: daily_sales
    visible_data: |
      sale_date,amount
      2024-01-01,500
      2024-01-02,300
      2024-01-03,700
      2024-01-04,200
      2024-01-05,600
    hidden_datasets:
      - |
        sale_date,amount
        2024-03-01,1000
        2024-03-02,1500
        2024-03-03,800
      - |
        sale_date,amount
        2024-06-01,250
        2024-06-02,400
        2024-06-03,350
        2024-06-04,500
        2024-06-05,150
        2024-06-06,600
expected_output_query: "SELECT sale_date, amount, SUM(amount) OVER (ORDER BY sale_date) as running_total FROM daily_sales"
---

# Running Sales Total

Write a query that calculates a running total of daily sales amounts.

Return the `sale_date`, `amount`, and the cumulative sum as `running_total`, ordered by date.

## Expected Output
| sale_date  | amount | running_total |
|------------|--------|---------------|
| 2024-01-01 | 500    | 500           |
| 2024-01-02 | 300    | 800           |
| 2024-01-03 | 700    | 1500          |
| 2024-01-04 | 200    | 1700          |
| 2024-01-05 | 600    | 2300          |
