---
title: "Employees Missing Required Training"
difficulty: "Hard"
tags: ["NOT EXISTS", "correlated subquery", "complex filtering"]
tables:
  - name: employees
    visible_data: |
      id,name,department
      1,Alice,Engineering
      2,Bob,Engineering
      3,Charlie,Marketing
      4,David,Engineering
      5,Eve,Marketing
    hidden_datasets:
      - |
        id,name,department
        1,Frank,Sales
        2,Grace,Sales
        3,Henry,Engineering
      - |
        id,name,department
        1,Ivy,HR
        2,Jack,HR
        3,Kate,Engineering
        4,Leo,Engineering
  - name: training_courses
    visible_data: |
      id,course_name,required
      101,SQL Basics,true
      102,Python Intro,true
      103,Leadership,false
    hidden_datasets:
      - |
        id,course_name,required
        201,Excel,true
        202,Presenting,false
      - |
        id,course_name,required
        301,Security,true
        302,Ethics,true
        303,Onboarding,false
  - name: completions
    visible_data: |
      employee_id,course_id,completed_date
      1,101,2024-01-15
      1,102,2024-02-01
      2,101,2024-01-20
      3,101,2024-01-25
      3,102,2024-02-10
      5,101,2024-03-01
      5,102,2024-03-05
    hidden_datasets:
      - |
        employee_id,course_id,completed_date
        1,201,2024-01-10
        2,201,2024-02-01
      - |
        employee_id,course_id,completed_date
        1,301,2024-01-05
        1,302,2024-01-10
        3,301,2024-02-01
expected_output_query: "SELECT DISTINCT e.name FROM employees e, training_courses tc WHERE tc.required = true AND NOT EXISTS (SELECT 1 FROM completions c WHERE c.employee_id = e.id AND c.course_id = tc.id) ORDER BY e.name"
---

# Employees Missing Required Training

Write a query that finds employees who have NOT completed all required training courses.

An employee appears in the result if there is at least one required course they haven't completed.

Use a cross join between employees and required courses, then `NOT EXISTS` to check for missing completions.

Return distinct employee `name`, ordered alphabetically.

## Expected Output
| name   |
|--------|
| Bob    |
| David  |
| Eve    |
