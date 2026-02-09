---
title: "Select Columns"
difficulty: "Easy"
tags: ["select", "basics", "pyspark"]
tables:
  - name: products
    visible_data: |
      id,name,category,price,stock
      1,Laptop,Electronics,999,50
      2,Headphones,Electronics,199,100
      3,Desk,Furniture,299,30
      4,Chair,Furniture,149,75
    hidden_datasets:
      - |
        id,name,category,price,stock
        1,Phone,Electronics,699,200
        2,Tablet,Electronics,499,80
      - |
        id,name,category,price,stock
        1,Lamp,Furniture,59,150
        2,Bookshelf,Furniture,199,40
        3,Monitor,Electronics,349,60
expected_output_query: |
  result = products.select("name", "price")
---

# Select Columns

Select only the `name` and `price` columns from the `products` DataFrame.

Your result should be stored in a variable called `result`.

## Expected Output
name,price
Laptop,999
Headphones,199
Desk,299
Chair,149
