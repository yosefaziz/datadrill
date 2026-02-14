---
title: "MoM Growth with Missing Months"
difficulty: "Hard"
tags: ["LAG", "window functions", "date arithmetic", "gaps", "GENERATE_SERIES"]
track: sql-yoy-growth
track_level: 3
track_order: 1
hints:
  - "A simple LAG over the ordered data will silently compare non-consecutive months when there are gaps. You need to verify that the previous row is actually the prior calendar month."
  - "After computing the LAG value, also retrieve the lagged month. Then use date arithmetic to check whether the gap between the current and previous month is exactly one month. If not, the comparison is invalid."
  - "Use LAG(signup_month) OVER (...) alongside LAG(signups) OVER (...). Then wrap the result in a CASE: only output the MoM values when signup_month - prev_signup_month equals INTERVAL 1 MONTH, otherwise return NULL."
tables:
  - name: monthly_signups
    visible_data: |
      signup_month,channel,signups
      2024-01-01,Organic,1200
      2024-02-01,Organic,1350
      2024-03-01,Organic,1280
      2024-05-01,Organic,1500
      2024-06-01,Organic,1620
      2024-01-01,Paid,800
      2024-02-01,Paid,950
      2024-04-01,Paid,870
      2024-05-01,Paid,1020
    hidden_datasets:
      - |
        signup_month,channel,signups
        2024-01-01,Referral,300
        2024-03-01,Referral,450
        2024-04-01,Referral,420
        2024-06-01,Referral,500
      - |
        signup_month,channel,signups
        2024-01-01,Organic,2000
        2024-02-01,Organic,2100
        2024-03-01,Organic,2050
        2024-04-01,Organic,2200
        2024-05-01,Organic,2300
        2024-06-01,Organic,2150
        2024-01-01,Paid,500
        2024-06-01,Paid,700
expected_output_query: "SELECT signup_month, channel, signups, CASE WHEN signup_month - LAG(signup_month) OVER (PARTITION BY channel ORDER BY signup_month) = INTERVAL 1 MONTH THEN LAG(signups) OVER (PARTITION BY channel ORDER BY signup_month) ELSE NULL END AS prev_month_signups, CASE WHEN signup_month - LAG(signup_month) OVER (PARTITION BY channel ORDER BY signup_month) = INTERVAL 1 MONTH THEN signups - LAG(signups) OVER (PARTITION BY channel ORDER BY signup_month) ELSE NULL END AS mom_change FROM monthly_signups ORDER BY channel, signup_month"
---

# MoM Growth with Missing Months

Write a query that calculates month-over-month signup changes per channel, but correctly handles gaps in the data where some months are missing for certain channels. When a month is missing, the comparison to the "previous" row would incorrectly compare against a non-adjacent month, producing misleading results.

Your query must detect when the previous row in each channel's sequence is not actually the prior calendar month and return NULL for both `prev_month_signups` and `mom_change` in those cases. Return `signup_month`, `channel`, `signups`, `prev_month_signups`, and `mom_change`. Order by `channel`, then `signup_month`.

## Expected Output
signup_month,channel,signups,prev_month_signups,mom_change
2024-01-01,Organic,1200,,
2024-02-01,Organic,1350,1200,150
2024-03-01,Organic,1280,1350,-70
2024-05-01,Organic,1500,,
2024-06-01,Organic,1620,1500,120
2024-01-01,Paid,800,,
2024-02-01,Paid,950,800,150
2024-04-01,Paid,870,,
2024-05-01,Paid,1020,870,150
