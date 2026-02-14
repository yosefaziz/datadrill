---
title: "Time Gaps Between Page Views"
difficulty: "Easy"
tags: ["LAG", "window functions", "PARTITION BY", "timestamp arithmetic"]
track: sql-sessionization
track_level: 1
track_order: 1
hints:
  - "Think about how to access the previous row's timestamp within each user's sequence of events."
  - "Use LAG() partitioned by user and ordered by time, then compute the difference between the current and previous timestamp."
  - "Extract the total seconds from the interval between view_time and the lagged value, divide by 60, and round to get minutes. The first event per user has no predecessor."
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
expected_output_query: "SELECT user_id, view_time, page, ROUND(EXTRACT(EPOCH FROM (view_time - LAG(view_time) OVER (PARTITION BY user_id ORDER BY view_time))) / 60, 0) AS minutes_since_last FROM page_views ORDER BY user_id, view_time"
---

# Time Gaps Between Page Views

Write a query that calculates the time gap in minutes between consecutive page views for each user. For every row, show how many minutes have passed since that user's previous page view. The first page view for each user should show NULL since there is no prior event.

Return `user_id`, `view_time`, `page`, and `minutes_since_last` (rounded to 0 decimal places), ordered by `user_id` then `view_time`.

## Expected Output
user_id,view_time,page,minutes_since_last
1,2024-01-15 09:00:00,/home,
1,2024-01-15 09:12:00,/products,12.0
1,2024-01-15 09:28:00,/products/shoes,16.0
1,2024-01-15 14:05:00,/home,277.0
1,2024-01-15 14:22:00,/cart,17.0
2,2024-01-15 10:00:00,/home,
2,2024-01-15 10:45:00,/blog,45.0
