---
title: "Longest Login Streak Per User"
difficulty: "Medium"
tags: ["gaps and islands", "ROW_NUMBER", "window functions", "streaks", "ranking"]
track: sql-gaps-islands
track_level: 3
track_order: 2
hints:
  - "First identify all streaks of consecutive login days for each user, then pick the longest one per user."
  - "Use the ROW_NUMBER difference technique to assign a group identifier to each island of consecutive dates. Then aggregate each group to get its length and date range."
  - "Compute login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL 1 DAY as the group key. Group by user_id and that key. Then use ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY COUNT(*) DESC, MAX(login_date) DESC) to pick the longest streak per user, breaking ties by most recent."
tables:
  - name: daily_logins
    visible_data: |
      user_id,login_date
      1,2024-06-01
      1,2024-06-02
      1,2024-06-03
      1,2024-06-06
      1,2024-06-07
      2,2024-06-01
      2,2024-06-03
      2,2024-06-04
      2,2024-06-05
      2,2024-06-06
      3,2024-06-02
      3,2024-06-03
      3,2024-06-08
    hidden_datasets:
      - |
        user_id,login_date
        10,2024-08-01
        10,2024-08-02
        10,2024-08-05
        10,2024-08-06
        11,2024-08-01
        11,2024-08-02
        11,2024-08-03
      - |
        user_id,login_date
        20,2024-11-01
        20,2024-11-02
        20,2024-11-03
        20,2024-11-05
        20,2024-11-06
        20,2024-11-07
        21,2024-11-10
        21,2024-11-11
        21,2024-11-15
        21,2024-11-16
        21,2024-11-17
expected_output_query: "WITH streaks AS (SELECT user_id, login_date, login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL 1 DAY AS grp FROM daily_logins), streak_agg AS (SELECT user_id, COUNT(*) AS longest_streak, MIN(login_date) AS streak_start, MAX(login_date) AS streak_end FROM streaks GROUP BY user_id, grp), ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY longest_streak DESC, streak_end DESC) AS rn FROM streak_agg) SELECT user_id, longest_streak, streak_start, streak_end FROM ranked WHERE rn = 1 ORDER BY user_id"
---

# Longest Login Streak Per User

Write a query that finds each user's longest streak of consecutive login days. A streak is a sequence of dates with no gaps where the user logged in every day.

If a user has multiple streaks of the same length, return the most recent one.

Return `user_id`, `longest_streak` (number of days), `streak_start`, and `streak_end`, ordered by `user_id`.

## Expected Output
user_id,longest_streak,streak_start,streak_end
1,3,2024-06-01,2024-06-03
2,4,2024-06-03,2024-06-06
3,2,2024-06-02,2024-06-03
