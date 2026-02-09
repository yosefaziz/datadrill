# Prompt Templates for Question Generation

## 1. SQL Question

```markdown
---
title: "{Short Title}"
difficulty: "{Easy|Medium|Hard}"
tags: ["{concept1}", "{concept2}"]
tables:
  - name: {table_name}
    visible_data: |
      col1,col2,col3
      val1,val2,val3
    hidden_datasets:
      - |
        col1,col2,col3
        val1,val2,val3
      - |
        col1,col2,col3
        val1,val2,val3
expected_output_query: "{SQL query that produces correct output}"
---

# {Title}

{2-4 sentence problem description with business context.}

## Expected Output
| col1 | col2 |
|------|------|
| val  | val  |
```

**Rules:**
- `expected_output_query` must run correctly against DuckDB
- Hidden datasets must have same schema as visible_data
- Include edge cases in hidden datasets (NULLs, ties, empty results)
- ORDER BY in expected_output_query if order matters

## 2. Python (PySpark) Question

```markdown
---
title: "{Short Title}"
difficulty: "{Easy|Medium|Hard}"
tags: ["{concept1}", "{concept2}", "pyspark"]
tables:
  - name: {dataframe_name}
    visible_data: |
      col1,col2,col3
      val1,val2,val3
    hidden_datasets:
      - |
        col1,col2,col3
        val1,val2,val3
      - |
        col1,col2,col3
        val1,val2,val3
expected_output_query: |
  result = {PySpark expression}
---

# {Title}

{Problem description. Must mention storing result in `result` variable.}

**Hint:** {One-line hint about which API to use.}

## Expected Output
| col1 | col2 |
|------|------|
| val  | val  |
```

**Rules:**
- Result must be stored in variable named `result`
- Use PySpark API (not pandas)
- `expected_output_query` must produce a DataFrame matching expected output
- Include `"pyspark"` in tags

## 3. Debug Question

```markdown
---
title: "{Short Title}"
difficulty: "{Easy|Medium|Hard}"
tags: ["{bug-type}", "debugging", "SQL"]
language: sql
tables:
  - name: {table_name}
    visible_data: |
      col1,col2
      val1,val2
    hidden_datasets:
      - |
        col1,col2
        val1,val2
      - |
        col1,col2
        val1,val2
broken_code: |
  {SQL with exactly one bug}
expected_output_query: |
  {Fixed SQL}
hint: "{One sentence pointing toward the bug without giving it away}"
---

# {Title}

{Description of what the query should do and what's going wrong.}

**The Bug:** {One sentence describing the category of bug.}

## Expected Output
| col1 | col2 |
|------|------|
| val  | val  |
```

**Rules:**
- Exactly ONE bug per question (don't stack multiple issues)
- `broken_code` must actually produce wrong results (not syntax error)
- `expected_output_query` is the fixed version
- Bug should be realistic (something that happens in production)

## 4. Architecture Quiz Question

```markdown
---
title: "{Short Title}"
difficulty: "{Easy|Medium|Hard}"
tags: ["{topic1}", "{topic2}"]
question: "{Clear question text}"
multi_select: {true|false}
answers:
  - id: a
    text: "{Answer text}"
    correct: {true|false}
    explanation: "{Why this is correct/incorrect}"
  - id: b
    text: "{Answer text}"
    correct: {true|false}
    explanation: "{Why}"
  - id: c
    text: "{Answer text}"
    correct: {true|false}
    explanation: "{Why}"
  - id: d
    text: "{Answer text}"
    correct: {true|false}
    explanation: "{Why}"
explanation: "{Overall explanation of the concept}"
---

{Optional additional context paragraph.}
```

**Rules:**
- 4 answer options (a-d)
- Each answer needs its own explanation
- Wrong answers should be plausible (not obviously wrong)
- Overall explanation should teach the concept

## 5. Architecture Constraints Question

```markdown
---
title: "{Short Title}"
difficulty: "{Medium|Hard}"
tags: ["{topic1}", "{topic2}"]
prompt: |
  {Scenario description with vague requirements}

clarifying_questions:
  - id: q1
    text: "{Good clarifying question}"
    category: crucial
    reveals:
      constraint: {constraint_name}
      value: "{revealed value}"
  - id: q2
    text: "{Irrelevant question}"
    category: irrelevant

architecture_options:
  - id: {option_id}
    name: "{Option Name}"
    description: "{What this architecture does}"
    valid_when:
      - constraint: {constraint_name}
        value: "{required value}"
    feedback_if_wrong: "{Why this was wrong given the constraints}"

max_questions: 3
---

# {Title}

{Guidance for the student.}
```

**Rules:**
- Mix of crucial, helpful, and irrelevant questions
- Architecture options should have clear valid_when conditions
- At least one option should be valid based on crucial constraints

## 6. Modeling Question

```markdown
---
title: "{Short Title}"
difficulty: "{Easy|Medium|Hard}"
tags: ["{pattern}", "{concept}"]
prompt: "{Scenario with data modeling challenge}"
constraint: "{Modeling pattern to apply}"

fields:
  - id: {field_id}
    name: {field_name}
    data_type: {integer|string|decimal|timestamp|boolean}
    description: "{What this field represents}"
    cardinality: {high|medium|low}
    sample_values: ["{val1}", "{val2}"]

expected_tables:
  - type: {fact|dimension}
    name: {Table_Name}
    required_fields: [{field_ids}]
    optional_fields: [{field_ids}]
    feedback: "{Why these fields belong here}"

score_thresholds:
  storage:
    green: {n}
    yellow: {n}
  query_cost:
    green: {n}
    yellow: {n}
---

# {Title}

{Guidance and tips for the student.}
```

**Rules:**
- 8-12 fields with varying cardinality
- expected_tables must cover all fields
- Score thresholds should reward the optimal design
- Include a mix of obvious and tricky field placements

## 7. Architecture Canvas Question

Use the same format as constraints but with a drawing/diagramming prompt. See `questions/architecture/canvas/` for examples.
