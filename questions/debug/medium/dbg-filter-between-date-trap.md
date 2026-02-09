---
title: "BETWEEN Date Misses End-of-Day Events"
difficulty: "Medium"
tags: ["BETWEEN", "date", "timestamp", "debugging", "SQL"]
language: sql
tables:
  - name: events
    visible_data: |
      id,event_name,event_timestamp
      1,Login,2024-01-01 09:00:00
      2,Purchase,2024-01-15 14:30:00
      3,Signup,2024-01-31 10:00:00
      4,Logout,2024-01-31 18:30:00
      5,View,2024-02-01 08:00:00
    hidden_datasets:
      - |
        id,event_name,event_timestamp
        1,Click,2024-01-10 12:00:00
        2,Scroll,2024-01-31 23:59:00
        3,Download,2024-02-01 00:01:00
      - |
        id,event_name,event_timestamp
        1,Upload,2024-01-01 00:00:00
        2,Share,2024-01-20 15:00:00
        3,Edit,2024-01-31 22:00:00
        4,Delete,2024-02-01 06:00:00
broken_code: |
  SELECT event_name, event_timestamp
  FROM events
  WHERE event_timestamp BETWEEN '2024-01-01' AND '2024-01-31'
  ORDER BY event_timestamp
expected_output_query: |
  SELECT event_name, event_timestamp
  FROM events
  WHERE event_timestamp >= '2024-01-01' AND event_timestamp < '2024-02-01'
  ORDER BY event_timestamp
hint: "When comparing timestamps with dates, '2024-01-31' is treated as midnight (00:00:00). Events later in the day on Jan 31 are after midnight."
---

# BETWEEN Date Misses End-of-Day Events

The query should find all events in January 2024, but events on January 31st after midnight are being missed.

Fix the date range to capture the full day.

**The Bug:** `BETWEEN '2024-01-01' AND '2024-01-31'` treats Jan 31 as midnight (00:00:00), missing events at 10:00 and 18:30 on that day. Use `< '2024-02-01'` instead.

## Expected Output
| event_name | event_timestamp     |
|------------|---------------------|
| Login      | 2024-01-01 09:00:00 |
| Purchase   | 2024-01-15 14:30:00 |
| Signup     | 2024-01-31 10:00:00 |
| Logout     | 2024-01-31 18:30:00 |
