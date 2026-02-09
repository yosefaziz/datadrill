---
title: "Stock Price Increase Detection"
difficulty: "Medium"
tags: ["self-join", "comparison"]
tables:
  - name: stock_prices
    visible_data: |
      id,symbol,trade_date,price
      1,ACME,2024-01-01,100
      2,ACME,2024-01-02,105
      3,ACME,2024-01-03,102
      4,ACME,2024-01-04,110
      5,ACME,2024-01-05,108
    hidden_datasets:
      - |
        id,symbol,trade_date,price
        1,XYZ,2024-02-01,50
        2,XYZ,2024-02-02,55
        3,XYZ,2024-02-03,48
      - |
        id,symbol,trade_date,price
        1,ABC,2024-03-01,200
        2,ABC,2024-03-02,210
        3,ABC,2024-03-03,205
        4,ABC,2024-03-04,215
        5,ABC,2024-03-05,220
        6,ABC,2024-03-06,218
expected_output_query: "SELECT s2.trade_date, s1.price as prev_price, s2.price as curr_price, s2.price - s1.price as price_change FROM stock_prices s1 JOIN stock_prices s2 ON s1.symbol = s2.symbol AND s1.id = s2.id - 1 WHERE s2.price > s1.price ORDER BY s2.trade_date"
---

# Stock Price Increase Detection

Given the `stock_prices` table, find dates where the stock price increased compared to the previous day.

Use a self-join where rows are matched by consecutive `id` values for the same `symbol`.

Return the `trade_date`, `prev_price`, `curr_price`, and `price_change` (current minus previous).

Only include rows where the price went up. Order the results by `trade_date`.

## Expected Output
trade_date,prev_price,curr_price,price_change
2024-01-02,100,105,5
2024-01-04,102,110,8
