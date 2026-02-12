---
title: "Most Frequently Co-Enrolled Course Pairs"
difficulty: "Medium"
tags: ["python", "dict", "tuple", "combinatorics"]
function_name: top_k_pairs
test_cases:
  - call: |
      top_k_pairs([
        ["SQL 101", "Python 201", "Stats 301"],
        ["SQL 101", "Python 201"],
        ["Stats 301", "ML 401"],
        ["SQL 101", "Python 201", "ML 401"],
      ], 2)
    expected: |
      [("Python 201", "SQL 101"), ("ML 401", "SQL 101")]
    label: "Basic top-k pairs"
hidden_test_cases:
  - call: "top_k_pairs([], 3)"
    expected: "[]"
    label: "Empty input"
  - call: |
      top_k_pairs([["A", "B"], ["A", "B"], ["A", "B"]], 1)
    expected: |
      [("A", "B")]
    label: "Single pair repeated"
  - call: |
      top_k_pairs([["A"], ["B"], ["C"]], 2)
    expected: "[]"
    label: "All single-course enrollments"
  - call: |
      top_k_pairs([["A", "B"], ["B", "C"], ["A", "C"]], 5)
    expected: |
      [("A", "B"), ("A", "C"), ("B", "C")]
    label: "k larger than total pairs"
---

# Most Frequently Co-Enrolled Course Pairs

Given a list of enrollment snapshots where each entry is a list of course names a student was enrolled in during a term, find the top K most frequently co-enrolled course pairs.

Write a function:

```python
def top_k_pairs(enrollments, k):
    # enrollments: list of lists of course name strings
    # k: int
    # return: list of (course_a, course_b) tuples, sorted by frequency desc,
    #         then alphabetically
```

## Examples

```
enrollments = [
    ["SQL 101", "Python 201", "Stats 301"],
    ["SQL 101", "Python 201"],
    ["Stats 301", "ML 401"],
    ["SQL 101", "Python 201", "ML 401"],
]
k = 2

top_k_pairs(enrollments, k)
# => [("Python 201", "SQL 101"), ("ML 401", "SQL 101")]
#
# ("Python 201", "SQL 101") appears 3 times
# ("ML 401", "Python 201"), ("ML 401", "SQL 101"), ("Python 201", "Stats 301"),
#   ("SQL 101", "Stats 301") each appear 1 time
# Tied pairs broken alphabetically: "ML 401" < "Python 201" < "SQL 101"
```

## Constraints
- Do NOT import anything
- Pairs are unordered: `("A", "B")` == `("B", "A")` - always store alphabetically
- An enrollment list can have 1 to many courses (pairs only exist if 2+ courses)
- Return pairs sorted by frequency descending, then alphabetically ascending
