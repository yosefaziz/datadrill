---
title: "Spark Query Plan Analysis"
difficulty: "Hard"
tags: ["spark", "query-plan", "joins"]
question: "You examine a Spark physical plan and see a BroadcastHashJoin followed by a SortMergeJoin in the same query. What does this indicate?"
multi_select: false
answers:
  - id: a
    text: "The query contains two joins - one with a small table using broadcast and one between two large tables using sort-merge"
    correct: true
    explanation: "A single query can use different join strategies for different joins. The Catalyst optimizer independently selects the optimal strategy for each join based on table sizes and statistics. A BroadcastHashJoin for a small dimension table followed by a SortMergeJoin for two large fact tables is a common pattern."
  - id: b
    text: "Spark attempted a broadcast join but fell back to sort-merge when the table was too large"
    correct: false
    explanation: "Spark does not show failed strategies in the physical plan. The optimizer decides the strategy during planning, not at runtime (except with AQE). Both operations in the plan are actively executing, not showing a fallback."
  - id: c
    text: "The query uses a two-phase join where data is first broadcast then sort-merged for correctness"
    correct: false
    explanation: "There is no two-phase join strategy in Spark. Each join operation in the plan is a separate, independent join between different pairs of datasets. The plan reflects multiple joins in the query, not phases of a single join."
  - id: d
    text: "This is a bug in the optimizer - a single query should use a consistent join strategy"
    correct: false
    explanation: "It is perfectly normal and optimal for different joins within the same query to use different strategies. The optimizer evaluates each join independently based on input sizes and selects the best strategy for each."
explanation: "Reading physical plans is an advanced skill that interviewers test for senior roles. Understanding that different joins in a query can use different strategies, and being able to explain why the optimizer chose each one, demonstrates the ability to diagnose performance issues from query plans in production."
---

Physical plan analysis is a critical debugging skill for production Spark applications and is commonly tested in senior data engineering interviews.
