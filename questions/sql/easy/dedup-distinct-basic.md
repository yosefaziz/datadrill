---
title: "Distinct Page Views"
difficulty: "Easy"
tags: ["DISTINCT", "deduplication"]
tables:
  - name: page_views
    visible_data: |
      id,user_id,page
      1,1,Home
      2,1,About
      3,2,Home
      4,1,Home
      5,2,About
      6,3,Home
      7,2,Home
    hidden_datasets:
      - |
        id,user_id,page
        1,10,Dashboard
        2,10,Settings
        3,11,Dashboard
      - |
        id,user_id,page
        1,20,Home
        2,20,Home
        3,21,Products
        4,21,Home
        5,22,Products
        6,20,Products
expected_output_query: "SELECT DISTINCT user_id, page FROM page_views ORDER BY user_id, page"
---

# Distinct Page Views

Write a query that finds all distinct user and page combinations, removing duplicate visits.

Return the `user_id` and `page`, ordered by user_id then page name.

## Expected Output
user_id,page
1,About
1,Home
2,About
2,Home
3,Home
