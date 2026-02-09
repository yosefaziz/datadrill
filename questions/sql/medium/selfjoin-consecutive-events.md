---
title: "Consecutive Event Comparison"
difficulty: "Medium"
tags: ["self-join", "consecutive"]
tables:
  - name: events
    visible_data: |
      id,user_id,event_date,event_type
      1,1,2024-01-01,login
      2,1,2024-01-02,purchase
      3,1,2024-01-03,login
      4,2,2024-01-01,login
      5,2,2024-01-02,login
      6,2,2024-01-03,purchase
    hidden_datasets:
      - |
        id,user_id,event_date,event_type
        1,10,2024-02-01,login
        2,10,2024-02-02,purchase
        3,10,2024-02-03,purchase
      - |
        id,user_id,event_date,event_type
        1,20,2024-03-01,login
        2,20,2024-03-02,login
        3,20,2024-03-03,purchase
        4,21,2024-03-01,purchase
        5,21,2024-03-02,login
        6,21,2024-03-03,login
        7,21,2024-03-04,purchase
expected_output_query: "SELECT e1.user_id, e1.event_date as from_date, e1.event_type as from_type, e2.event_date as to_date, e2.event_type as to_type FROM events e1 JOIN events e2 ON e1.user_id = e2.user_id AND e1.id = e2.id - 1 WHERE e1.event_type != e2.event_type ORDER BY e1.user_id, e1.event_date"
---

# Consecutive Event Comparison

Given the `events` table, find pairs of consecutive events for the same user where the event type changed.

Consecutive events are determined by sequential `id` values for the same `user_id`. A self-join on `e1.id = e2.id - 1 AND e1.user_id = e2.user_id` finds consecutive pairs.

Return the `user_id`, `from_date`, `from_type`, `to_date`, and `to_type` for each transition.

Order the results by `user_id`, then by `from_date`.

## Expected Output
user_id,from_date,from_type,to_date,to_type
1,2024-01-01,login,2024-01-02,purchase
1,2024-01-02,purchase,2024-01-03,login
2,2024-01-02,login,2024-01-03,purchase
