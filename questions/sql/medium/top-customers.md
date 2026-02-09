---
title: "Find Top Customer"
difficulty: "Medium"
tags: ["aggregation", "GROUP BY", "ORDER BY", "LIMIT"]
hints:
  - "You need to combine multiple rows per customer into one — think about which clause groups rows together."
  - "Once grouped, use an aggregate function to compute each customer's total, then sort to find the highest."
  - "Use GROUP BY customer_id with SUM(amount), ORDER BY the total descending, and LIMIT 1 to get just the top customer."
tables:
  - name: orders
    visible_data: |
      id,customer_id,amount
      1,1,100
      2,1,200
      3,2,150
      4,3,50
    hidden_datasets:
      - |
        id,customer_id,amount
        1,5,500
        2,5,100
        3,6,300
        4,6,200
        5,7,50
      - |
        id,customer_id,amount
        1,10,1000
        2,11,999
        3,10,1
expected_output_query: "SELECT customer_id, SUM(amount) as total FROM orders GROUP BY customer_id ORDER BY total DESC LIMIT 1"
---

# Find Top Customer

Given the `orders` table, find the customer with the highest total order amount.

Return the `customer_id` and their `total` order amount.

## Expected Output
customer_id,total
1,300
