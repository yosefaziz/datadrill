---
title: "Multi-Region Analytics Platform"
difficulty: "Hard"
tags: ["multi-region", "analytics", "global", "compliance"]
prompt: |
  A multinational healthcare company wants to build a centralized analytics platform. They have operations in the US, EU, and Asia-Pacific, and mention they need "global visibility" into their data.

  Given the sensitive nature of healthcare data and global operations, what questions would you prioritize before designing the architecture?

clarifying_questions:
  - id: q1
    text: "What data residency requirements exist for each region?"
    category: crucial
    reveals:
      constraint: residency
      value: "EU data must stay in EU, APAC in APAC"
  - id: q2
    text: "Do you need to comply with HIPAA, GDPR, or other regulations?"
    category: crucial
    reveals:
      constraint: compliance
      value: "HIPAA and GDPR required"
  - id: q3
    text: "Can patient data be aggregated across regions, or must it stay separate?"
    category: crucial
    reveals:
      constraint: aggregation
      value: "only anonymized aggregates can cross borders"
  - id: q4
    text: "What is the acceptable latency for cross-region queries?"
    category: crucial
    reveals:
      constraint: query_latency
      value: "under 5 seconds acceptable"
  - id: q5
    text: "How will data be ingested from each region?"
    category: helpful
    reveals:
      constraint: ingestion
      value: "each region has local data sources"
  - id: q6
    text: "What analytics tools do your teams currently use?"
    category: helpful
    reveals:
      constraint: tools
      value: "mixed - Power BI in US, Tableau in EU"
  - id: q7
    text: "Do you have a preferred cloud provider?"
    category: helpful
    reveals:
      constraint: cloud
      value: "multi-cloud required for compliance"
  - id: q8
    text: "What time zone should dashboards default to?"
    category: irrelevant
  - id: q9
    text: "Should we use Python or Java for ETL scripts?"
    category: irrelevant
  - id: q10
    text: "What naming convention should tables follow?"
    category: irrelevant

architecture_options:
  - id: federated
    name: "Federated Data Architecture"
    description: "Regional data stays in place, queries are federated across regions. Maintains data residency while enabling global queries."
    valid_when:
      - constraint: residency
        value: "EU data must stay in EU, APAC in APAC"
      - constraint: compliance
        value: "HIPAA and GDPR required"
    feedback_if_wrong: "A federated architecture is ideal when data residency and compliance require data to stay in its region of origin. Without confirming these constraints, you might over-engineer the solution."
  - id: centralized
    name: "Centralized Global Data Lake"
    description: "All data flows to a single global repository. Simplest architecture but may violate data residency requirements."
    valid_when: []
    feedback_if_wrong: "A centralized data lake is the simplest approach, but healthcare data with multi-region presence almost always has residency and compliance requirements that prevent this."
  - id: hub-spoke
    name: "Hub and Spoke with Data Mesh"
    description: "Regional data products with a central catalog. Each region owns their data but shares metadata globally."
    valid_when:
      - constraint: residency
        value: "EU data must stay in EU, APAC in APAC"
      - constraint: aggregation
        value: "only anonymized aggregates can cross borders"
    feedback_if_wrong: "Hub and spoke with data mesh is powerful for data ownership, but you need to confirm whether regional autonomy and limited cross-border sharing are actual requirements."
  - id: replicated
    name: "Multi-Region Replication"
    description: "Full data replication across all regions for low-latency access everywhere. High cost and potential compliance issues."
    valid_when: []
    feedback_if_wrong: "Replicating healthcare data globally creates significant compliance risks. This pattern is rarely appropriate when dealing with sensitive regulated data across jurisdictions."

max_questions: 3
---

# Multi-Region Analytics Platform

Healthcare data in a global context introduces complex compliance and data sovereignty challenges. This hard scenario tests whether you ask about regulatory constraints before proposing technical solutions.

## Guidance

For multi-region healthcare architectures, prioritize:
- **Compliance**: HIPAA, GDPR, local regulations
- **Data residency**: Where can data physically reside?
- **Cross-border transfers**: What can cross regional boundaries?
- **Query patterns**: Do users need global or regional views?

A wrong architecture choice in this domain can lead to significant legal and financial consequences.
