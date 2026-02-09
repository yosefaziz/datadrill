---
title: "Employee Hierarchy Chain"
difficulty: "Hard"
tags: ["self-join", "hierarchy", "multi-level"]
tables:
  - name: employees
    visible_data: |
      id,name,manager_id
      1,CEO Sara,
      2,VP Alice,1
      3,VP Bob,1
      4,Mgr Charlie,2
      5,Mgr David,2
      6,Mgr Eve,3
      7,Dev Frank,4
      8,Dev Grace,5
    hidden_datasets:
      - |
        id,name,manager_id
        1,CEO Tom,
        2,VP Kate,1
        3,Dir Leo,2
        4,Mgr Mia,3
      - |
        id,name,manager_id
        1,CEO Zara,
        2,VP Noah,1
        3,VP Ivy,1
        4,Mgr Jack,2
        5,Mgr Quinn,3
        6,Dev Rose,4
        7,Dev Sam,5
expected_output_query: "SELECT e.name as employee, m.name as manager, gm.name as grand_manager FROM employees e JOIN employees m ON e.manager_id = m.id LEFT JOIN employees gm ON m.manager_id = gm.id WHERE e.manager_id IS NOT NULL AND m.manager_id IS NOT NULL ORDER BY e.name"
---

# Employee Hierarchy Chain

Write a query that shows the three-level hierarchy: each employee with their manager and their grand-manager.

Use a double self-join. Only include employees who have both a manager and a grand-manager.

Return `employee`, `manager`, and `grand_manager`, ordered by employee name.

## Expected Output
| employee    | manager   | grand_manager |
|-------------|-----------|---------------|
| Dev Frank   | Mgr Charlie | VP Alice    |
| Dev Grace   | Mgr David | VP Alice      |
| Mgr Charlie | VP Alice  | CEO Sara      |
| Mgr David   | VP Alice  | CEO Sara      |
| Mgr Eve     | VP Bob    | CEO Sara      |
