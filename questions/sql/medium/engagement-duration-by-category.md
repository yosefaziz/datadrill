---
title: "Watch Time by Category Per Learner"
difficulty: "Medium"
tags: ["JOIN", "GROUP BY", "ORDER BY", "aggregation"]
tables:
  - name: courses
    visible_data: |
      course_id,title,category
      101,Intro to SQL,Data
      102,Advanced Python,Data
      103,Web Design,Design
      104,UX Research,Design
    hidden_datasets:
      - |
        course_id,title,category
        101,Intro to SQL,Data
        102,Advanced Python,Data
        103,Web Design,Design
        104,UX Research,Design
      - |
        course_id,title,category
        101,Intro to SQL,Data
        102,Advanced Python,Data
        103,Web Design,Design
        104,UX Research,Design
  - name: watch_sessions
    visible_data: |
      session_id,learner_id,course_id,watch_minutes,session_date
      1,1,101,45,2024-01-10
      2,1,102,30,2024-01-11
      3,1,103,20,2024-01-12
      4,2,103,60,2024-01-10
      5,2,104,35,2024-01-11
      6,2,101,15,2024-01-12
      7,3,102,80,2024-01-10
    hidden_datasets:
      - |
        session_id,learner_id,course_id,watch_minutes,session_date
        1,1,101,40,2024-03-01
        2,1,103,40,2024-03-02
        3,2,102,55,2024-03-01
        4,2,104,55,2024-03-02
        5,3,101,30,2024-03-01
        6,3,103,30,2024-03-02
      - |
        session_id,learner_id,course_id,watch_minutes,session_date
        1,1,101,20,2024-06-01
        2,1,102,35,2024-06-02
        3,1,103,50,2024-06-03
        4,1,104,10,2024-06-04
        5,2,101,90,2024-06-01
        6,3,103,25,2024-06-01
        7,3,104,40,2024-06-02
expected_output_query: "SELECT ws.learner_id, c.category, SUM(ws.watch_minutes) AS total_minutes FROM watch_sessions ws JOIN courses c ON ws.course_id = c.course_id GROUP BY ws.learner_id, c.category ORDER BY ws.learner_id ASC, total_minutes DESC"
---

# Watch Time by Category Per Learner

Calculate each learner's **total watch time per course category**.

Join watch sessions with courses, group by learner and category, then sum the minutes.

Return `learner_id`, `category`, and `total_minutes`.

Order by `learner_id` ascending, then by `total_minutes` descending within each learner (highest engagement category first).

## Expected Output
learner_id,category,total_minutes
1,Data,75
1,Design,20
2,Design,95
2,Data,15
3,Data,80
