---
title: "Dedup with Tie-Breaking"
difficulty: "Hard"
tags: ["ROW_NUMBER", "deduplication", "tie-breaking"]
tables:
  - name: event_logs
    visible_data: |
      id,user_id,event_type,event_time,source
      1,1,login,2024-01-05 09:00:00,web
      2,1,login,2024-01-05 09:00:00,mobile
      3,1,purchase,2024-01-05 10:30:00,web
      4,2,login,2024-01-05 08:00:00,web
      5,2,login,2024-01-06 09:00:00,mobile
      6,2,purchase,2024-01-05 11:00:00,web
      7,1,purchase,2024-01-06 14:00:00,mobile
    hidden_datasets:
      - |
        id,user_id,event_type,event_time,source
        1,10,login,2024-02-01 08:00:00,web
        2,10,login,2024-02-01 08:00:00,mobile
        3,10,purchase,2024-02-02 10:00:00,web
      - |
        id,user_id,event_type,event_time,source
        1,20,login,2024-03-01 09:00:00,web
        2,20,login,2024-03-01 09:00:00,mobile
        3,21,login,2024-03-01 08:00:00,web
        4,21,purchase,2024-03-02 10:00:00,mobile
        5,21,purchase,2024-03-02 10:00:00,web
expected_output_query: "SELECT user_id, event_type, event_time, source FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id, event_type ORDER BY event_time DESC, CASE source WHEN 'web' THEN 1 WHEN 'mobile' THEN 2 ELSE 3 END) as rn FROM event_logs) sub WHERE rn = 1 ORDER BY user_id, event_type"
---

# Dedup with Tie-Breaking

Write a query that keeps only the latest event per user per event type. When two events have the same timestamp, prefer `web` over `mobile`.

Use `ROW_NUMBER()` partitioned by `user_id, event_type`, ordered by `event_time DESC` then by source priority (web=1, mobile=2).

Return `user_id`, `event_type`, `event_time`, and `source`, ordered by user_id then event_type.

## Expected Output
user_id,event_type,event_time,source
1,login,2024-01-05 09:00:00,web
1,purchase,2024-01-06 14:00:00,mobile
2,login,2024-01-06 09:00:00,mobile
2,purchase,2024-01-05 11:00:00,web
