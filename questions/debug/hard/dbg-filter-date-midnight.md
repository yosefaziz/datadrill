---
title: "Midnight Cutoff Bug"
difficulty: "Hard"
tags: ["date", "timestamp", "midnight", "debugging", "SQL"]
language: sql
tables:
  - name: sessions
    visible_data: |
      id,user_id,login_time,duration_minutes
      1,1,2024-03-14 22:00:00,30
      2,2,2024-03-15 09:00:00,45
      3,3,2024-03-15 14:30:00,60
      4,4,2024-03-15 23:45:00,15
      5,5,2024-03-16 01:00:00,20
    hidden_datasets:
      - |
        id,user_id,login_time,duration_minutes
        1,1,2024-03-14 23:59:00,10
        2,2,2024-03-15 00:00:00,30
        3,3,2024-03-15 12:00:00,45
      - |
        id,user_id,login_time,duration_minutes
        1,1,2024-03-14 20:00:00,60
        2,2,2024-03-15 08:00:00,30
        3,3,2024-03-15 16:00:00,45
        4,4,2024-03-15 23:30:00,20
broken_code: |
  SELECT user_id, login_time, duration_minutes
  FROM sessions
  WHERE login_time <= '2024-03-15'
  ORDER BY login_time
expected_output_query: |
  SELECT user_id, login_time, duration_minutes
  FROM sessions
  WHERE login_time < '2024-03-16'
  ORDER BY login_time
hint: "The string '2024-03-15' is interpreted as '2024-03-15 00:00:00' (midnight). Events later that day are AFTER midnight."
---

# Midnight Cutoff Bug

The query should include all sessions up to and including March 15, but sessions during the day on March 15 are being excluded.

Fix the date comparison to capture the full day.

**The Bug:** `<= '2024-03-15'` is interpreted as `<= '2024-03-15 00:00:00'`, which excludes everything after midnight on March 15. Use `< '2024-03-16'` instead.

## Expected Output
user_id,login_time,duration_minutes
1,2024-03-14 22:00:00,30
2,2024-03-15 09:00:00,45
3,2024-03-15 14:30:00,60
4,2024-03-15 23:45:00,15
