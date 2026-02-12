---
title: "Most-Watched Course Per Learner"
difficulty: "Medium"
tags: ["RANK", "window functions", "CTE", "joins"]
tables:
  - name: learners
    visible_data: |
      learner_id,name,country
      1,Alice,US
      2,Bob,UK
      3,Clara,DE
    hidden_datasets:
      - |
        learner_id,name,country
        1,Alice,US
        2,Bob,UK
        3,Clara,DE
      - |
        learner_id,name,country
        1,Alice,US
        2,Bob,UK
        3,Clara,DE
  - name: courses
    visible_data: |
      course_id,title,category
      101,Intro to SQL,Data
      102,Advanced Python,Data
      103,Web Design,Design
    hidden_datasets:
      - |
        course_id,title,category
        101,Intro to SQL,Data
        102,Advanced Python,Data
        103,Web Design,Design
      - |
        course_id,title,category
        101,Intro to SQL,Data
        102,Advanced Python,Data
        103,Web Design,Design
  - name: watch_sessions
    visible_data: |
      session_id,learner_id,course_id,watch_minutes,session_date
      1,1,101,45,2024-01-10
      2,1,102,30,2024-01-11
      3,1,101,60,2024-01-12
      4,2,102,90,2024-01-10
      5,2,101,20,2024-01-11
      6,3,103,50,2024-01-10
      7,3,103,40,2024-01-11
    hidden_datasets:
      - |
        session_id,learner_id,course_id,watch_minutes,session_date
        1,1,101,30,2024-03-01
        2,1,102,30,2024-03-02
        3,1,103,30,2024-03-03
        4,2,101,60,2024-03-01
        5,2,102,60,2024-03-02
        6,3,103,45,2024-03-01
      - |
        session_id,learner_id,course_id,watch_minutes,session_date
        1,1,101,120,2024-06-01
        2,1,101,90,2024-06-02
        3,2,102,45,2024-06-01
        4,2,103,80,2024-06-02
        5,2,103,30,2024-06-03
        6,3,101,60,2024-06-01
        7,3,102,60,2024-06-02
        8,3,103,15,2024-06-03
expected_output_query: "WITH course_totals AS (SELECT ws.learner_id, l.name AS learner_name, c.title AS course_title, SUM(ws.watch_minutes) AS total_minutes, RANK() OVER (PARTITION BY ws.learner_id ORDER BY SUM(ws.watch_minutes) DESC) AS rk FROM watch_sessions ws JOIN learners l ON ws.learner_id = l.learner_id JOIN courses c ON ws.course_id = c.course_id GROUP BY ws.learner_id, l.name, c.title) SELECT learner_name, course_title, total_minutes FROM course_totals WHERE rk = 1 ORDER BY learner_name"
---

# Most-Watched Course Per Learner

For each learner, find the course they spent the **most total minutes** watching.

Use `RANK()` to handle ties - if a learner spent equal time on two courses, return both.

Return `learner_name`, `course_title`, and `total_minutes`, ordered by `learner_name`.

## Expected Output
learner_name,course_title,total_minutes
Alice,Intro to SQL,105
Bob,Advanced Python,90
Clara,Web Design,90
