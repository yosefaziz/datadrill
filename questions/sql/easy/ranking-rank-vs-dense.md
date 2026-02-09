---
title: "RANK vs DENSE_RANK with Tied Scores"
difficulty: "Easy"
tags: ["RANK", "DENSE_RANK", "window functions"]
tables:
  - name: students
    visible_data: |
      id,name,score
      1,Alice,95
      2,Bob,88
      3,Charlie,95
      4,David,82
      5,Eve,88
    hidden_datasets:
      - |
        id,name,score
        1,Frank,100
        2,Grace,100
        3,Henry,90
      - |
        id,name,score
        1,Ivy,75
        2,Jack,75
        3,Kate,75
        4,Leo,90
        5,Mia,90
        6,Noah,100
expected_output_query: "SELECT name, score, RANK() OVER (ORDER BY score DESC) as score_rank, DENSE_RANK() OVER (ORDER BY score DESC) as score_dense_rank FROM students ORDER BY score DESC, name"
---

# RANK vs DENSE_RANK with Tied Scores

Write a query that shows both `RANK()` and `DENSE_RANK()` for students ordered by score descending.

Return the `name`, `score`, `score_rank` (using RANK), and `score_dense_rank` (using DENSE_RANK).

Order by score descending, then by name ascending for ties.

## Expected Output
| name    | score | score_rank | score_dense_rank |
|---------|-------|------------|------------------|
| Alice   | 95    | 1          | 1                |
| Charlie | 95    | 1          | 1                |
| Bob     | 88    | 3          | 2                |
| Eve     | 88    | 3          | 2                |
| David   | 82    | 5          | 3                |
