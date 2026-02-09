---
title: "COUNT(*) vs COUNT(column)"
difficulty: "Medium"
tags: ["NULL", "COUNT", "debugging", "SQL"]
language: sql
tables:
  - name: survey_responses
    visible_data: |
      id,question_id,answer
      1,Q1,Yes
      2,Q1,No
      3,Q1,
      4,Q2,Agree
      5,Q2,
      6,Q2,
    hidden_datasets:
      - |
        id,question_id,answer
        1,Q1,A
        2,Q1,
        3,Q2,B
      - |
        id,question_id,answer
        1,Q1,Yes
        2,Q1,Yes
        3,Q1,
        4,Q1,No
        5,Q2,Maybe
broken_code: |
  SELECT question_id, COUNT(answer) as total_responses
  FROM survey_responses
  GROUP BY question_id
  ORDER BY question_id
expected_output_query: |
  SELECT question_id, COUNT(*) as total_responses
  FROM survey_responses
  GROUP BY question_id
  ORDER BY question_id
hint: "COUNT(column) skips NULL values. If you want to count all responses including unanswered ones, what should you use?"
---

# COUNT(*) vs COUNT(column)

The query should count total survey responses per question (including unanswered ones), but it's undercounting because NULL answers are skipped.

Fix the query to count all rows.

**The Bug:** `COUNT(answer)` skips NULL values. Use `COUNT(*)` to count all rows regardless of NULL.

## Expected Output
| question_id | total_responses |
|-------------|-----------------|
| Q1          | 3               |
| Q2          | 3               |
