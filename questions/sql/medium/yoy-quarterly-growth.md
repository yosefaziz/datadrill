---
title: "Quarterly Growth Rate by Department"
difficulty: "Medium"
tags: ["LAG", "window functions", "PARTITION BY", "growth rate"]
track: sql-yoy-growth
track_level: 2
track_order: 2
hints:
  - "You need to compare each department's revenue to its own previous quarter - think about how to separate the comparison so departments do not mix."
  - "LAG() with PARTITION BY lets you look back within each department independently. Partition by department and order by the quarter date."
  - "Use LAG(revenue) OVER (PARTITION BY department ORDER BY quarter_start) to get the prior quarter's revenue, then compute ROUND(((current - previous) / previous) * 100, 1)."
tables:
  - name: quarterly_metrics
    visible_data: |
      quarter_start,department,revenue
      2024-01-01,Engineering,520000
      2024-01-01,Marketing,310000
      2024-04-01,Engineering,548000
      2024-04-01,Marketing,285000
      2024-07-01,Engineering,575000
      2024-07-01,Marketing,342000
      2024-10-01,Engineering,561000
      2024-10-01,Marketing,318000
    hidden_datasets:
      - |
        quarter_start,department,revenue
        2024-01-01,Sales,400000
        2024-04-01,Sales,420000
        2024-07-01,Sales,390000
        2024-10-01,Sales,450000
      - |
        quarter_start,department,revenue
        2024-01-01,Support,150000
        2024-04-01,Support,150000
        2024-07-01,Support,165000
        2024-10-01,Support,160000
        2024-01-01,Engineering,600000
        2024-04-01,Engineering,540000
expected_output_query: "SELECT quarter_start, department, revenue, ROUND(((revenue - LAG(revenue) OVER (PARTITION BY department ORDER BY quarter_start)) * 1.0 / LAG(revenue) OVER (PARTITION BY department ORDER BY quarter_start)) * 100, 1) AS qoq_growth_pct FROM quarterly_metrics ORDER BY quarter_start, department"
---

# Quarterly Growth Rate by Department

Write a query that calculates the quarter-over-quarter revenue growth rate as a percentage for each department. Each department's growth should be computed independently, comparing only against that same department's prior quarter.

The growth percentage should be rounded to one decimal place. The first quarter for each department should show NULL since there is no prior quarter to compare against. Return `quarter_start`, `department`, `revenue`, and `qoq_growth_pct`. Order by `quarter_start`, then `department`.

## Expected Output
quarter_start,department,revenue,qoq_growth_pct
2024-01-01,Engineering,520000,
2024-01-01,Marketing,310000,
2024-04-01,Engineering,548000,5.4
2024-04-01,Marketing,285000,-8.1
2024-07-01,Engineering,575000,4.9
2024-07-01,Marketing,342000,20.0
2024-10-01,Engineering,561000,-2.4
2024-10-01,Marketing,318000,-7.0
