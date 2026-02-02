---
title: "E-commerce Orders Star Schema"
difficulty: "Easy"
tags: ["star-schema", "e-commerce"]
prompt: "You're designing a data warehouse for an e-commerce company. Create a star schema optimized for analyzing order metrics like total revenue, order count, and average order value. The fact table will have billions of rows."
constraint: "Star Schema for fast aggregation queries"

fields:
  - id: order_id
    name: order_id
    data_type: integer
    description: "Unique identifier for each order"
    cardinality: high
    sample_values: ["1001", "1002", "1003"]
  - id: order_total
    name: order_total
    data_type: decimal
    description: "Total amount of the order in dollars"
    cardinality: high
    sample_values: ["49.99", "129.50", "15.00"]
  - id: order_date
    name: order_date
    data_type: timestamp
    description: "When the order was placed"
    cardinality: high
    sample_values: ["2024-01-15", "2024-01-16"]
  - id: user_id
    name: user_id
    data_type: integer
    description: "Reference to the user who placed the order"
    cardinality: medium
    sample_values: ["501", "502"]
  - id: user_email
    name: user_email
    data_type: string
    description: "User's email address"
    cardinality: medium
    sample_values: ["john@email.com", "jane@email.com"]
  - id: user_name
    name: user_name
    data_type: string
    description: "User's full name"
    cardinality: medium
    sample_values: ["John Doe", "Jane Smith"]
  - id: product_id
    name: product_id
    data_type: integer
    description: "Reference to the product ordered"
    cardinality: low
    sample_values: ["101", "102"]
  - id: product_name
    name: product_name
    data_type: string
    description: "Name of the product"
    cardinality: low
    sample_values: ["Wireless Mouse", "USB Cable"]
  - id: product_category
    name: product_category
    data_type: string
    description: "Product category"
    cardinality: low
    sample_values: ["Electronics", "Accessories"]
  - id: quantity
    name: quantity
    data_type: integer
    description: "Number of items ordered"
    cardinality: low
    sample_values: ["1", "2", "5"]

expected_tables:
  - type: fact
    name: Fact_Orders
    required_fields: [order_id, order_total, quantity, user_id, product_id]
    optional_fields: [order_date]
    feedback: "Good! The fact table should contain metrics (order_total, quantity) and foreign keys to dimensions."
  - type: dimension
    name: Dim_Users
    required_fields: [user_id, user_email, user_name]
    optional_fields: []
    feedback: "User dimension captures descriptive user attributes."
  - type: dimension
    name: Dim_Products
    required_fields: [product_id, product_name, product_category]
    optional_fields: []
    feedback: "Product dimension captures product descriptive data."

score_thresholds:
  storage:
    green: 50
    yellow: 80
  query_cost:
    green: 30
    yellow: 45
---

# E-commerce Orders

Design a star schema for analyzing e-commerce orders. Think about:
- Which fields are **metrics** that need to be in the fact table?
- Which fields are **descriptive attributes** that belong in dimensions?
- How do foreign keys connect facts to dimensions?

## Guidance

**Tip**: In a star schema, the fact table should be "lean" - containing only:
1. Numeric measures (things you SUM, COUNT, AVG)
2. Foreign keys to dimension tables
3. Degenerate dimensions (like order_id)

Descriptive text fields (names, emails, categories) should go in dimension tables where storage is cheap.
