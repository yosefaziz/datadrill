---
title: "Data Warehouse Schema Design"
difficulty: "Medium"
tags: ["data-warehouse", "modeling", "schemas"]
question: "In a star schema data warehouse, which statements are TRUE? Select all that apply."
multi_select: true
answers:
  - id: a
    text: "Fact tables contain measurable, quantitative data (metrics)"
    correct: true
    explanation: "Fact tables store business metrics like sales amount, quantity, revenue that can be aggregated."
  - id: b
    text: "Dimension tables are highly normalized to 3NF"
    correct: false
    explanation: "In a star schema, dimension tables are typically denormalized for query simplicity. Snowflake schemas normalize dimensions."
  - id: c
    text: "Fact tables have foreign keys to dimension tables"
    correct: true
    explanation: "Fact tables reference dimensions via foreign keys, creating the 'star' pattern when visualized."
  - id: d
    text: "Dimension tables contain descriptive attributes for filtering and grouping"
    correct: true
    explanation: "Dimensions like Customer, Product, Time contain attributes (name, category, date) used in WHERE and GROUP BY."
  - id: e
    text: "Star schemas prioritize write performance over read performance"
    correct: false
    explanation: "Star schemas are optimized for read-heavy analytical queries, not transactional writes."
explanation: "Star schemas are the most common dimensional modeling approach for data warehouses. They optimize for query simplicity and read performance at the cost of some data redundancy."
---

Understanding star schema design is fundamental to building effective data warehouses.
