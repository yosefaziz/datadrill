---
title: "Student Course Enrollments"
difficulty: "Easy"
tags: ["JOIN", "multi-table"]
tables:
  - name: students
    visible_data: |
      id,name
      1,Alice
      2,Bob
      3,Charlie
    hidden_datasets:
      - |
        id,name
        1,David
        2,Eve
      - |
        id,name
        1,Frank
        2,Grace
        3,Henry
        4,Ivy
  - name: enrollments
    visible_data: |
      id,student_id,course_id
      1,1,101
      2,1,102
      3,2,101
      4,2,103
      5,3,103
    hidden_datasets:
      - |
        id,student_id,course_id
        1,1,201
        2,2,201
        3,2,202
      - |
        id,student_id,course_id
        1,1,301
        2,2,302
        3,3,301
        4,3,303
        5,4,302
  - name: courses
    visible_data: |
      id,course_name
      101,Intro to SQL
      102,Data Structures
      103,Statistics
    hidden_datasets:
      - |
        id,course_name
        201,Calculus
        202,Physics
      - |
        id,course_name
        301,Biology
        302,Chemistry
        303,History
expected_output_query: "SELECT s.name as student_name, c.course_name FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id ORDER BY s.name, c.course_name"
---

# Student Course Enrollments

Write a query that joins three tables to show which courses each student is enrolled in.

Return the `student_name` and `course_name`, ordered by student name then course name.

## Expected Output
| student_name | course_name     |
|--------------|-----------------|
| Alice        | Data Structures |
| Alice        | Intro to SQL    |
| Bob          | Intro to SQL    |
| Bob          | Statistics      |
| Charlie      | Statistics      |
