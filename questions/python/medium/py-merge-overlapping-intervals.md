---
title: "Merge Overlapping Study Windows"
difficulty: "Medium"
tags: ["python", "intervals", "sorting", "tuples"]
function_name: merge_windows
test_cases:
  - call: "merge_windows([(0, 45), (30, 75), (90, 120), (110, 150)])"
    expected: "[(0, 75), (90, 150)]"
    label: "Two groups of overlaps"
  - call: "merge_windows([(10, 20), (1, 5)])"
    expected: "[(1, 5), (10, 20)]"
    label: "Non-overlapping unsorted"
hidden_test_cases:
  - call: "merge_windows([])"
    expected: "[]"
    label: "Empty input"
  - call: "merge_windows([(0, 90), (15, 30), (50, 60)])"
    expected: "[(0, 90)]"
    label: "One window contains all others"
  - call: "merge_windows([(0, 10), (10, 20), (20, 30)])"
    expected: "[(0, 30)]"
    label: "Touching windows merge"
  - call: "merge_windows([(5, 10)])"
    expected: "[(5, 10)]"
    label: "Single window"
---

# Merge Overlapping Study Windows

A student's study tracker records time windows as `(start_minute, end_minute)` tuples relative to the start of the day. Some windows overlap or touch. Merge all overlapping windows and return the consolidated list.

Write a function:

```python
def merge_windows(windows):
    # windows: list of (start, end) tuples
    # return: list of merged (start, end) tuples, sorted by start
```

## Examples

```
merge_windows([(0, 45), (30, 75), (90, 120), (110, 150)])
# => [(0, 75), (90, 150)]

merge_windows([(10, 20), (1, 5)])
# => [(1, 5), (10, 20)]

merge_windows([(0, 90), (15, 30), (50, 60)])
# => [(0, 90)]

merge_windows([])
# => []
```

## Constraints
- Do NOT import anything
- Times are non-negative integers (minutes)
- Input list may be unsorted
- Touching windows (end == start of next) should be merged
