---
title: "Latest Login per User"
difficulty: "Medium"
tags: ["ROW_NUMBER", "deduplication", "subquery"]
tables:
  - name: user_logins
    visible_data: |
      id,user_id,login_date,ip_address
      1,1,2024-01-01,10.0.0.1
      2,1,2024-01-05,10.0.0.2
      3,2,2024-01-02,10.0.1.1
      4,2,2024-01-08,10.0.1.2
      5,3,2024-01-03,10.0.2.1
      6,1,2024-01-10,10.0.0.3
    hidden_datasets:
      - |
        id,user_id,login_date,ip_address
        1,10,2024-02-01,192.168.0.1
        2,10,2024-02-05,192.168.0.2
        3,11,2024-02-03,192.168.1.1
      - |
        id,user_id,login_date,ip_address
        1,20,2024-03-01,172.16.0.1
        2,21,2024-03-02,172.16.1.1
        3,20,2024-03-05,172.16.0.2
        4,22,2024-03-03,172.16.2.1
        5,21,2024-03-07,172.16.1.2
expected_output_query: "SELECT user_id, login_date, ip_address FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date DESC) as rn FROM user_logins) sub WHERE rn = 1 ORDER BY user_id"
---

# Latest Login per User

Write a query that keeps only the most recent login record for each user.

Use `ROW_NUMBER()` partitioned by `user_id`, ordered by `login_date DESC`, then filter for the first row.

Return `user_id`, `login_date`, and `ip_address`, ordered by user_id.

## Expected Output
| user_id | login_date | ip_address |
|---------|------------|------------|
| 1       | 2024-01-10 | 10.0.0.3   |
| 2       | 2024-01-08 | 10.0.1.2   |
| 3       | 2024-01-03 | 10.0.2.1   |
