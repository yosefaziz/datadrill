---
title: "AVG Inflated by NULL Exclusion"
difficulty: "Medium"
tags: ["NULL", "AVG", "COALESCE", "debugging", "SQL"]
language: sql
tables:
  - name: employee_bonuses
    visible_data: |
      id,employee_id,department,bonus
      1,1,Engineering,5000
      2,2,Engineering,
      3,3,Engineering,3000
      4,4,Marketing,2000
      5,5,Marketing,
      6,6,Marketing,4000
    hidden_datasets:
      - |
        id,employee_id,department,bonus
        1,1,Sales,1000
        2,2,Sales,
        3,3,Sales,
      - |
        id,employee_id,department,bonus
        1,1,HR,500
        2,2,HR,
        3,3,HR,
        4,4,HR,1500
broken_code: |
  SELECT department, ROUND(AVG(bonus), 0) as avg_bonus
  FROM employee_bonuses
  GROUP BY department
  ORDER BY department
expected_output_query: |
  SELECT department, ROUND(AVG(COALESCE(bonus, 0)), 0) as avg_bonus
  FROM employee_bonuses
  GROUP BY department
  ORDER BY department
hint: "NULL bonuses mean $0, not 'unknown'. AVG ignores NULLs, so the average only reflects employees who got bonuses."
---

# AVG Inflated by NULL Exclusion

The query calculates average bonus per department, but NULL bonuses (meaning $0) are excluded from the average, making it appear higher than reality.

Fix the query to treat NULL bonuses as $0.


## Expected Output
department,avg_bonus
Engineering,2667
Marketing,2000
