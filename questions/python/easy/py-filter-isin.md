---
title: "Filter with isin"
difficulty: "Easy"
tags: ["filter", "isin", "pyspark"]
tables:
  - name: orders
    visible_data: |
      id,customer_id,product,status
      1,101,Laptop,shipped
      2,102,Phone,pending
      3,103,Tablet,delivered
      4,104,Monitor,cancelled
      5,105,Keyboard,shipped
      6,106,Mouse,delivered
    hidden_datasets:
      - |
        id,customer_id,product,status
        1,201,Camera,pending
        2,202,Lens,shipped
        3,203,Tripod,delivered
      - |
        id,customer_id,product,status
        1,301,Book,shipped
        2,302,Pen,cancelled
        3,303,Notebook,delivered
        4,304,Marker,pending
        5,305,Eraser,shipped
expected_output_query: |
  result = orders.filter(col("status").isin("shipped", "delivered"))
---

# Filter with isin

Filter the `orders` DataFrame to include only orders with status "shipped" or "delivered".

Use the `.isin()` method on the status column.

Your result should be stored in a variable called `result`.

**Hint:** Use `col("status").isin("shipped", "delivered")`.

## Expected Output
| id | customer_id | product  | status    |
|----|-------------|----------|-----------|
| 1  | 101         | Laptop   | shipped   |
| 3  | 103         | Tablet   | delivered |
| 5  | 105         | Keyboard | shipped   |
| 6  | 106         | Mouse    | delivered |
