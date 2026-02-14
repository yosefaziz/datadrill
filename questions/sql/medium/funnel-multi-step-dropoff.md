---
title: "Multi-Step Funnel Drop-off Rates"
difficulty: "Medium"
tags: ["funnel analysis", "CASE WHEN", "LAG", "window functions"]
track: sql-funnel-conversion
track_level: 2
track_order: 1
hints:
  - "Start by counting distinct users at each funnel step, then figure out how to compare each step to the one before it."
  - "Use a CTE to compute user counts per step in a defined order, then apply LAG() to access the previous step's count and calculate the percentage lost."
  - "Order steps with a CASE expression (view=1, add_to_cart=2, checkout=3, purchase=4). Drop-off is ROUND((1 - current_users / previous_users) * 100, 1), and the first step should show NULL."
tables:
  - name: user_events
    visible_data: |
      user_id,event_type,event_date
      1,view,2024-06-01
      2,view,2024-06-01
      3,view,2024-06-01
      4,view,2024-06-02
      5,view,2024-06-02
      1,add_to_cart,2024-06-01
      2,add_to_cart,2024-06-01
      3,add_to_cart,2024-06-02
      4,add_to_cart,2024-06-03
      1,checkout,2024-06-02
      2,checkout,2024-06-02
      3,checkout,2024-06-03
      1,purchase,2024-06-02
      2,purchase,2024-06-03
    hidden_datasets:
      - |
        user_id,event_type,event_date
        10,view,2024-07-01
        11,view,2024-07-01
        12,view,2024-07-02
        13,view,2024-07-02
        14,view,2024-07-03
        15,view,2024-07-03
        16,view,2024-07-04
        17,view,2024-07-04
        10,add_to_cart,2024-07-01
        11,add_to_cart,2024-07-02
        12,add_to_cart,2024-07-02
        13,add_to_cart,2024-07-03
        14,add_to_cart,2024-07-04
        10,checkout,2024-07-02
        11,checkout,2024-07-03
        12,checkout,2024-07-03
        10,purchase,2024-07-03
        11,purchase,2024-07-04
      - |
        user_id,event_type,event_date
        20,view,2024-08-01
        21,view,2024-08-01
        22,view,2024-08-02
        23,view,2024-08-02
        24,view,2024-08-03
        25,view,2024-08-03
        20,add_to_cart,2024-08-01
        21,add_to_cart,2024-08-02
        22,add_to_cart,2024-08-03
        23,add_to_cart,2024-08-03
        20,checkout,2024-08-02
        21,checkout,2024-08-03
        20,purchase,2024-08-03
expected_output_query: "WITH step_counts AS (SELECT event_type AS step, COUNT(DISTINCT user_id) AS users, CASE event_type WHEN 'view' THEN 1 WHEN 'add_to_cart' THEN 2 WHEN 'checkout' THEN 3 WHEN 'purchase' THEN 4 END AS step_order FROM user_events GROUP BY event_type) SELECT step, users, ROUND((1.0 - users * 1.0 / LAG(users) OVER (ORDER BY step_order)) * 100, 1) AS dropoff_pct FROM step_counts ORDER BY step_order"
---

# Multi-Step Funnel Drop-off Rates

Write a query that builds a 4-step e-commerce funnel (view, add_to_cart, checkout, purchase) showing the number of distinct users at each step and the drop-off percentage between consecutive steps. The drop-off percentage represents the share of users from the previous step who did not continue to the current step.

Return `step`, `users`, and `dropoff_pct` (rounded to 1 decimal place). The first step should have a NULL drop-off since there is no prior step. Order results by funnel order.

## Expected Output
step,users,dropoff_pct
view,5,
add_to_cart,4,20.0
checkout,3,25.0
purchase,2,33.3
