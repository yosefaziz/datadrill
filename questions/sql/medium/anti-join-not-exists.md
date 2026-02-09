---
title: "Products Never Ordered"
difficulty: "Medium"
tags: ["NOT EXISTS", "anti-join", "correlated subquery"]
tables:
  - name: products
    visible_data: |
      id,name,price,category
      1,Laptop,999,Electronics
      2,Phone,699,Electronics
      3,Desk,349,Furniture
      4,Chair,249,Furniture
      5,Tablet,499,Electronics
    hidden_datasets:
      - |
        id,name,price,category
        1,Camera,599,Electronics
        2,Sofa,899,Furniture
        3,Lamp,75,Furniture
      - |
        id,name,price,category
        1,Book,29,Books
        2,Pen,5,Books
        3,Monitor,449,Electronics
        4,Mouse,39,Electronics
  - name: order_items
    visible_data: |
      id,order_id,product_id,quantity
      1,1,1,1
      2,1,2,2
      3,2,1,1
      4,3,4,3
    hidden_datasets:
      - |
        id,order_id,product_id,quantity
        1,1,1,2
        2,2,3,1
      - |
        id,order_id,product_id,quantity
        1,1,1,1
        2,2,3,1
        3,3,3,2
expected_output_query: "SELECT p.name, p.price FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id) ORDER BY p.name"
---

# Products Never Ordered

Write a query that finds products that have never been ordered using `NOT EXISTS`.

Return the product `name` and `price`, ordered by name.

## Expected Output
| name   | price |
|--------|-------|
| Desk   | 349   |
| Tablet | 499   |
