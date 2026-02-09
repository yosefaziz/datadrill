---
title: "Top N Products per Category"
difficulty: "Medium"
tags: ["ROW_NUMBER", "PARTITION BY", "Top-N"]
tables:
  - name: products
    visible_data: |
      id,name,category,price
      1,Laptop,Electronics,999
      2,Phone,Electronics,699
      3,Tablet,Electronics,499
      4,Desk,Furniture,350
      5,Chair,Furniture,275
      6,Lamp,Furniture,89
    hidden_datasets:
      - |
        id,name,category,price
        1,TV,Electronics,1200
        2,Radio,Electronics,150
        3,Sofa,Furniture,800
      - |
        id,name,category,price
        1,Camera,Electronics,550
        2,Headphones,Electronics,200
        3,Speaker,Electronics,300
        4,Bookshelf,Furniture,180
        5,Table,Furniture,420
        6,Rug,Furniture,150
        7,Microwave,Appliances,250
expected_output_query: "SELECT name, category, price FROM (SELECT name, category, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as rn FROM products) sub WHERE rn <= 2 ORDER BY category, price DESC"
---

# Top N Products per Category

Given the `products` table, find the top 2 most expensive products in each category.

Use `ROW_NUMBER()` with `PARTITION BY` to rank products within each category by price (highest first), then filter to keep only the top 2.

Return the `name`, `category`, and `price`.

Order the results by `category`, then by `price` descending.

## Expected Output
name,category,price
Laptop,Electronics,999
Phone,Electronics,699
Desk,Furniture,350
Chair,Furniture,275
