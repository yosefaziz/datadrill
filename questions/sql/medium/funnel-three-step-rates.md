---
title: "Three-Step Funnel Conversion Rates"
difficulty: "Medium"
tags: ["funnel analysis", "CASE WHEN", "FIRST_VALUE", "window functions"]
track: sql-funnel-conversion
track_level: 2
track_order: 2
hints:
  - "You need two different conversion metrics: one comparing each step to the step right before it, and one comparing each step to the very first step."
  - "Use a CTE with COUNT(DISTINCT) per event type and a step order column, then use LAG() for the previous step's count and FIRST_VALUE() for the first step's count."
  - "step_conversion_pct = ROUND(users / LAG(users) * 100, 1) and overall_conversion_pct = ROUND(users / FIRST_VALUE(users) * 100, 1). The first step should show 100.0 for both."
tables:
  - name: user_events
    visible_data: |
      user_id,event_type,event_date
      1,visit,2024-06-01
      2,visit,2024-06-01
      3,visit,2024-06-02
      4,visit,2024-06-02
      5,visit,2024-06-03
      6,visit,2024-06-03
      1,signup,2024-06-01
      2,signup,2024-06-02
      3,signup,2024-06-03
      4,signup,2024-06-04
      1,first_order,2024-06-05
      2,first_order,2024-06-06
    hidden_datasets:
      - |
        user_id,event_type,event_date
        10,visit,2024-07-01
        11,visit,2024-07-01
        12,visit,2024-07-02
        13,visit,2024-07-02
        14,visit,2024-07-03
        15,visit,2024-07-03
        16,visit,2024-07-04
        17,visit,2024-07-04
        18,visit,2024-07-05
        19,visit,2024-07-05
        10,signup,2024-07-02
        11,signup,2024-07-02
        12,signup,2024-07-03
        13,signup,2024-07-04
        14,signup,2024-07-05
        10,first_order,2024-07-05
        11,first_order,2024-07-06
        12,first_order,2024-07-07
      - |
        user_id,event_type,event_date
        20,visit,2024-08-01
        21,visit,2024-08-01
        22,visit,2024-08-02
        23,visit,2024-08-03
        20,signup,2024-08-02
        21,signup,2024-08-03
        22,signup,2024-08-04
        20,first_order,2024-08-05
expected_output_query: "WITH step_counts AS (SELECT event_type AS step, COUNT(DISTINCT user_id) AS users, CASE event_type WHEN 'visit' THEN 1 WHEN 'signup' THEN 2 WHEN 'first_order' THEN 3 END AS step_order FROM user_events GROUP BY event_type) SELECT step, users, ROUND(users * 100.0 / LAG(users, 1, users) OVER (ORDER BY step_order), 1) AS step_conversion_pct, ROUND(users * 100.0 / FIRST_VALUE(users) OVER (ORDER BY step_order), 1) AS overall_conversion_pct FROM step_counts ORDER BY step_order"
---

# Three-Step Funnel Conversion Rates

Write a query that analyzes a 3-step acquisition funnel (visit, signup, first_order) and computes two conversion metrics at each step: the step-over-step conversion rate and the overall conversion rate relative to the first step. Both rates should be expressed as percentages.

Return `step`, `users`, `step_conversion_pct`, and `overall_conversion_pct` (each rounded to 1 decimal place). The first step should show 100.0 for both conversion columns. Order results by funnel order.

## Expected Output
step,users,step_conversion_pct,overall_conversion_pct
visit,6,100.0,100.0
signup,4,66.7,66.7
first_order,2,50.0,33.3
