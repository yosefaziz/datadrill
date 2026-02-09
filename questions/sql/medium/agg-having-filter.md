---
title: "Filter Groups with HAVING"
difficulty: "Medium"
tags: ["GROUP BY", "HAVING", "COUNT"]
tables:
  - name: orders
    visible_data: |
      id,customer_id,product,amount
      1,101,Widget,25
      2,101,Gadget,50
      3,101,Widget,30
      4,102,Gadget,75
      5,102,Widget,40
      6,102,Gadget,60
      7,103,Widget,20
    hidden_datasets:
      - |
        id,customer_id,product,amount
        1,201,Laptop,500
        2,201,Mouse,25
        3,201,Keyboard,75
        4,202,Laptop,500
        5,202,Mouse,25
        6,202,Monitor,300
      - |
        id,customer_id,product,amount
        1,301,Phone,800
        2,301,Case,20
        3,301,Charger,30
        4,302,Phone,800
        5,303,Phone,800
        6,303,Case,20
        7,303,Charger,30
expected_output_query: "SELECT customer_id, COUNT(*) as order_count, SUM(amount) as total FROM orders GROUP BY customer_id HAVING COUNT(*) > 2 ORDER BY customer_id"
---

# Filter Groups with HAVING

Given the `orders` table, find customers who have placed more than 2 orders.

Return the `customer_id`, the number of orders as `order_count`, and the sum of all order amounts as `total`.

Order the results by `customer_id`.

## Expected Output
| customer_id | order_count | total |
|-------------|-------------|-------|
| 101         | 3           | 105   |
| 102         | 3           | 175   |
