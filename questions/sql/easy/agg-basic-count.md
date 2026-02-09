---
title: "Count Orders by Category"
difficulty: "Easy"
tags: ["COUNT", "GROUP BY", "aggregation"]
hints:
  - "Think about which SQL function counts rows in a group."
  - "You'll need GROUP BY to split results by category."
  - "Use ORDER BY category to sort alphabetically."
tables:
  - name: orders
    visible_data: |
      id,product,category,amount
      1,Laptop,Electronics,999
      2,Headphones,Electronics,149
      3,Desk,Furniture,349
      4,Chair,Furniture,249
      5,Monitor,Electronics,399
      6,Bookshelf,Furniture,199
    hidden_datasets:
      - |
        id,product,category,amount
        1,Phone,Electronics,799
        2,Sofa,Furniture,1200
        3,TV,Electronics,599
      - |
        id,product,category,amount
        1,Tablet,Electronics,499
        2,Lamp,Home Decor,59
        3,Rug,Home Decor,129
        4,Keyboard,Electronics,89
        5,Curtains,Home Decor,45
expected_output_query: "SELECT category, COUNT(*) as order_count FROM orders GROUP BY category ORDER BY category"
---

# Count Orders by Category

Write a query that counts the number of orders in each product category.

Return the `category` and the count as `order_count`, ordered alphabetically by category.

## Expected Output
category,order_count
Electronics,3
Furniture,3
