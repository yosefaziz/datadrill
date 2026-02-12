---
title: "NULLs Silently Skew Aggregates"
difficulty: "Medium"
tags: ["NULL", "AVG", "COUNT", "aggregation", "debugging", "SQL"]
language: sql
tables:
  - name: reviews
    visible_data: |
      id,product_id,rating
      1,1,5
      2,1,4
      3,1,
      4,2,3
      5,2,
      6,2,
    hidden_datasets:
      - |
        id,product_id,rating
        1,1,5
        2,1,
        3,2,4
      - |
        id,product_id,rating
        1,1,3
        2,1,5
        3,1,
        4,2,
        5,2,4
        6,2,2
broken_code: |
  SELECT product_id, AVG(rating) as avg_rating, COUNT(*) as review_count
  FROM reviews
  GROUP BY product_id
  ORDER BY product_id
expected_output_query: |
  SELECT product_id, ROUND(AVG(COALESCE(rating, 0)), 1) as avg_rating, COUNT(rating) as rated_count, COUNT(*) as total_count
  FROM reviews
  GROUP BY product_id
  ORDER BY product_id
hint: "AVG ignores NULLs entirely. COUNT(*) counts all rows but COUNT(column) skips NULLs. Are both metrics telling the same story?"
---

# NULLs Silently Skew Aggregates

The query calculates average rating and review count, but AVG silently ignores NULL ratings, and COUNT(*) includes unrated reviews.

Fix the query to show the true average (treating NULL as 0) and distinguish rated vs total reviews.


## Expected Output
product_id,avg_rating,rated_count,total_count
1,3.0,2,3
2,1.0,1,3
