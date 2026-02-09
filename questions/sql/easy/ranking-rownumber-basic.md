---
title: "Product Price Rankings"
difficulty: "Easy"
tags: ["ROW_NUMBER", "window functions"]
tables:
  - name: products
    visible_data: |
      id,name,price
      1,Laptop,999
      2,Phone,699
      3,Tablet,499
      4,Headphones,149
      5,Monitor,349
    hidden_datasets:
      - |
        id,name,price
        1,Desk,450
        2,Chair,250
        3,Lamp,75
      - |
        id,name,price
        1,Printer,300
        2,Scanner,200
        3,Shredder,150
        4,Stapler,25
        5,Whiteboard,180
        6,Projector,800
expected_output_query: "SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) as row_num FROM products"
---

# Product Price Rankings

Write a query that assigns a row number to each product based on its price, from highest to lowest.

Return the product `name`, `price`, and the row number as `row_num`.

## Expected Output
name,price,row_num
Laptop,999,1
Phone,699,2
Tablet,499,3
Monitor,349,4
Headphones,149,5
