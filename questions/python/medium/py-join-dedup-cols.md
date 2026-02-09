---
title: "Handle Duplicate Columns After Join"
difficulty: "Medium"
tags: ["join", "drop", "duplicate columns", "pyspark"]
tables:
  - name: orders
    visible_data: |
      id,product_id,quantity
      1,101,2
      2,102,1
      3,101,3
      4,103,1
    hidden_datasets:
      - |
        id,product_id,quantity
        1,201,5
        2,202,2
      - |
        id,product_id,quantity
        1,301,1
        2,302,4
        3,303,2
        4,301,3
  - name: products
    visible_data: |
      id,name,price
      101,Laptop,999
      102,Phone,699
      103,Tablet,499
    hidden_datasets:
      - |
        id,name,price
        201,Camera,599
        202,Lens,299
      - |
        id,name,price
        301,Book,29
        302,Pen,5
        303,Mouse,39
expected_output_query: |
  result = orders.join(products, orders["product_id"] == products["id"], "inner").select(
      orders["id"].alias("order_id"),
      products["name"].alias("product_name"),
      orders["quantity"],
      products["price"]
  )
---

# Handle Duplicate Columns After Join

Join `orders` with `products` and handle the duplicate `id` columns by selecting and renaming specific columns.

Both tables have an `id` column, so you must use `table["column"]` syntax and `.alias()` to disambiguate.

Your result should be stored in a variable called `result`.

**Hint:** After joining, use `.select()` with `orders["id"].alias("order_id")` to rename.

## Expected Output
order_id,product_name,quantity,price
1,Laptop,2,999
2,Phone,1,699
3,Laptop,3,999
4,Tablet,1,499
