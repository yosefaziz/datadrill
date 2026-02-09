---
title: "Next Task Due Date"
difficulty: "Easy"
tags: ["LEAD", "window functions"]
tables:
  - name: tasks
    visible_data: |
      id,task_name,due_date
      1,Design mockups,2024-03-01
      2,Build API,2024-03-05
      3,Write tests,2024-03-08
      4,Code review,2024-03-12
      5,Deploy app,2024-03-15
    hidden_datasets:
      - |
        id,task_name,due_date
        1,Research,2024-04-01
        2,Prototype,2024-04-10
        3,Launch,2024-04-20
      - |
        id,task_name,due_date
        1,Plan sprint,2024-05-01
        2,Dev work,2024-05-05
        3,QA testing,2024-05-10
        4,Bug fixes,2024-05-14
        5,Release,2024-05-18
        6,Retrospective,2024-05-20
expected_output_query: "SELECT task_name, due_date, LEAD(due_date) OVER (ORDER BY due_date) as next_due_date FROM tasks"
---

# Next Task Due Date

Write a query that shows each task alongside the due date of the next task using the `LEAD` window function.

Return the `task_name`, `due_date`, and the next task's due date as `next_due_date`. The last task should have `NULL` for `next_due_date`.

## Expected Output
| task_name      | due_date   | next_due_date |
|----------------|------------|---------------|
| Design mockups | 2024-03-01 | 2024-03-05    |
| Build API      | 2024-03-05 | 2024-03-08    |
| Write tests    | 2024-03-08 | 2024-03-12    |
| Code review    | 2024-03-12 | 2024-03-15    |
| Deploy app     | 2024-03-15 |               |
