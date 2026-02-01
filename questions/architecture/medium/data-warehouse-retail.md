---
title: "Design a Data Warehouse for Retail"
difficulty: "Medium"
tags: ["data-warehouse", "design", "retail"]
prompt: |
  A global retail chain with 500+ stores wants to build a data warehouse. They mention they want "analytics capabilities" and ask you to propose an architecture.

  Before jumping to a solution, what questions would you ask to understand their actual requirements?

clarifying_questions:
  - id: q1
    text: "What is the data freshness requirement? (real-time, hourly, daily)"
    category: crucial
    reveals:
      constraint: freshness
      value: "real-time"
  - id: q2
    text: "What is the expected data volume per day?"
    category: crucial
    reveals:
      constraint: volume
      value: "500GB/day"
  - id: q3
    text: "Do you need to support streaming data sources like IoT sensors?"
    category: crucial
    reveals:
      constraint: streaming
      value: "yes"
  - id: q4
    text: "What is the budget for the data platform?"
    category: helpful
    reveals:
      constraint: budget
      value: "flexible"
  - id: q5
    text: "Who are the primary users of the analytics?"
    category: helpful
    reveals:
      constraint: users
      value: "analysts and executives"
  - id: q6
    text: "What existing tools do your analysts use?"
    category: helpful
    reveals:
      constraint: tools
      value: "Tableau and Excel"
  - id: q7
    text: "What programming language should we use?"
    category: irrelevant
  - id: q8
    text: "What color scheme should the dashboards have?"
    category: irrelevant
  - id: q9
    text: "Do you have compliance requirements like GDPR?"
    category: helpful
    reveals:
      constraint: compliance
      value: "GDPR required"
  - id: q10
    text: "Would you prefer open-source or commercial solutions?"
    category: helpful
    reveals:
      constraint: preference
      value: "open-source preferred"

architecture_options:
  - id: lambda
    name: "Lambda Architecture"
    description: "Dual batch and speed layers for both historical and real-time processing. Higher complexity but handles both use cases."
    valid_when:
      - constraint: freshness
        value: "real-time"
      - constraint: streaming
        value: "yes"
    feedback_if_wrong: "Lambda architecture is designed for when you need both batch and real-time processing. Without confirming the streaming and freshness requirements, this choice is premature."
  - id: kappa
    name: "Kappa Architecture"
    description: "Stream-first unified architecture where everything is treated as a stream. Simpler than Lambda but requires stream processing expertise."
    valid_when:
      - constraint: freshness
        value: "real-time"
      - constraint: streaming
        value: "yes"
    feedback_if_wrong: "Kappa architecture requires real-time streaming capabilities. Without confirming these requirements, a simpler batch architecture might be more appropriate."
  - id: traditional
    name: "Traditional Data Warehouse (ETL + Star Schema)"
    description: "Classic batch-oriented warehouse with nightly ETL jobs. Simple and well-understood, but not suitable for real-time needs."
    valid_when: []
    feedback_if_wrong: "A traditional batch warehouse is a safe default, but you discovered requirements for real-time and streaming that this architecture doesn't handle well."
  - id: lakehouse
    name: "Data Lakehouse"
    description: "Combines data lake flexibility with warehouse features. Good for large volumes and diverse data types."
    valid_when:
      - constraint: volume
        value: "500GB/day"
    feedback_if_wrong: "A lakehouse is good for high volume scenarios, but without confirming volume requirements, you might be over-engineering the solution."

max_questions: 3
---

# Design a Data Warehouse for Retail

This scenario tests your ability to gather requirements before proposing an architecture. The retail chain has given you a vague request - your job is to ask the right questions.

## Guidance

Consider these categories when selecting questions:
- **Data characteristics**: Volume, velocity, variety
- **Use case requirements**: Who uses it, how fresh does data need to be
- **Technical constraints**: Existing tools, compliance needs
- **Avoid**: Questions about implementation details before understanding requirements
