---
title: "Session Metrics Summary"
difficulty: "Hard"
tags: ["LAG", "SUM", "window functions", "CTE", "sessionization", "aggregation"]
track: sql-sessionization
track_level: 3
track_order: 1
hints:
  - "This is a two-phase problem: first identify which session each event belongs to, then aggregate to get per-session statistics."
  - "Use LAG to detect gaps exceeding 30 minutes, flag those as new sessions, then compute a running SUM of the flag to assign session IDs. Feed that into a second step that groups by user and session."
  - "Build a CTE that assigns session_id using LAG + CASE + SUM(). Then SELECT user_id, session_id, MIN(view_time) as session_start, MAX(view_time) as session_end, ROUND(EXTRACT(EPOCH FROM (MAX(view_time) - MIN(view_time))) / 60, 0) as duration_minutes, COUNT(*) as pages_viewed, grouped by user_id and session_id."
tables:
  - name: page_views
    visible_data: |
      user_id,view_time,page
      1,2024-01-15 09:00:00,/home
      1,2024-01-15 09:12:00,/products
      1,2024-01-15 09:28:00,/products/shoes
      1,2024-01-15 14:05:00,/home
      1,2024-01-15 14:22:00,/cart
      2,2024-01-15 10:00:00,/home
      2,2024-01-15 10:45:00,/blog
    hidden_datasets:
      - |
        user_id,view_time,page
        5,2024-02-10 08:30:00,/home
        5,2024-02-10 08:31:00,/search
        5,2024-02-10 08:32:00,/products
        5,2024-02-10 12:00:00,/home
        6,2024-02-10 09:00:00,/home
      - |
        user_id,view_time,page
        10,2024-03-05 11:00:00,/home
        10,2024-03-05 11:05:00,/about
        10,2024-03-05 11:35:00,/pricing
        10,2024-03-05 11:36:00,/signup
        11,2024-03-05 14:00:00,/home
        11,2024-03-05 14:20:00,/blog
        11,2024-03-05 15:50:00,/home
expected_output_query: "WITH flagged AS (SELECT user_id, view_time, page, CASE WHEN EXTRACT(EPOCH FROM (view_time - LAG(view_time) OVER (PARTITION BY user_id ORDER BY view_time))) / 60 > 30 OR LAG(view_time) OVER (PARTITION BY user_id ORDER BY view_time) IS NULL THEN 1 ELSE 0 END AS new_session FROM page_views), sessions AS (SELECT user_id, view_time, page, SUM(new_session) OVER (PARTITION BY user_id ORDER BY view_time) AS session_id FROM flagged) SELECT user_id, session_id, MIN(view_time) AS session_start, MAX(view_time) AS session_end, ROUND(EXTRACT(EPOCH FROM (MAX(view_time) - MIN(view_time))) / 60, 0) AS duration_minutes, COUNT(*) AS pages_viewed FROM sessions GROUP BY user_id, session_id ORDER BY user_id, session_id"
---

# Session Metrics Summary

Write a query that computes session-level metrics from raw page view events. Define a session boundary as a gap of more than 30 minutes between consecutive page views for the same user. For each session, calculate when it started, when it ended, how long it lasted in minutes, and how many pages were viewed. Assign sequential session IDs per user starting at 1.

Return `user_id`, `session_id`, `session_start`, `session_end`, `duration_minutes` (rounded to 0 decimal places), and `pages_viewed`, ordered by `user_id` then `session_id`.

## Expected Output
user_id,session_id,session_start,session_end,duration_minutes,pages_viewed
1,1,2024-01-15 09:00:00,2024-01-15 09:28:00,28.0,3
1,2,2024-01-15 14:05:00,2024-01-15 14:22:00,17.0,2
2,1,2024-01-15 10:00:00,2024-01-15 10:00:00,0.0,1
2,2,2024-01-15 10:45:00,2024-01-15 10:45:00,0.0,1
