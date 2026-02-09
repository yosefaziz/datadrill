---
title: "LEFT JOIN with COALESCE"
difficulty: "Medium"
tags: ["LEFT JOIN", "COALESCE"]
tables:
  - name: products
    visible_data: |
      id,name,category_id
      1,Laptop,1
      2,Mouse,1
      3,Desk,2
      4,Notebook,NULL
      5,Pen,NULL
    hidden_datasets:
      - |
        id,name,category_id
        1,Phone,1
        2,Tablet,NULL
        3,Cable,2
      - |
        id,name,category_id
        1,Monitor,1
        2,Keyboard,1
        3,Chair,2
        4,Lamp,NULL
        5,Webcam,3
        6,Speaker,NULL
  - name: categories
    visible_data: |
      id,category_name
      1,Electronics
      2,Furniture
    hidden_datasets:
      - |
        id,category_name
        1,Electronics
        2,Accessories
      - |
        id,category_name
        1,Electronics
        2,Furniture
        3,Peripherals
expected_output_query: "SELECT p.name as product, COALESCE(c.category_name, 'Uncategorized') as category FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name"
---

# LEFT JOIN with COALESCE

Given the `products` and `categories` tables, list every product with its category name.

Some products have no category assigned (`category_id` is `NULL`). For these, display `'Uncategorized'` instead of `NULL`.

Use a `LEFT JOIN` and `COALESCE` to handle the missing values.

Return the `product` name and `category` name.

Order the results by product name.

## Expected Output
| product  | category      |
|----------|---------------|
| Desk     | Furniture     |
| Laptop   | Electronics   |
| Mouse    | Electronics   |
| Notebook | Uncategorized |
| Pen      | Uncategorized |
