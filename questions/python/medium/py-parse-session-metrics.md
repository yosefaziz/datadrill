---
title: "Extract Session Metrics from Event Log"
difficulty: "Medium"
tags: ["python", "dict", "nested", "events"]
function_name: session_metrics
test_cases:
  - call: |
      session_metrics({
        "student_id": "s42",
        "course": "Python 201",
        "events": [
          {"type": "start",  "ts": 1000},
          {"type": "break",  "ts": 1500},
          {"type": "resume", "ts": 1600},
          {"type": "end",    "ts": 2200},
        ]
      })
    expected: |
      {"student_id": "s42", "course": "Python 201", "total_study_seconds": 1100, "num_breaks": 1, "avg_segment_seconds": 550.0}
    label: "Session with one break"
  - call: |
      session_metrics({
        "student_id": "s7",
        "course": "SQL 101",
        "events": [
          {"type": "start", "ts": 0},
          {"type": "end",   "ts": 300},
        ]
      })
    expected: |
      {"student_id": "s7", "course": "SQL 101", "total_study_seconds": 300, "num_breaks": 0, "avg_segment_seconds": 300.0}
    label: "Session with no breaks"
hidden_test_cases:
  - call: |
      session_metrics({
        "student_id": "s1",
        "course": "Stats",
        "events": [
          {"type": "start",  "ts": 0},
          {"type": "break",  "ts": 100},
          {"type": "resume", "ts": 200},
          {"type": "break",  "ts": 400},
          {"type": "resume", "ts": 500},
          {"type": "end",    "ts": 700},
        ]
      })
    expected: |
      {"student_id": "s1", "course": "Stats", "total_study_seconds": 500, "num_breaks": 2, "avg_segment_seconds": 166.66666666666666}
    label: "Multiple breaks"
  - call: |
      session_metrics({
        "student_id": "s1",
        "course": "ML",
        "events": [
          {"type": "start", "ts": 100},
        ]
      })
    expected: |
      {"student_id": "s1", "course": "ML", "total_study_seconds": 0, "num_breaks": 0, "avg_segment_seconds": 0.0}
    label: "Open-ended session (no end)"
---

# Extract Session Metrics from Event Log

The learning platform tracks study sessions as nested dicts with an events timeline:

```python
session = {
    "student_id": "s42",
    "course": "Python 201",
    "events": [
        {"type": "start",  "ts": 1000},
        {"type": "break",  "ts": 1500},
        {"type": "resume", "ts": 1600},
        {"type": "end",    "ts": 2200},
    ]
}
```

Write a function that takes such a session dict and returns a summary:

```python
def session_metrics(session):
    # session: dict with student_id, course, events list
    # return: dict with student_id, course, total_study_seconds,
    #         num_breaks, avg_segment_seconds
```

## Examples

```
session_metrics({
    "student_id": "s42",
    "course": "Python 201",
    "events": [
        {"type": "start",  "ts": 1000},
        {"type": "break",  "ts": 1500},
        {"type": "resume", "ts": 1600},
        {"type": "end",    "ts": 2200},
    ]
})
# => {
#     "student_id": "s42",
#     "course": "Python 201",
#     "total_study_seconds": 1100,    # (1500-1000) + (2200-1600)
#     "num_breaks": 1,
#     "avg_segment_seconds": 550.0,   # 1100 / 2 segments
# }

session_metrics({
    "student_id": "s7",
    "course": "SQL 101",
    "events": [
        {"type": "start", "ts": 0},
        {"type": "end",   "ts": 300},
    ]
})
# => {
#     "student_id": "s7",
#     "course": "SQL 101",
#     "total_study_seconds": 300,
#     "num_breaks": 0,
#     "avg_segment_seconds": 300.0,
# }
```

## Constraints
- Do NOT import anything
- Events are always sorted by `"ts"`
- A `"start"` is always followed eventually by `"break"` or `"end"`
- A `"break"` is always followed by `"resume"`
- If the last event is `"start"` or `"resume"` (no end), ignore that open segment
