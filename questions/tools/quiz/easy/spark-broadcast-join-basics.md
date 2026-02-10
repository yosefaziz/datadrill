---
title: "Spark Broadcast Join Basics"
difficulty: "Easy"
tags: ["spark", "joins", "broadcast"]
question: "When should you use a broadcast join in Spark?"
multi_select: false
answers:
  - id: a
    text: "When one side of the join is small enough to fit in each executor's memory"
    correct: true
    explanation: "A broadcast join copies the smaller dataset to every executor, avoiding an expensive shuffle of the larger dataset. Spark's default threshold is 10MB (spark.sql.autoBroadcastJoinThreshold), but this can be tuned based on available memory."
  - id: b
    text: "When both sides of the join are large and need distributed processing"
    correct: false
    explanation: "When both sides are large, a sort-merge join or shuffle hash join is more appropriate. Broadcasting a large dataset would cause out-of-memory errors on executors."
  - id: c
    text: "When the join key has high data locality across the cluster"
    correct: false
    explanation: "Data locality is a separate concern related to where partitions are stored. Broadcast joins work regardless of data locality by shipping the small table to all executors."
  - id: d
    text: "When performing inner joins only, as broadcast does not support outer joins"
    correct: false
    explanation: "Broadcast joins support inner, left outer, left semi, and left anti joins (when the broadcast side is the right table). The join type is not the primary deciding factor."
explanation: "Broadcast joins are one of the most impactful optimizations in Spark. Interviewers frequently ask about join strategies, and knowing the trade-offs between broadcast and shuffle-based joins demonstrates practical performance tuning skills."
---

Join optimization is one of the most important performance considerations in Spark, and broadcast joins are the simplest way to eliminate shuffle overhead for asymmetric joins.
