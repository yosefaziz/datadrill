---
title: "Two-Step Signup Funnel"
difficulty: "Easy"
tags: ["COUNT", "CASE WHEN", "funnel analysis", "conversion rate"]
track: sql-funnel-conversion
track_level: 1
track_order: 1
hints:
  - "Think about how to count distinct users who performed each event type separately within the same query."
  - "Use COUNT(DISTINCT CASE WHEN ... THEN user_id END) to count users for each funnel step, then divide to get a rate."
  - "Cast the counts to a decimal before dividing so you get a fractional result, then multiply by 100 and round to 1 decimal place."
tables:
  - name: user_events
    visible_data: |
      user_id,event_type,event_date
      1,signup,2024-03-01
      1,purchase,2024-03-05
      2,signup,2024-03-01
      3,signup,2024-03-02
      3,purchase,2024-03-08
      4,signup,2024-03-03
      5,signup,2024-03-04
      5,purchase,2024-03-06
    hidden_datasets:
      - |
        user_id,event_type,event_date
        10,signup,2024-04-01
        11,signup,2024-04-01
        12,signup,2024-04-02
        12,purchase,2024-04-05
        13,signup,2024-04-03
        14,signup,2024-04-04
        14,purchase,2024-04-07
        15,signup,2024-04-05
        15,purchase,2024-04-09
        16,signup,2024-04-06
      - |
        user_id,event_type,event_date
        20,signup,2024-05-01
        20,purchase,2024-05-03
        21,signup,2024-05-01
        22,signup,2024-05-02
        23,signup,2024-05-02
        23,purchase,2024-05-10
expected_output_query: "SELECT COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) AS signups, COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN user_id END) AS purchases, ROUND(COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN user_id END) * 100.0 / COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END), 1) AS conversion_rate FROM user_events"
---

# Two-Step Signup Funnel

Write a query that measures how many users signed up, how many made a purchase, and what percentage of signups converted to a purchase. Every user who purchased has also signed up, but not every signup leads to a purchase.

Return a single row with `signups`, `purchases`, and `conversion_rate` (as a percentage rounded to 1 decimal place).

## Expected Output
signups,purchases,conversion_rate
5,3,60.0
