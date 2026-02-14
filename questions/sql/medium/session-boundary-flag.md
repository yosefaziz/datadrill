---
title: "Flag Session Start and End"
difficulty: "Medium"
tags: ["LAG", "LEAD", "window functions", "CASE WHEN", "sessionization"]
track: sql-sessionization
track_level: 2
track_order: 2
hints:
  - "Each event's role depends on the gaps before and after it - consider looking in both directions from the current row."
  - "Use LAG and LEAD to get the previous and next timestamps for each user. An event is a session start if the gap before it exceeds 30 minutes (or it is the first event). An event is a session end if the gap after it exceeds 30 minutes (or it is the last event)."
  - "Compute the gap to the previous event and the gap to the next event. Flag as 'session_start' when prev_gap > 30 min or prev is NULL, 'session_end' when next_gap > 30 min or next is NULL, and 'mid_session' otherwise. If a single event is both a start and end, label it 'session_start'."
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
expected_output_query: "WITH gaps AS (SELECT user_id, view_time, page, EXTRACT(EPOCH FROM (view_time - LAG(view_time) OVER (PARTITION BY user_id ORDER BY view_time))) / 60 AS prev_gap, EXTRACT(EPOCH FROM (LEAD(view_time) OVER (PARTITION BY user_id ORDER BY view_time) - view_time)) / 60 AS next_gap FROM page_views) SELECT user_id, view_time, page, CASE WHEN prev_gap IS NULL OR prev_gap > 30 THEN 'session_start' WHEN next_gap IS NULL OR next_gap > 30 THEN 'session_end' ELSE 'mid_session' END AS session_flag FROM gaps ORDER BY user_id, view_time"
---

# Flag Session Start and End

Write a query that labels each page view as 'session_start', 'session_end', or 'mid_session' based on a 30-minute inactivity threshold. A session start occurs when either there is no previous event for that user or the gap from the previous event exceeds 30 minutes. A session end occurs when there is no next event or the gap to the next event exceeds 30 minutes. Events that are neither a start nor an end are mid-session. If a single event qualifies as both a start and end (a one-event session), label it 'session_start'.

Return `user_id`, `view_time`, `page`, and `session_flag`, ordered by `user_id` then `view_time`.

## Expected Output
user_id,view_time,page,session_flag
1,2024-01-15 09:00:00,/home,session_start
1,2024-01-15 09:12:00,/products,mid_session
1,2024-01-15 09:28:00,/products/shoes,session_end
1,2024-01-15 14:05:00,/home,session_start
1,2024-01-15 14:22:00,/cart,session_end
2,2024-01-15 10:00:00,/home,session_start
2,2024-01-15 10:45:00,/blog,session_start
