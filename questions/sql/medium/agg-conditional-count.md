---
title: "Conditional Count with CASE"
difficulty: "Medium"
tags: ["CASE", "COUNT", "conditional aggregation"]
tables:
  - name: support_tickets
    visible_data: |
      id,department,status,priority
      1,Sales,open,high
      2,Sales,closed,low
      3,Sales,open,medium
      4,Engineering,closed,high
      5,Engineering,open,high
      6,Engineering,closed,low
      7,Engineering,pending,medium
    hidden_datasets:
      - |
        id,department,status,priority
        1,HR,open,low
        2,HR,closed,high
        3,Marketing,open,medium
      - |
        id,department,status,priority
        1,Finance,open,high
        2,Finance,open,medium
        3,Finance,closed,low
        4,Finance,pending,high
        5,Legal,closed,high
        6,Legal,closed,medium
        7,Legal,open,low
expected_output_query: "SELECT department, COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count, COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count, COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count FROM support_tickets GROUP BY department ORDER BY department"
---

# Conditional Count with CASE

Given the `support_tickets` table, count the number of open, closed, and pending tickets per department.

Use conditional aggregation with `CASE` inside `COUNT` to count each status separately.

Return the `department`, `open_count`, `closed_count`, and `pending_count`.

Order the results by `department`.

## Expected Output
department,open_count,closed_count,pending_count
Engineering,1,2,1
Sales,2,1,0
