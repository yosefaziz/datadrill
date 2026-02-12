---
title: "Count Events by Type"
difficulty: "Easy"
interview_relevant: false
tags: ["pyspark", "groupBy", "count", "basics"]
tables:
  - name: events
    visible_data: |
      id,user_id,event_type
      1,1,click
      2,1,view
      3,2,click
      4,2,click
      5,3,view
      6,3,purchase
      7,1,purchase
    hidden_datasets:
      - |
        id,user_id,event_type
        1,10,click
        2,10,click
        3,11,view
      - |
        id,user_id,event_type
        1,20,view
        2,20,view
        3,21,click
        4,22,purchase
        5,22,purchase
        6,23,view
expected_output_query: |
  result = events.groupBy("event_type").count()
---

# Count Events by Type

Count the number of events for each event type in the `events` DataFrame.

Use `.groupBy()` followed by `.count()`.

Your result should be stored in a variable called `result`.


## Expected Output
event_type,count
click,3
view,2
purchase,2
