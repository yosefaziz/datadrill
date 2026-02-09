---
title: "Join Orders with Customers"
difficulty: "Easy"
tags: ["join", "inner", "basics", "pyspark"]
tables:
  - name: orders
    visible_data: |
      order_id,customer_id,amount
      1,101,500
      2,102,300
      3,101,700
      4,103,200
    hidden_datasets:
      - |
        order_id,customer_id,amount
        1,201,800
        2,202,400
      - |
        order_id,customer_id,amount
        1,301,150
        2,302,250
        3,301,350
        4,303,450
  - name: customers
    visible_data: |
      id,name,city
      101,Alice,NYC
      102,Bob,LA
      103,Charlie,SF
    hidden_datasets:
      - |
        id,name,city
        201,David,NYC
        202,Eve,Chicago
      - |
        id,name,city
        301,Frank,LA
        302,Grace,SF
        303,Henry,NYC
expected_output_query: |
  result = orders.join(customers, orders["customer_id"] == customers["id"], "inner").select(orders["order_id"], customers["name"], orders["amount"])
---

# Join Orders with Customers

Join the `orders` DataFrame with the `customers` DataFrame to show the customer name for each order.

Use an inner join on `customer_id` matching `id`, then select the `order_id`, customer `name`, and `amount`.

Your result should be stored in a variable called `result`.

**Hint:** Use `.join()` with the join condition and `"inner"`, then `.select()` the columns you need.

## Expected Output
order_id,name,amount
1,Alice,500
2,Bob,300
3,Alice,700
4,Charlie,200
