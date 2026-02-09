---
title: "Regional Sales Summary"
difficulty: "Medium"
tags: ["groupBy", "agg", "sum", "pyspark"]
tables:
  - name: sales
    visible_data: |
      id,region,product,quantity,revenue
      1,East,Laptop,2,2000
      2,West,Phone,5,3500
      3,East,Phone,3,2100
      4,West,Laptop,1,1000
      5,East,Tablet,4,1600
      6,West,Tablet,2,800
    hidden_datasets:
      - |
        id,region,product,quantity,revenue
        1,North,Camera,3,1800
        2,North,Lens,5,1500
        3,South,Camera,2,1200
      - |
        id,region,product,quantity,revenue
        1,Central,Book,10,300
        2,Central,Pen,20,100
        3,Coastal,Book,5,150
        4,Coastal,Pen,15,75
        5,Central,Notebook,8,240
expected_output_query: |
  result = sales.groupBy("region").agg(
      sum("quantity").alias("total_quantity"),
      sum("revenue").alias("total_revenue")
  )
---

# Regional Sales Summary

Group the `sales` DataFrame by `region` and calculate total quantity and total revenue.

Use `.groupBy()` and `.agg()` with `sum()` for both columns.

Your result should be stored in a variable called `result`.

**Hint:** Use `.agg(sum("quantity").alias("total_quantity"), sum("revenue").alias("total_revenue"))`.

## Expected Output
| region | total_quantity | total_revenue |
|--------|----------------|---------------|
| East   | 9              | 5700          |
| West   | 8              | 5300          |
