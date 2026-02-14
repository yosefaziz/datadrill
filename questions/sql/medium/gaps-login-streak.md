---
title: "Current Active Login Streak"
difficulty: "Medium"
tags: ["gaps and islands", "ROW_NUMBER", "window functions", "streaks"]
track: sql-gaps-islands
track_level: 3
track_order: 1
hints:
  - "A streak is a set of consecutive dates for the same user. You need to find only the streak that includes the user's most recent login."
  - "Use the ROW_NUMBER difference technique per user to assign a group identifier to each island of consecutive login dates. Then filter for the group that contains each user's maximum login date."
  - "Compute login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL 1 DAY as the group key. Group by user_id and that key to find each streak. Then keep only the streak where MAX(login_date) equals the user's overall most recent login."
tables:
  - name: daily_logins
    visible_data: |
      user_id,login_date
      1,2024-05-01
      1,2024-05-02
      1,2024-05-05
      1,2024-05-06
      1,2024-05-07
      2,2024-05-03
      2,2024-05-06
      2,2024-05-07
      3,2024-05-04
      3,2024-05-05
      3,2024-05-06
      3,2024-05-07
    hidden_datasets:
      - |
        user_id,login_date
        10,2024-08-01
        10,2024-08-02
        10,2024-08-03
        11,2024-08-05
      - |
        user_id,login_date
        20,2024-11-01
        20,2024-11-02
        20,2024-11-04
        20,2024-11-05
        20,2024-11-06
        21,2024-11-01
        21,2024-11-03
        21,2024-11-04
        21,2024-11-05
        21,2024-11-06
expected_output_query: "WITH streaks AS (SELECT user_id, login_date, login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL 1 DAY AS grp FROM daily_logins), streak_agg AS (SELECT user_id, grp, COUNT(*) AS streak_days, MIN(login_date) AS streak_start, MAX(login_date) AS streak_end FROM streaks GROUP BY user_id, grp), user_max AS (SELECT user_id, MAX(login_date) AS max_date FROM daily_logins GROUP BY user_id) SELECT sa.user_id, sa.streak_days, sa.streak_start FROM streak_agg sa JOIN user_max um ON sa.user_id = um.user_id AND sa.streak_end = um.max_date ORDER BY sa.user_id"
---

# Current Active Login Streak

Write a query that finds each user's current active login streak - the sequence of consecutive days ending on their most recent login date.

For example, if a user logged in on May 5, 6, and 7, and May 7 is their last login, their current streak is 3 days starting May 5.

Return `user_id`, `streak_days`, and `streak_start`, ordered by `user_id`.

## Expected Output
user_id,streak_days,streak_start
1,3,2024-05-05
2,2,2024-05-06
3,4,2024-05-04
