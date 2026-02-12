---
title: "Calculate Effective Study Time"
difficulty: "Medium"
tags: ["python", "dict", "intervals", "overlap"]
function_name: effective_study_time
test_cases:
  - call: |
      effective_study_time([
        {"student": "alice", "course": "Data 101", "start": 0,  "end": 45},
        {"student": "alice", "course": "Data 101", "start": 30, "end": 70},
        {"student": "alice", "course": "Web Dev",  "start": 0,  "end": 60},
        {"student": "bob",   "course": "Data 101", "start": 10, "end": 50},
      ])
    expected: |
      {("alice", "Data 101"): 70, ("alice", "Web Dev"): 60, ("bob", "Data 101"): 40}
    label: "Overlapping sessions"
hidden_test_cases:
  - call: "effective_study_time([])"
    expected: "{}"
    label: "Empty input"
  - call: |
      effective_study_time([
        {"student": "alice", "course": "SQL", "start": 0, "end": 10},
        {"student": "alice", "course": "SQL", "start": 20, "end": 30},
      ])
    expected: |
      {("alice", "SQL"): 20}
    label: "Non-overlapping sessions"
  - call: |
      effective_study_time([
        {"student": "alice", "course": "SQL", "start": 0, "end": 100},
        {"student": "alice", "course": "SQL", "start": 10, "end": 50},
        {"student": "alice", "course": "SQL", "start": 40, "end": 90},
      ])
    expected: |
      {("alice", "SQL"): 100}
    label: "Fully contained sessions"
---

# Calculate Effective Study Time

You receive a list of study session dicts from a learning platform:

```python
{"student": str, "course": str, "start": int, "end": int}
```

Return a dict mapping `(student, course)` to total **unique** seconds studied. Overlapping sessions for the same `(student, course)` must NOT be double-counted.

Write a function:

```python
def effective_study_time(sessions):
    # sessions: list of dicts with student, course, start, end
    # return: dict mapping (student, course) tuple -> int (total unique seconds)
```

## Examples

```
sessions = [
    {"student": "alice", "course": "Data 101",   "start": 0,   "end": 45},
    {"student": "alice", "course": "Data 101",   "start": 30,  "end": 70},
    {"student": "alice", "course": "Web Dev",    "start": 0,   "end": 60},
    {"student": "bob",   "course": "Data 101",   "start": 10,  "end": 50},
]

effective_study_time(sessions)
# => {
#     ("alice", "Data 101"): 70,
#     ("alice", "Web Dev"): 60,
#     ("bob", "Data 101"): 40,
# }
```

## Constraints
- Do NOT import anything
- Handle overlapping ranges per `(student, course)` group
- Times are non-negative integers
