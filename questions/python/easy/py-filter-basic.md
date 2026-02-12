---
title: "Filter Products by Price"
difficulty: "Easy"
interview_relevant: false
tags: ["pyspark", "filter", "col", "basics"]
tables:
  - name: products
    visible_data: |
      id,name,category,price
      1,Laptop,Electronics,999
      2,Mouse,Electronics,29
      3,Desk,Furniture,349
      4,Pen,Office,5
      5,Monitor,Electronics,449
      6,Chair,Furniture,199
    hidden_datasets:
      - |
        id,name,category,price
        1,Keyboard,Electronics,79
        2,Lamp,Furniture,45
        3,Camera,Electronics,599
      - |
        id,name,category,price
        1,Book,Books,15
        2,Tablet,Electronics,499
        3,Headphones,Electronics,149
        4,Notebook,Office,8
        5,Printer,Electronics,299
expected_output_query: |
  result = products.filter(col("price") > 50)
---

# Filter Products by Price

Filter the `products` DataFrame to include only products with a price greater than 50.

Your result should be stored in a variable called `result`.

**Hint:** Use `.filter()` with `col("price") > 50`.

## Expected Output
id,name,category,price
1,Laptop,Electronics,999
3,Desk,Furniture,349
5,Monitor,Electronics,449
6,Chair,Furniture,199
