---
title: "Consecutive Study Day Streaks"
difficulty: "Medium"
tags: ["python", "dict", "set", "dates", "streaks"]
function_name: longest_streaks
test_cases:
  - call: |
      longest_streaks([
        {"student": "alice", "course": "SQL 101", "date": "2024-03-01"},
        {"student": "alice", "course": "SQL 101", "date": "2024-03-02"},
        {"student": "alice", "course": "SQL 101", "date": "2024-03-03"},
        {"student": "alice", "course": "SQL 101", "date": "2024-03-06"},
        {"student": "alice", "course": "SQL 101", "date": "2024-03-07"},
        {"student": "bob",   "course": "SQL 101", "date": "2024-03-10"},
      ])
    expected: |
      {("alice", "SQL 101"): 3, ("bob", "SQL 101"): 1}
    label: "Basic streaks"
hidden_test_cases:
  - call: "longest_streaks([])"
    expected: "{}"
    label: "Empty input"
  - call: |
      longest_streaks([
        {"student": "alice", "course": "SQL 101", "date": "2024-03-01"},
        {"student": "alice", "course": "SQL 101", "date": "2024-03-01"},
      ])
    expected: |
      {("alice", "SQL 101"): 1}
    label: "Duplicate dates"
  - call: |
      longest_streaks([
        {"student": "alice", "course": "SQL 101", "date": "2024-01-31"},
        {"student": "alice", "course": "SQL 101", "date": "2024-02-01"},
      ])
    expected: |
      {("alice", "SQL 101"): 2}
    label: "Cross-month streak"
---

# Consecutive Study Day Streaks

Given a list of study log dicts:

```python
{"student": str, "course": str, "date": str}  # date as "YYYY-MM-DD"
```

For each `(student, course)`, find the longest streak of consecutive calendar days they studied.

Write a function:

```python
def longest_streaks(logs):
    # logs: list of dicts with student, course, date
    # return: dict mapping (student, course) tuple -> int (longest streak)
```

## Examples

```
logs = [
    {"student": "alice", "course": "SQL 101",  "date": "2024-03-01"},
    {"student": "alice", "course": "SQL 101",  "date": "2024-03-02"},
    {"student": "alice", "course": "SQL 101",  "date": "2024-03-03"},
    {"student": "alice", "course": "SQL 101",  "date": "2024-03-06"},
    {"student": "alice", "course": "SQL 101",  "date": "2024-03-07"},
    {"student": "bob",   "course": "SQL 101",  "date": "2024-03-10"},
]

longest_streaks(logs)
# => {
#     ("alice", "SQL 101"): 3,
#     ("bob", "SQL 101"): 1,
# }
```

## Constraints
- Do NOT import anything (parse dates manually or use arithmetic)
- Dates are always valid `"YYYY-MM-DD"` strings
- Duplicate `(student, course, date)` entries may exist - ignore duplicates
