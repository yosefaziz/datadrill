---
title: "Time-Bounded Conversion Funnel"
difficulty: "Hard"
tags: ["funnel analysis", "self-join", "date arithmetic", "INTERVAL"]
track: sql-funnel-conversion
track_level: 3
track_order: 1
hints:
  - "You need each user's signup date as a reference point, then check whether their later events fell within the allowed time window."
  - "Use a CTE to isolate signup dates, then LEFT JOIN the events table back to filter activation and purchase events that occurred within 7 days of each user's signup date."
  - "Join user_events to a signup CTE on user_id and filter with e.event_date <= s.signup_date + INTERVAL 7 DAY. Count distinct users per step. Conversion is ROUND(users_within_7d / first_step * 100, 1)."
tables:
  - name: user_events
    visible_data: |
      user_id,event_type,event_date
      1,signup,2024-06-01
      1,activation,2024-06-03
      1,purchase,2024-06-07
      2,signup,2024-06-01
      2,activation,2024-06-10
      2,purchase,2024-06-15
      3,signup,2024-06-02
      3,activation,2024-06-04
      4,signup,2024-06-03
      4,activation,2024-06-12
      5,signup,2024-06-04
      5,activation,2024-06-06
      5,purchase,2024-06-08
    hidden_datasets:
      - |
        user_id,event_type,event_date
        10,signup,2024-07-01
        10,activation,2024-07-02
        10,purchase,2024-07-04
        11,signup,2024-07-01
        11,activation,2024-07-03
        11,purchase,2024-07-05
        12,signup,2024-07-02
        12,activation,2024-07-10
        12,purchase,2024-07-15
        13,signup,2024-07-02
        13,activation,2024-07-04
        13,purchase,2024-07-20
        14,signup,2024-07-03
        15,signup,2024-07-04
        15,activation,2024-07-06
        15,purchase,2024-07-08
      - |
        user_id,event_type,event_date
        20,signup,2024-08-01
        20,activation,2024-08-02
        20,purchase,2024-08-03
        21,signup,2024-08-01
        21,activation,2024-08-09
        21,purchase,2024-08-12
        22,signup,2024-08-02
        22,activation,2024-08-04
        22,purchase,2024-08-06
        23,signup,2024-08-03
        23,activation,2024-08-04
        24,signup,2024-08-04
        24,activation,2024-08-05
        24,purchase,2024-08-20
expected_output_query: "WITH signups AS (SELECT user_id, event_date AS signup_date FROM user_events WHERE event_type = 'signup'), step_counts AS (SELECT 'signup' AS step, COUNT(DISTINCT s.user_id) AS users_within_7d, 1 AS step_order FROM signups s UNION ALL SELECT 'activation', COUNT(DISTINCT s.user_id), 2 FROM signups s INNER JOIN user_events e ON s.user_id = e.user_id AND e.event_type = 'activation' AND e.event_date <= s.signup_date + INTERVAL 7 DAY UNION ALL SELECT 'purchase', COUNT(DISTINCT s.user_id), 3 FROM signups s INNER JOIN user_events e ON s.user_id = e.user_id AND e.event_type = 'purchase' AND e.event_date <= s.signup_date + INTERVAL 7 DAY) SELECT step, users_within_7d, ROUND(users_within_7d * 100.0 / FIRST_VALUE(users_within_7d) OVER (ORDER BY step_order), 1) AS conversion_pct FROM step_counts ORDER BY step_order"
---

# Time-Bounded Conversion Funnel

Write a query that builds a 3-step funnel (signup, activation, purchase) where each subsequent step only counts if it happened within 7 days of the user's signup date. Users who activated or purchased outside this window should not be counted in those steps. For example, a user who signed up on June 1 and purchased on June 15 would count as a signup but not as a purchase.

Return `step`, `users_within_7d`, and `conversion_pct` (the percentage of signup users who reached each step, rounded to 1 decimal place). Order results by funnel order.

## Expected Output
step,users_within_7d,conversion_pct
signup,5,100.0
activation,3,60.0
purchase,2,40.0
