---
title: "Spark coalesce() vs repartition()"
difficulty: "Medium"
tags: ["spark", "partitioning", "performance"]
question: "You have a DataFrame with 200 partitions after a wide transformation and need to write exactly 10 output files. What is the most efficient approach?"
multi_select: false
answers:
  - id: a
    text: "coalesce(10) to reduce partitions without a full shuffle"
    correct: true
    explanation: "coalesce() reduces the number of partitions by combining existing partitions on the same executor without a full shuffle. It moves the minimum amount of data necessary, making it much more efficient than repartition() when reducing partition count."
  - id: b
    text: "repartition(10) to evenly distribute data across partitions"
    correct: false
    explanation: "While repartition(10) would work, it triggers a full shuffle of all data across the network. Since you only need to reduce partitions, coalesce(10) achieves the same result with much less data movement."
  - id: c
    text: "coalesce(10, shuffle=true) for balanced output files"
    correct: false
    explanation: "There is no shuffle parameter on coalesce() in the DataFrame API. If you need a shuffle (e.g., for balanced partitions), use repartition() instead."
  - id: d
    text: "Set maxRecordsPerFile option to control output file count"
    correct: false
    explanation: "maxRecordsPerFile controls the maximum number of records per file, which can increase file count but does not guarantee exactly 10 output files. It splits large partitions but does not merge small ones."
explanation: "The coalesce() vs repartition() distinction is one of the most commonly asked Spark interview questions. The key insight is that coalesce() avoids a full shuffle when reducing partitions, while repartition() always shuffles. However, coalesce() can lead to uneven partitions if the original data was skewed."
---

Choosing between coalesce() and repartition() has significant performance implications and is a practical optimization that interviewers expect experienced Spark developers to know.
