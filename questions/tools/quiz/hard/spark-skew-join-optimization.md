---
title: "Spark Skewed Join Optimization"
difficulty: "Hard"
tags: ["spark", "data-skew", "joins"]
question: "You are joining a 1TB user_events table with a 50GB users table. 30% of events have NULL user_id. The join is extremely slow. What is the best approach?"
multi_select: false
answers:
  - id: a
    text: "Filter out NULL user_ids before the join, process them separately, then union the results"
    correct: true
    explanation: "NULL keys will never match in an equi-join, so they create a massive skewed partition that does useless work. Filtering NULLs before the join eliminates the skew, and you can process the NULL events separately if needed. This is the most effective optimization because it removes 30% of data from the expensive shuffle entirely."
  - id: b
    text: "Enable AQE skew join optimization to automatically split the skewed partition"
    correct: false
    explanation: "AQE skew join optimization splits skewed partitions and replicates the other side. However, NULL keys will not match any row in the users table in an equi-join, so splitting and replicating is wasted work. Filtering NULLs beforehand is more efficient."
  - id: c
    text: "Broadcast the 50GB users table to avoid the shuffle entirely"
    correct: false
    explanation: "50GB far exceeds typical executor memory and the broadcast threshold. Attempting to broadcast a 50GB table would cause OutOfMemoryErrors on executors. Broadcast joins are only practical when the small side fits comfortably in memory."
  - id: d
    text: "Salt the NULL user_id keys to distribute them across multiple partitions"
    correct: false
    explanation: "Salting NULL keys would spread them across partitions, but since NULLs never match in an equi-join (NULL != NULL), the salted NULLs would still produce no matches. Salting adds shuffle overhead for zero benefit in this case."
explanation: "This question tests practical skew diagnosis beyond textbook solutions. The key insight is recognizing that NULL keys in equi-joins are dead weight - they consume resources but produce no matches. Interviewers value candidates who can identify the root cause rather than applying generic solutions like salting or AQE."
---

Real-world data skew often involves NULL or default values that concentrate on single partitions, and the optimal solution depends on understanding the join semantics rather than applying generic skew remedies.
