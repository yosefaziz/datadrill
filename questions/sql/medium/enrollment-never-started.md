---
title: "Courses Never Started"
difficulty: "Medium"
tags: ["EXCEPT", "LEFT JOIN", "anti-pattern"]
tables:
  - name: enrollments
    visible_data: |
      enrollment_id,learner_id,course_id,enrolled_date
      1,1,101,2024-01-05
      2,1,102,2024-01-05
      3,1,103,2024-01-08
      4,2,101,2024-01-06
      5,2,103,2024-01-06
      6,3,102,2024-01-07
    hidden_datasets:
      - |
        enrollment_id,learner_id,course_id,enrolled_date
        1,1,101,2024-03-01
        2,1,102,2024-03-01
        3,2,101,2024-03-02
        4,2,102,2024-03-02
        5,3,101,2024-03-03
      - |
        enrollment_id,learner_id,course_id,enrolled_date
        1,1,101,2024-06-01
        2,1,102,2024-06-01
        3,1,103,2024-06-01
        4,2,102,2024-06-02
        5,3,101,2024-06-03
        6,3,103,2024-06-03
  - name: watch_sessions
    visible_data: |
      session_id,learner_id,course_id,watch_minutes,session_date
      1,1,101,45,2024-01-10
      2,1,101,60,2024-01-12
      3,2,103,30,2024-01-11
      4,3,102,50,2024-01-10
    hidden_datasets:
      - |
        session_id,learner_id,course_id,watch_minutes,session_date
        1,1,101,40,2024-03-05
        2,2,102,55,2024-03-06
        3,3,101,30,2024-03-07
      - |
        session_id,learner_id,course_id,watch_minutes,session_date
        1,1,101,60,2024-06-05
        2,1,103,20,2024-06-06
        3,3,103,45,2024-06-07
expected_output_query: "SELECT e.learner_id, e.course_id FROM enrollments e LEFT JOIN (SELECT DISTINCT learner_id, course_id FROM watch_sessions) ws ON e.learner_id = ws.learner_id AND e.course_id = ws.course_id WHERE ws.learner_id IS NULL ORDER BY e.learner_id, e.course_id"
---

# Courses Never Started

Find all courses that learners enrolled in but **never watched a single session** of.

Return `learner_id` and `course_id` for each enrollment with no matching watch sessions.

Order by `learner_id`, then `course_id`.

**Hint**: You can solve this with `EXCEPT` or a `LEFT JOIN` anti-pattern.

## Expected Output
learner_id,course_id
1,102
1,103
2,101
