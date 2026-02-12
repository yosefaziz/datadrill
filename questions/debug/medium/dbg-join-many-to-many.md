---
title: "Inflated COUNT from Re-enrollments"
difficulty: "Medium"
tags: ["JOIN", "COUNT", "DISTINCT", "debugging", "SQL"]
language: sql
tables:
  - name: courses
    visible_data: |
      id,name
      1,SQL Basics
      2,Python 101
      3,Statistics
    hidden_datasets:
      - |
        id,name
        1,Calculus
        2,Physics
      - |
        id,name
        1,Biology
        2,Chemistry
        3,History
  - name: enrollments
    visible_data: |
      id,student_id,course_id,semester
      1,1,1,Fall
      2,2,1,Fall
      3,1,1,Spring
      4,3,2,Fall
      5,2,2,Fall
      6,3,3,Fall
      7,1,2,Spring
    hidden_datasets:
      - |
        id,student_id,course_id,semester
        1,1,1,Fall
        2,1,1,Spring
        3,2,1,Fall
      - |
        id,student_id,course_id,semester
        1,1,1,Fall
        2,2,1,Fall
        3,2,1,Spring
        4,3,2,Fall
        5,3,2,Spring
        6,1,3,Fall
broken_code: |
  SELECT c.name, COUNT(*) as student_count
  FROM courses c
  JOIN enrollments e ON c.id = e.course_id
  GROUP BY c.name
  ORDER BY c.name
expected_output_query: |
  SELECT c.name, COUNT(DISTINCT e.student_id) as student_count
  FROM courses c
  JOIN enrollments e ON c.id = e.course_id
  GROUP BY c.name
  ORDER BY c.name
hint: "Students can re-enroll in a course. COUNT(*) counts all enrollments, not unique students."
---

# Inflated COUNT from Re-enrollments

The query shows how many students are enrolled in each course, but the counts are too high because students who re-enrolled are counted multiple times.

Fix the query to count unique students per course.


## Expected Output
name,student_count
Python 101,3
SQL Basics,2
Statistics,1
