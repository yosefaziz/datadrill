---
title: "Assign Session IDs to Events"
difficulty: "Medium"
tags: ["LAG", "window functions", "CASE WHEN", "SUM", "sessionization"]
track: sql-sessionization
track_level: 2
track_order: 1
hints:
  - "Start by figuring out which events begin a new session - look at the time gap from the previous event for the same user."
  - "Use LAG to get each row's previous timestamp, then create a binary flag (1 or 0) for whether the gap exceeds the threshold. A running sum of that flag gives sequential session numbers."
  - "Compute LAG(view_time) OVER (PARTITION BY user_id ORDER BY view_time), flag rows where the gap exceeds 30 minutes or the previous time is NULL as 1, then use SUM() OVER (PARTITION BY user_id ORDER BY view_time) on those flags to assign session IDs."
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
expected_output_query: "WITH flagged AS (SELECT user_id, view_time, page, CASE WHEN EXTRACT(EPOCH FROM (view_time - LAG(view_time) OVER (PARTITION BY user_id ORDER BY view_time))) / 60 > 30 OR LAG(view_time) OVER (PARTITION BY user_id ORDER BY view_time) IS NULL THEN 1 ELSE 0 END AS new_session FROM page_views) SELECT user_id, view_time, page, SUM(new_session) OVER (PARTITION BY user_id ORDER BY view_time) AS session_id FROM flagged ORDER BY user_id, view_time"
---

# Assign Session IDs to Events

Write a query that assigns a sequential session ID to each page view. A new session begins whenever more than 30 minutes have passed since the user's previous page view, or when the event is the user's first. Session IDs should start at 1 and increment for each new session per user.

Return `user_id`, `view_time`, `page`, and `session_id`, ordered by `user_id` then `view_time`.

## Expected Output
user_id,view_time,page,session_id
1,2024-01-15 09:00:00,/home,1
1,2024-01-15 09:12:00,/products,1
1,2024-01-15 09:28:00,/products/shoes,1
1,2024-01-15 14:05:00,/home,2
1,2024-01-15 14:22:00,/cart,2
2,2024-01-15 10:00:00,/home,1
2,2024-01-15 10:45:00,/blog,2
