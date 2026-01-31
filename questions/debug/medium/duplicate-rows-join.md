---
title: "Duplicate Rows from Join"
difficulty: "Medium"
tags: ["JOIN", "DISTINCT", "debugging", "SQL"]
language: sql
tables:
  - name: products
    visible_data: |
      product_id,name,price
      1,Laptop,999
      2,Phone,699
      3,Tablet,499
    hidden_datasets:
      - |
        product_id,name,price
        1,Camera,599
        2,Lens,299
      - |
        product_id,name,price
        1,Book,29
        2,Pen,5
        3,Notebook,15
  - name: reviews
    visible_data: |
      review_id,product_id,rating
      1,1,5
      2,1,4
      3,2,5
      4,2,3
      5,3,4
    hidden_datasets:
      - |
        review_id,product_id,rating
        1,1,5
        2,1,4
        3,1,3
        4,2,5
      - |
        review_id,product_id,rating
        1,1,5
        2,2,4
        3,2,3
        4,3,5
        5,3,4
broken_code: |
  SELECT p.name, p.price
  FROM products p
  JOIN reviews r ON p.product_id = r.product_id
expected_output_query: |
  SELECT DISTINCT p.name, p.price
  FROM products p
  JOIN reviews r ON p.product_id = r.product_id
hint: "Each product appears multiple times because it has multiple reviews. How do you get unique rows?"
---

# Duplicate Rows from Join

The following query is meant to list all products that have at least one review, showing each product only once. However, products with multiple reviews are appearing multiple times. Fix the query.

**The Bug:** The JOIN creates duplicate rows when a product has multiple reviews. We need DISTINCT to get unique products.

## Expected Output
| name   | price |
|--------|-------|
| Laptop | 999   |
| Phone  | 699   |
| Tablet | 499   |
