---
title: "Data Partitioning Strategies"
difficulty: "Hard"
tags: ["partitioning", "distributed-systems", "databases"]
question: "A social media platform needs to partition user posts for horizontal scaling. Users can have 1 to 10 million posts. Which partitioning strategies would be effective? Select all that apply."
multi_select: true
answers:
  - id: a
    text: "Partition by user_id to keep all of a user's posts together"
    correct: false
    explanation: "With users having up to 10M posts, partitioning by user_id creates severe hot spots. Celebrity accounts would overwhelm single partitions."
  - id: b
    text: "Partition by post_id using consistent hashing"
    correct: true
    explanation: "Hashing post_id distributes data evenly regardless of how many posts a user has, avoiding hot spots."
  - id: c
    text: "Partition by (user_id, time_bucket) composite key"
    correct: true
    explanation: "Combining user_id with time bucketing spreads a user's posts across partitions while maintaining some locality for time-range queries."
  - id: d
    text: "Range partition by creation timestamp"
    correct: false
    explanation: "Range partitioning by time creates write hot spots on the latest partition and uneven historical data distribution."
  - id: e
    text: "Partition by post_id with secondary index on user_id"
    correct: true
    explanation: "Hash on post_id for even distribution, use secondary/global index for user-based lookups. Common pattern in distributed databases."
explanation: "Partitioning strategy must consider data distribution, access patterns, and hot spot prevention. When entity sizes vary dramatically (1 to 10M posts), simple entity-based partitioning fails."
---

Choosing the right partitioning strategy is critical for scalable distributed systems.
