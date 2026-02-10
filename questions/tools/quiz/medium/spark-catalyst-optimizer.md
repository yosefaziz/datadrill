---
title: "Spark Catalyst Optimizer"
difficulty: "Medium"
tags: ["spark", "catalyst", "query-optimization"]
question: "What does the Catalyst optimizer do during the logical optimization phase?"
multi_select: false
answers:
  - id: a
    text: "Applies rule-based optimizations like predicate pushdown and column pruning"
    correct: true
    explanation: "During logical optimization, Catalyst applies a set of rules to the logical plan. These include predicate pushdown (filtering data as early as possible), column pruning (removing unused columns), constant folding, and boolean expression simplification."
  - id: b
    text: "Generates optimized Java bytecode for execution"
    correct: false
    explanation: "Bytecode generation is performed by Project Tungsten's whole-stage code generation, which happens after physical planning. It is not part of Catalyst's logical optimization phase."
  - id: c
    text: "Selects physical operators like SortMergeJoin or BroadcastHashJoin"
    correct: false
    explanation: "Physical operator selection happens during physical planning, which comes after logical optimization. The logical phase works with abstract operations, not specific physical implementations."
  - id: d
    text: "Parses the SQL query and resolves table and column references"
    correct: false
    explanation: "Parsing and reference resolution happen during the analysis phase, which precedes logical optimization. By the time logical optimization runs, the plan already has resolved types and references."
explanation: "The Catalyst optimizer pipeline has four phases: analysis, logical optimization, physical planning, and code generation. Interviewers often test whether candidates understand which optimizations happen at which phase, as this knowledge helps with reading query plans and debugging performance issues."
---

Understanding the Catalyst optimizer's phases helps explain why DataFrame and SQL queries outperform hand-coded RDD transformations and is key to interpreting Spark query plans.
