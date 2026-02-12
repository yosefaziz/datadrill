---
title: "Deduplicate Activity Log by Composite Key"
difficulty: "Medium"
tags: ["python", "dict", "dedup", "ordering"]
function_name: dedup_events
test_cases:
  - call: |
      dedup_events([
        {"student_id": "s1", "event_type": "start", "ts": 100, "course": "SQL 101"},
        {"student_id": "s1", "event_type": "start", "ts": 200, "course": "Python 201"},
        {"student_id": "s2", "event_type": "start", "ts": 150, "course": "SQL 101"},
        {"student_id": "s1", "event_type": "submit", "ts": 300, "course": "Python 201"},
        {"student_id": "s2", "event_type": "start", "ts": 400, "course": "Stats 301"},
      ])
    expected: |
      [
        {"student_id": "s1", "event_type": "start", "ts": 200, "course": "Python 201"},
        {"student_id": "s1", "event_type": "submit", "ts": 300, "course": "Python 201"},
        {"student_id": "s2", "event_type": "start", "ts": 400, "course": "Stats 301"},
      ]
    label: "Basic dedup with multiple keys"
hidden_test_cases:
  - call: "dedup_events([])"
    expected: "[]"
    label: "Empty input"
  - call: |
      dedup_events([{"student_id": "a", "event_type": "x", "val": 1}])
    expected: |
      [{"student_id": "a", "event_type": "x", "val": 1}]
    label: "Single element"
  - call: |
      dedup_events([
        {"student_id": "s1", "event_type": "click", "ts": 10},
        {"student_id": "s1", "event_type": "click", "ts": 20},
        {"student_id": "s1", "event_type": "click", "ts": 30},
      ])
    expected: |
      [{"student_id": "s1", "event_type": "click", "ts": 30}]
    label: "All same key"
---

# Deduplicate Activity Log by Composite Key

You receive a stream of activity event dicts that may contain duplicates. Keep only the **last occurrence** of each event based on the composite key `(student_id, event_type)`. Preserve the order of last occurrence.

Write a function:

```python
def dedup_events(events):
    # events: list of dicts with at least student_id and event_type keys
    # return: list of dicts, deduplicated by (student_id, event_type),
    #         keeping the last occurrence, preserving insertion order of last seen
```

## Examples

```
events = [
    {"student_id": "s1", "event_type": "start",  "ts": 100, "course": "SQL 101"},
    {"student_id": "s1", "event_type": "start",  "ts": 200, "course": "Python 201"},
    {"student_id": "s2", "event_type": "start",  "ts": 150, "course": "SQL 101"},
    {"student_id": "s1", "event_type": "submit", "ts": 300, "course": "Python 201"},
    {"student_id": "s2", "event_type": "start",  "ts": 400, "course": "Stats 301"},
]

dedup_events(events)
# => [
#     {"student_id": "s1", "event_type": "start",  "ts": 200, "course": "Python 201"},
#     {"student_id": "s1", "event_type": "submit", "ts": 300, "course": "Python 201"},
#     {"student_id": "s2", "event_type": "start",  "ts": 400, "course": "Stats 301"},
# ]
```

## Constraints
- Do NOT import anything
- Preserve insertion order of the **last** seen key
- Dicts may have additional keys beyond `student_id` and `event_type`
