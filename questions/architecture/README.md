# Architecture Questions Author Guide

This guide explains how to create new Data Architecture questions for the Constraint Simulation feature.

## Question Format

Architecture questions use YAML frontmatter with a specific structure. Here's the template:

```yaml
---
title: "Your Question Title"
difficulty: "Easy" | "Medium" | "Hard"
tags: ["tag1", "tag2"]
prompt: |
  The scenario description that the user sees.
  This should be a vague request that requires clarification.

clarifying_questions:
  - id: q1
    text: "The question text users will see"
    category: crucial | helpful | irrelevant
    reveals:  # Optional - only for crucial/helpful questions
      constraint: constraint_name
      value: "constraint_value"

architecture_options:
  - id: option1
    name: "Architecture Name"
    description: "Brief description of this architecture"
    valid_when:
      - constraint: constraint_name
        value: "constraint_value"
    feedback_if_wrong: "Explanation of why this choice is wrong"

max_questions: 3  # Number of questions users must select
---

# Title

Optional additional context shown in the description panel.

## Guidance

Optional hints for users about what to consider.
```

## Question Categories

### Crucial Questions (+10 points)
Questions that reveal critical constraints affecting the architecture choice. These should:
- Reveal deal-breaking requirements (latency, compliance, scale)
- Be specific enough to eliminate or validate architectures
- Always include a `reveals` block with constraint/value

### Helpful Questions (+5 points)
Questions that provide useful context but aren't decisive. These should:
- Reveal secondary constraints (budget, team skills, preferences)
- Help refine the choice but not fundamentally change it
- Usually include a `reveals` block

### Irrelevant Questions (-5 points)
Questions that waste stakeholder time. These should:
- Ask about implementation details before requirements are known
- Focus on style/preference over substance
- Never include a `reveals` block

## Architecture Options

Each question should have 3-5 architecture options:
- At least one option that's correct when crucial constraints are revealed
- At least one "default" option that's wrong when constraints exist
- Include clear `feedback_if_wrong` explaining why the choice doesn't fit

### `valid_when` Conditions

An architecture is considered correct when:
1. All its `valid_when` conditions are met by revealed constraints, AND
2. It has at least one condition (or no constraints were revealed for empty conditions)

## Scoring System

- **Crucial questions**: +10 points each
- **Helpful questions**: +5 points each
- **Irrelevant questions**: -5 points each
- **Passing**: Positive score AND correct architecture

## Tips for Good Questions

1. **Make the scenario vague** - Force users to ask questions
2. **Create tension** - Some constraints should eliminate "obvious" choices
3. **Include red herrings** - Add irrelevant questions that sound technical
4. **Link questions to options** - Each crucial question should affect which architecture is valid
5. **Write helpful feedback** - Explain WHY choices are wrong, not just that they are

## Example Directory Structure

```
questions/architecture/
├── README.md
├── easy/
│   └── simple-etl-design.md
├── medium/
│   ├── data-warehouse-retail.md
│   └── streaming-pipeline.md
└── hard/
    └── multi-region-analytics.md
```

## Testing Your Question

1. Run `npm run build` to process the question
2. Navigate to `/architecture` and open your question
3. Verify:
   - All clarifying questions appear
   - Selecting crucial questions reveals constraints
   - The correct architecture is validated properly
   - Feedback makes sense for wrong choices
