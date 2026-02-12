---
title: "Reservoir Sampling from Event Stream"
difficulty: "Hard"
tags: ["python", "sampling", "streaming", "algorithm"]
function_name: reservoir_sample
test_cases:
  - call: "reservoir_sample(iter([42]))"
    expected: "42"
    label: "Single element stream"
  - call: "reservoir_sample(iter([]))"
    expected: "None"
    label: "Empty stream"
hidden_test_cases:
  - call: "reservoir_sample(iter(['only_one']))"
    expected: "'only_one'"
    label: "Single string element"
  - call: "reservoir_sample(iter([10, 20, 30, 40, 50]))"
    expected: "30"
    label: "Deterministic with default seed"
---

# Reservoir Sampling from Event Stream

The learning platform processes a continuous stream of student activity events. Select exactly **one random element** from a stream of unknown length, where each element has equal probability of being chosen.

You may only pass through the stream **once** and use **O(1) extra space**.

Write a function:

```python
def reservoir_sample(stream):
    # stream: an iterator (you can only loop through it once)
    # return: a single element chosen uniformly at random
```

You may implement a simple pseudo-random number generator. A linear congruential generator (LCG) is fine:

```python
_seed = 42
def rand_int(n):
    """Return a random integer in [0, n)."""
    global _seed
    _seed = (_seed * 1103515245 + 12345) & 0x7fffffff
    return _seed % n
```

## Algorithm

For the i-th element (1-indexed):
1. With probability `1/i`, replace the current selection with element i
2. Otherwise keep the current selection

After the full stream, the selected element is uniformly random.

## Examples

```
# With a fixed seed, results are deterministic:
reservoir_sample(iter([10, 20, 30, 40, 50]))
# => one of the elements (each with ~20% probability over many runs)

reservoir_sample(iter(["only_one"]))
# => "only_one"

reservoir_sample(iter([]))
# => None  (empty stream)
```

## Constraints
- Do NOT import anything (implement your own RNG if needed)
- Single pass through the stream - do not convert to list
- O(1) extra space (no storing all elements)
- Return `None` for an empty stream
