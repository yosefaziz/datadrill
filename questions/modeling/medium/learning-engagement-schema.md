---
title: "Learning Engagement Star Schema"
difficulty: "Medium"
tags: ["star-schema", "engagement", "events"]
prompt: "You're building a data warehouse for an online learning platform. Design a star schema to analyze learner engagement - metrics like total watch time, session count, and average session length. The platform has millions of daily watch sessions."
constraint: "Star Schema for fast engagement analytics"

fields:
  - id: session_id
    name: session_id
    data_type: integer
    description: "Unique identifier for each watch session"
    cardinality: high
    sample_values: ["90001", "90002", "90003"]
  - id: watch_minutes
    name: watch_minutes
    data_type: decimal
    description: "Duration of the watch session in minutes"
    cardinality: high
    sample_values: ["12.5", "45.0", "3.2"]
  - id: completed
    name: completed
    data_type: boolean
    description: "Whether the learner finished the lesson in this session"
    cardinality: low
    sample_values: ["true", "false"]
  - id: session_date
    name: session_date
    data_type: date
    description: "Calendar date of the watch session"
    cardinality: high
    sample_values: ["2024-01-15", "2024-03-22"]
  - id: learner_id
    name: learner_id
    data_type: integer
    description: "Reference to the learner who watched"
    cardinality: medium
    sample_values: ["501", "502"]
  - id: learner_name
    name: learner_name
    data_type: string
    description: "Learner's display name"
    cardinality: medium
    sample_values: ["Alice Chen", "Bob Kumar"]
  - id: learner_country
    name: learner_country
    data_type: string
    description: "Learner's country of residence"
    cardinality: low
    sample_values: ["US", "IN", "DE"]
  - id: course_id
    name: course_id
    data_type: integer
    description: "Reference to the course being watched"
    cardinality: medium
    sample_values: ["101", "102"]
  - id: course_title
    name: course_title
    data_type: string
    description: "Title of the course"
    cardinality: medium
    sample_values: ["Intro to SQL", "Advanced Python"]
  - id: course_category
    name: course_category
    data_type: string
    description: "Category the course belongs to"
    cardinality: low
    sample_values: ["Data Engineering", "Web Development"]
  - id: instructor_name
    name: instructor_name
    data_type: string
    description: "Name of the course instructor"
    cardinality: low
    sample_values: ["Dr. Smith", "Prof. Lee"]
  - id: device_type
    name: device_type
    data_type: string
    description: "Device used for the session"
    cardinality: low
    sample_values: ["mobile", "desktop", "tablet"]

expected_tables:
  - type: fact
    name: Fact_Watch_Sessions
    required_fields: [session_id, watch_minutes, completed, learner_id, course_id, session_date]
    optional_fields: [device_type]
    feedback: "The fact table captures each watch event with its duration metric and foreign keys to dimensions. session_id is a degenerate dimension."
  - type: dimension
    name: Dim_Learners
    required_fields: [learner_id, learner_name, learner_country]
    optional_fields: []
    feedback: "Learner dimension stores descriptive attributes. Country enables geographic slicing of engagement."
  - type: dimension
    name: Dim_Courses
    required_fields: [course_id, course_title, course_category]
    optional_fields: [instructor_name]
    feedback: "Course dimension captures content metadata for analyzing engagement by category or instructor."

score_thresholds:
  storage:
    green: 30
    yellow: 60
  query_cost:
    green: 30
    yellow: 45
---

# Learning Engagement Schema

Design a star schema for analyzing learner engagement on an online learning platform.

Think about:
- Which fields are **measures** to aggregate (SUM, COUNT, AVG)?
- Which fields describe **who** watched and **what** they watched?
- What granularity should the fact table be at?

## Guidance

**Tip**: The fact table grain is one row per watch session. Measures like `watch_minutes` belong in the fact table since you'll SUM and AVG them. Descriptive attributes (names, categories, countries) go in dimensions where they can be filtered and grouped without bloating the fact table.

With millions of daily sessions, keeping the fact table narrow is critical for query performance.
