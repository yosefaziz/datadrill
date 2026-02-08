# New Question Types for DataDrill

## Context

DataDrill currently has 7 question types covering mostly **Apply** (write code from scratch) and **Evaluate** (architecture selection) on Bloom's Taxonomy. This leaves major gaps at the **Remember**, **Understand**, **Analyze**, and **Create** levels. LeetCode and similar platforms live almost entirely at the Apply level — write code, pass tests. DataDrill can differentiate by covering the full cognitive spectrum with scientifically-backed interaction patterns.

The goal: design 10 new question types that fill Bloom's gaps, leverage learning science (retrieval practice, worked examples + fading, elaborative interrogation, transfer, cognitive load theory, deliberate practice), and create interactions no other platform offers.

All types use the existing markdown → YAML frontmatter → JSON pipeline, run entirely in-browser, and are human-authorable.

---

## New Question Type 1: **Predict** (Output Prediction)

**One-liner:** Given a query/code and schema, predict what the output will be.

**Skill:** SQL, Python | **Bloom's Level:** Understand | **Complexity:** Low

**Learning Science:** Retrieval practice (cued recall), elaborative interrogation (forces mental execution), cognitive load theory (focused task — no code writing overhead)

**Why it's better:** No platform asks you to *trace* data code mentally. This builds the mental model that makes writing code easier. Research shows output prediction is a stepping stone to code generation (Worked Examples progression: Stage 2).

**User Interaction:**
1. User sees a query/code + visible schema + sample data (read-only Monaco editor)
2. User fills in an editable table grid with predicted output (column headers pre-filled or user-fills them)
3. Submit → system runs the actual query in DuckDB/Pyodide, compares output row-by-row
4. Feedback: cell-by-cell highlighting (green = correct, red = wrong with actual value shown)

**YAML Frontmatter:**
```yaml
---
title: "Predict the Window Function Output"
difficulty: "Medium"
skill: "sql"
questionType: "predict"
tags: ["window-functions", "ROW_NUMBER"]
code: |
  SELECT name, department, salary,
         ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank
  FROM employees
tables:
  - name: employees
    visible_data: |
      name,department,salary
      Alice,Engineering,95000
      Bob,Engineering,85000
      Carol,Marketing,75000
      Dave,Marketing,90000
expected_columns: ["name", "department", "salary", "rank"]
---
Examine the SQL query above and predict what the output will be. Fill in all rows of the result table.
```

**Validation:** Run `code` against `visible_data` in DuckDB. Compare user's predicted table with actual result. Scoring: percentage of cells correct. Pass threshold: 100% (exact match).

---

## New Question Type 2: **Parsons** (Code Assembly)

**One-liner:** Arrange scrambled code lines and fill in blanks to form a correct solution.

**Skill:** SQL, Python | **Bloom's Level:** Understand → Apply | **Complexity:** Medium

**Learning Science:** Faded Parsons Problems (Weinman et al., CHI 2021) — significantly outperformed traditional code writing in a 237-student study. Reduces cognitive load while maintaining active generation. The "generation effect" (filling blanks) + ordering requires understanding code structure.

**Why it's better:** No data engineering platform has this. It bridges the gap between "read a solution" and "write from scratch." Ideal for learning new patterns (window functions, CTEs, complex joins).

**User Interaction:**
1. User sees question description + schema on the left
2. Right panel: scrambled code lines (drag to reorder) + some lines have `____` blanks to fill
3. Distractor lines (plausible but wrong) are included to increase difficulty
4. User drags to order, types in blanks
5. Submit → validates order + blank content

**YAML Frontmatter:**
```yaml
---
title: "Assemble the Running Total Query"
difficulty: "Easy"
skill: "sql"
questionType: "parsons"
tags: ["window-functions", "SUM", "running-total"]
tables:
  - name: transactions
    visible_data: |
      id,account_id,amount,txn_date
      1,A001,100,2024-01-01
      2,A001,250,2024-01-03
      3,A002,500,2024-01-02
lines:
  - id: l1
    code: "SELECT account_id, txn_date, amount,"
    order: 1
    blank: null
  - id: l2
    code: "  SUM(amount) OVER (PARTITION BY ____ ORDER BY txn_date) as running_total"
    order: 2
    blank:
      answer: "account_id"
      hint: "What column groups the running total?"
  - id: l3
    code: "FROM transactions"
    order: 3
    blank: null
  - id: l4
    code: "ORDER BY account_id, ____"
    order: 4
    blank:
      answer: "txn_date"
      hint: "What column determines the order within each account?"
distractors:
  - id: d1
    code: "GROUP BY account_id"
  - id: d2
    code: "HAVING SUM(amount) > 0"
expected_output_query: |
  SELECT account_id, txn_date, amount,
    SUM(amount) OVER (PARTITION BY account_id ORDER BY txn_date) as running_total
  FROM transactions
  ORDER BY account_id, txn_date
---
Write a query that calculates a running total of transaction amounts per account, ordered by date.

Arrange the code lines in the correct order and fill in the blanks.
```

**Validation:** Check (1) line order matches `order` fields (ignoring distractors), (2) blanks match `answer` fields (case-insensitive, whitespace-trimmed), (3) distractor lines are excluded. Scoring: partial credit — correct order + correct blanks = 100%, wrong order OR wrong blanks = proportional.

---

## New Question Type 3: **Reverse** (Reverse Engineering)

**One-liner:** Given an input table and desired output, write the query that produces the transformation.

**Skill:** SQL, Python | **Bloom's Level:** Analyze | **Complexity:** Low

**Learning Science:** Transfer of learning (abstract the transformation pattern), retrieval practice (free recall), deliberate practice (targets pattern recognition). This is the *inverse* of Predict — together they form a bidirectional understanding.

**Why it's better:** Real data engineering is often "I have this data and need it to look like that." This mirrors the actual job better than abstract prompts. No platform frames problems this way for data engineering.

**User Interaction:**
1. Left panel: Input table(s) displayed as formatted data grid + Output table displayed below
2. Right panel: Monaco editor (write the query/code)
3. Run → see your actual output beside expected output (side-by-side diff)
4. Submit → validates against hidden datasets (same as current SQL/Python flow)

**YAML Frontmatter:**
```yaml
---
title: "Reverse Engineer the Pivot"
difficulty: "Medium"
skill: "sql"
questionType: "reverse"
tags: ["pivot", "aggregation", "CASE-WHEN"]
tables:
  - name: sales
    visible_data: |
      product,quarter,revenue
      Widget,Q1,1000
      Widget,Q2,1500
      Gadget,Q1,2000
      Gadget,Q2,2500
    hidden_datasets:
      - |
        product,quarter,revenue
        Alpha,Q1,300
        Alpha,Q2,700
        Beta,Q1,500
        Beta,Q2,900
expected_output: |
  product,Q1,Q2
  Widget,1000,1500
  Gadget,2000,2500
expected_output_query: |
  SELECT product,
         SUM(CASE WHEN quarter = 'Q1' THEN revenue END) as Q1,
         SUM(CASE WHEN quarter = 'Q2' THEN revenue END) as Q2
  FROM sales
  GROUP BY product
---
Look at the input and output tables. Write a SQL query that transforms the input into the desired output.
```

**Validation:** Run user's query against visible_data and hidden_datasets. Compare output with expected. Same ResultValidator logic as existing SQL questions. Pass: all datasets match.

---

## New Question Type 4: **Optimize** (Query Optimization)

**One-liner:** Given a working but slow query, rewrite it for better performance while preserving results.

**Skill:** SQL, Python | **Bloom's Level:** Evaluate | **Complexity:** Medium

**Learning Science:** Deliberate practice (process feedback on *how* not just *what*), elaborative interrogation (forces "why is this slow?"), transfer (optimization patterns apply across engines).

**Why it's better:** LeetCode only cares if your code passes. Real senior/staff interviews test optimization reasoning. This question type validates both correctness AND evaluates the approach used (checks for anti-patterns).

**User Interaction:**
1. Left: Scenario description + slow query shown (read-only) + table sizes/stats
2. Right: Monaco editor pre-filled with the slow query (editable)
3. Run → shows results + execution note (e.g., "Your query scans 3 tables")
4. Submit → validates (a) same output as reference, (b) checks for anti-pattern elimination

**YAML Frontmatter:**
```yaml
---
title: "Eliminate the Correlated Subquery"
difficulty: "Medium"
skill: "sql"
questionType: "optimize"
tags: ["optimization", "correlated-subquery", "window-functions"]
tables:
  - name: employees
    visible_data: |
      id,name,department,salary
      1,Alice,Eng,95000
      2,Bob,Eng,85000
      3,Carol,Mkt,75000
      4,Dave,Mkt,90000
    hidden_datasets:
      - |
        id,name,department,salary
        1,X,A,100
        2,Y,A,200
        3,Z,B,150
slow_query: |
  SELECT e.name, e.department, e.salary
  FROM employees e
  WHERE e.salary = (
    SELECT MAX(salary) FROM employees e2 WHERE e2.department = e.department
  )
expected_output_query: |
  SELECT name, department, salary
  FROM (
    SELECT name, department, salary,
           RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rk
    FROM employees
  ) ranked
  WHERE rk = 1
anti_patterns:
  - pattern: "SELECT.*FROM.*WHERE.*\\(\\s*SELECT"
    message: "Still using a correlated subquery — try using a window function instead"
optimization_hints:
  - "Consider: what SQL feature lets you rank rows within groups?"
  - "Window functions like RANK() or ROW_NUMBER() avoid rescanning the table per row"
---
The query below returns the highest-paid employee in each department, but it uses a correlated subquery that rescans the table for every row. Rewrite it to be more efficient while returning the same results.

## Table Stats
- `employees`: 500,000 rows in production
```

**Validation:** (1) Run user query against all datasets, compare output to `expected_output_query` output — must match. (2) Check user's code against each `anti_patterns` regex — if any match, flag with the message (partial credit). Pass: correct output AND no anti-pattern matches.

---

## New Question Type 5: **Tradeoff** (Engineering Judgment)

**One-liner:** Given a scenario with competing constraints, choose AND justify the right engineering trade-off.

**Skill:** Architecture (new subtype) | **Bloom's Level:** Evaluate | **Complexity:** Medium

**Learning Science:** Elaborative interrogation (must explain "why"), deliberate practice (targets engineering judgment — the #1 skill senior/staff interviews test), transfer (trade-off reasoning applies across all domains).

**Why it's better:** No platform tests trade-off *reasoning*. Architecture Constraints tests "can you gather info and pick right," but not "can you articulate why option A beats option B given these specific constraints." This is what separates senior from staff engineers.

**User Interaction:**
1. User reads scenario with specific constraints (latency, cost, team size, data volume, etc.)
2. Multiple design options presented as cards with pros/cons
3. User selects their preferred option
4. User must then select 2-3 justification reasons from a list (some valid, some traps)
5. Submit → scored on option choice + justification quality

**YAML Frontmatter:**
```yaml
---
title: "Batch vs Stream for Fraud Detection"
difficulty: "Hard"
skill: "architecture"
questionType: "tradeoff"
tags: ["streaming", "batch", "fraud", "trade-offs"]
prompt: |
  Your fintech company processes 2M transactions/day. The fraud team currently runs batch detection overnight,
  catching fraud ~18 hours after it occurs. The CTO wants to reduce detection time to under 5 minutes.

  Constraints:
  - Team: 3 data engineers (no streaming experience)
  - Budget: $5,000/month cloud spend
  - Current stack: Airflow + Snowflake + dbt
  - Requirement: Must detect fraud within 5 minutes

options:
  - id: full_stream
    name: "Full Streaming Pipeline"
    description: "Replace batch pipeline with Kafka + Flink for real-time processing"
    correct: false
    feedback: "While this achieves the latency goal, the team has no streaming experience. A full migration is high risk with a 3-person team."
  - id: hybrid
    name: "Hybrid: Micro-batch + Stream"
    description: "Keep batch pipeline for reporting. Add a lightweight stream (Kafka + simple consumer) for real-time fraud rules only."
    correct: true
    feedback: "This is the pragmatic choice. It meets the latency SLA for fraud while preserving the working batch pipeline. The streaming scope is minimal enough for the team size."
  - id: cdc_approach
    name: "CDC-based Near Real-Time"
    description: "Use Debezium CDC to stream database changes, process with Spark Structured Streaming in 1-min micro-batches"
    correct: false
    feedback: "Spark Structured Streaming can achieve 1-minute latency, but CDC adds operational complexity and Spark streaming still has a learning curve."

justifications:
  - id: j1
    text: "The team's lack of streaming experience makes a full migration risky"
    valid_for: ["hybrid"]
    points: 5
  - id: j2
    text: "Keeping the batch pipeline avoids disrupting working analytics"
    valid_for: ["hybrid"]
    points: 5
  - id: j3
    text: "Streaming is always better than batch for any use case"
    valid_for: []
    points: -5
  - id: j4
    text: "The budget constraint eliminates managed streaming services"
    valid_for: []
    points: -3
  - id: j5
    text: "A minimal streaming scope reduces the blast radius of the change"
    valid_for: ["hybrid"]
    points: 5
  - id: j6
    text: "5-minute SLA doesn't require sub-second streaming — micro-batch could work too"
    valid_for: ["hybrid", "cdc_approach"]
    points: 3

max_justifications: 3
---
```

**Validation:** Score = option correctness (20 pts if correct) + sum of justification points (valid_for must include the chosen option, otherwise 0 pts). Show feedback for chosen option + each justification. Pass: chose correct option + net positive justification score.

---

## New Question Type 6: **Incident** (Production Incident Simulation)

**One-liner:** Diagnose and resolve a simulated production data incident through a multi-step investigation.

**Skill:** Debug (new subtype) | **Bloom's Level:** Analyze → Evaluate | **Complexity:** High

**Learning Science:** Deliberate practice (targets diagnostic reasoning under pressure), cognitive load theory (progressive disclosure — reveal clues step by step), elaborative interrogation (each step asks "what does this tell you?"). Simulates real on-call scenarios.

**Why it's better:** No platform simulates production incidents for data engineers. This is what actually happens at work — dashboards show wrong numbers, you investigate. It tests the full diagnostic loop: observe → hypothesize → investigate → fix.

**User Interaction:**
1. Alert panel shows: "Revenue dashboard showing $0 for the last 3 hours"
2. User selects investigation steps from available actions (each reveals a clue)
3. After investigating, user selects root cause from options
4. Then selects the appropriate fix from options
5. Scored on: investigation efficiency (fewer steps = better) + correct diagnosis + correct fix

**YAML Frontmatter:**
```yaml
---
title: "The Missing Revenue"
difficulty: "Medium"
skill: "debug"
questionType: "incident"
tags: ["production", "incident-response", "data-quality"]
alert: |
  🚨 ALERT: Revenue dashboard showing $0 for all regions since 06:00 UTC.
  Stakeholders are asking questions. The daily ETL job shows as "succeeded" in Airflow.

investigation_steps:
  - id: check_airflow
    action: "Check Airflow task logs for the revenue ETL"
    clue: "All tasks show SUCCESS. Runtime: 45 seconds (usually ~12 minutes)."
    category: "essential"
    order_hint: 1
  - id: check_row_counts
    action: "Query row counts in the revenue staging table"
    clue: "SELECT COUNT(*) FROM stg_revenue WHERE load_date = CURRENT_DATE → 0 rows"
    category: "essential"
    order_hint: 2
  - id: check_source
    action: "Check the source API endpoint status"
    clue: "API returns 200 OK but response body is: {\"data\": [], \"message\": \"maintenance window active\"}"
    category: "essential"
    order_hint: 3
  - id: check_schema
    action: "Compare staging table schema with yesterday"
    clue: "Schema unchanged. No DDL changes detected."
    category: "irrelevant"
  - id: check_permissions
    action: "Verify database permissions for the ETL service account"
    clue: "All permissions intact. Last modified: 30 days ago."
    category: "irrelevant"
  - id: check_downstream
    action: "Check if downstream dbt models ran"
    clue: "dbt models ran successfully but produced $0 aggregates (garbage in, garbage out)."
    category: "helpful"

root_causes:
  - id: api_maintenance
    text: "Source API returned empty data during a maintenance window, and the ETL pipeline has no empty-result validation"
    correct: true
    feedback: "Correct! The API returned 200 OK with empty data. The ETL treated this as valid (no rows to load) and succeeded. This is a classic 'silent failure' — the pipeline needs data quality checks."
  - id: schema_change
    text: "A schema change in the source system broke the ETL"
    correct: false
    feedback: "Schema investigation showed no changes. The issue is in the data content, not structure."
  - id: permissions
    text: "Database permissions were revoked for the ETL account"
    correct: false
    feedback: "Permissions were verified as intact. If permissions were the issue, the ETL would have failed, not succeeded with 0 rows."

fixes:
  - id: add_validation
    text: "Add a minimum row count check to the ETL — fail the job if source returns fewer rows than expected"
    correct: true
    points: 10
  - id: add_alerting
    text: "Add anomaly detection on dashboard metrics to catch sudden drops"
    correct: true
    points: 5
  - id: retry_job
    text: "Just re-run the ETL job manually"
    correct: false
    points: -5
    feedback: "Re-running doesn't fix the root cause and will fail again if the maintenance window is still active"
  - id: add_circuit_breaker
    text: "Add a circuit breaker that falls back to yesterday's data when source is unavailable"
    correct: true
    points: 5

max_investigation_steps: 4
max_fixes: 2
---
```

**Validation:** Investigation efficiency: `essential` steps found / total steps taken (fewer non-essential = better). Root cause: correct/incorrect (binary). Fixes: sum of points for selected fixes. Pass: correct root cause + positive fix score.

---

## New Question Type 7: **Evolve** (Schema Evolution)

**One-liner:** Given an existing schema and new business requirements, design the migration without breaking downstream consumers.

**Skill:** Modeling (new subtype) | **Bloom's Level:** Create | **Complexity:** High

**Learning Science:** Transfer (applies modeling knowledge to a change management context), deliberate practice (schema evolution is a real senior/staff skill rarely practiced), elaborative interrogation (must reason about backward compatibility).

**Why it's better:** Every platform teaches schema *design*. None teach schema *evolution* — which is what you actually do 95% of the time at work. Adding a column is easy; doing it without breaking 15 downstream dashboards is the real skill.

**User Interaction:**
1. User sees current schema (ER diagram or table listing) + list of downstream consumers
2. New requirement is presented (e.g., "add multi-currency support")
3. User selects migration actions from a menu: add column, rename column, split table, add table, deprecate column, change type, add constraint
4. For each action, user specifies details (column name, type, default value, backfill strategy)
5. System evaluates: does the migration break any downstream consumer? Is the migration safe to run on a live system?

**YAML Frontmatter:**
```yaml
---
title: "Adding Multi-Currency Support"
difficulty: "Hard"
skill: "modeling"
questionType: "evolve"
tags: ["schema-evolution", "backward-compatibility", "migration"]
prompt: |
  Your orders table currently stores all amounts in USD. The business is expanding to Europe
  and needs multi-currency support. Design the schema changes without breaking existing reports.

current_schema:
  tables:
    - name: fact_orders
      columns:
        - name: order_id
          type: INTEGER
        - name: amount
          type: DECIMAL(10,2)
        - name: customer_id
          type: INTEGER
        - name: order_date
          type: DATE
    - name: dim_customers
      columns:
        - name: customer_id
          type: INTEGER
        - name: name
          type: VARCHAR
        - name: country
          type: VARCHAR

downstream_consumers:
  - name: "Daily Revenue Dashboard"
    query_pattern: "SUM(amount) FROM fact_orders"
    tolerance: "Can handle new columns but breaks if 'amount' is removed or renamed"
  - name: "Customer LTV Model"
    query_pattern: "SUM(amount) per customer_id"
    tolerance: "Reads amount column directly — breaks on rename or type change"
  - name: "Finance Export (CSV)"
    query_pattern: "SELECT * FROM fact_orders"
    tolerance: "New columns OK, column removal or rename breaks export"

available_actions:
  - id: add_col
    type: "add_column"
    label: "Add column"
    params: ["table", "column_name", "column_type", "default_value"]
  - id: rename_col
    type: "rename_column"
    label: "Rename column"
    params: ["table", "old_name", "new_name"]
  - id: add_table
    type: "add_table"
    label: "Add new table"
    params: ["table_name", "columns"]
  - id: backfill
    type: "backfill"
    label: "Backfill data"
    params: ["table", "column", "strategy"]
  - id: deprecate
    type: "deprecate_column"
    label: "Deprecate column (keep but mark unused)"
    params: ["table", "column"]

expected_actions:
  - type: "add_column"
    table: "fact_orders"
    column_name: "currency_code"
    column_type: "VARCHAR(3)"
    default_value: "USD"
    points: 10
    feedback: "Adding a currency column with 'USD' default preserves backward compatibility"
  - type: "add_column"
    table: "fact_orders"
    column_name: "amount_usd"
    column_type: "DECIMAL(10,2)"
    default_value: null
    points: 10
    feedback: "A normalized USD amount ensures dashboards that sum 'amount' can transition to 'amount_usd'"
  - type: "backfill"
    table: "fact_orders"
    column: "amount_usd"
    strategy: "copy_from_amount"
    points: 5
    feedback: "Backfilling amount_usd = amount for existing rows ensures historical data works"
  - type: "add_table"
    table_name: "dim_currency"
    points: 5
    feedback: "A currency dimension with exchange rates enables conversion logic"

breaking_changes:
  - action_type: "rename_column"
    table: "fact_orders"
    column: "amount"
    breaks: ["Daily Revenue Dashboard", "Customer LTV Model", "Finance Export (CSV)"]
    feedback: "Renaming 'amount' breaks all 3 downstream consumers! Add a new column instead."
  - action_type: "deprecate_column"
    table: "fact_orders"
    column: "amount"
    breaks: []
    feedback: "Deprecating is safe — existing queries still work, but teams are notified to migrate."
---
```

**Validation:** Match user's actions against `expected_actions` (sum points for matches). Check `breaking_changes` — if any user action would break a consumer, deduct points and show which consumers break. Pass: positive score AND no unmitigated breaking changes.

---

## New Question Type 8: **Review** (Code Review)

**One-liner:** Review a data pipeline code snippet, identify bugs/issues, and suggest fixes.

**Skill:** Debug (new subtype) | **Bloom's Level:** Analyze → Evaluate | **Complexity:** Medium

**Learning Science:** Elaborative interrogation (forces "why is this wrong?"), deliberate practice (code review is a daily senior skill), retrieval practice (must recall best practices and anti-patterns without writing code).

**Why it's better:** No platform practices *code review* for data engineering. This is different from Debug (where you fix code) — here you identify issues without necessarily rewriting. It tests breadth of knowledge (security, performance, correctness, style) rather than depth in one area.

**User Interaction:**
1. User sees a code snippet (read-only Monaco editor) described as a "PR from a teammate"
2. Below: list of potential issues as checkboxes, each with a severity option (bug/warning/nit)
3. User selects which issues are real and classifies their severity
4. Some issues are real, some are distractors (valid code that looks suspicious but is fine)
5. Submit → scored on precision (didn't flag non-issues) and recall (found real issues)

**YAML Frontmatter:**
```yaml
---
title: "Review the Daily ETL Pipeline"
difficulty: "Medium"
skill: "debug"
questionType: "review"
tags: ["code-review", "ETL", "data-quality", "SQL"]
language: "sql"
code: |
  -- Daily revenue ETL
  INSERT INTO fact_daily_revenue
  SELECT
    DATE(order_timestamp) as revenue_date,
    region,
    SUM(amount) as total_revenue,
    COUNT(*) as order_count
  FROM raw_orders
  WHERE order_timestamp >= CURRENT_DATE - INTERVAL '1 day'
    AND order_timestamp < CURRENT_DATE
  GROUP BY 1, 2;

  -- Update dashboard cache
  DELETE FROM dashboard_cache WHERE metric = 'revenue';
  INSERT INTO dashboard_cache
  SELECT 'revenue', region, total_revenue
  FROM fact_daily_revenue
  WHERE revenue_date = CURRENT_DATE - INTERVAL '1 day';

context: |
  This ETL runs daily at 02:00 UTC via Airflow. The `raw_orders` table receives data from
  multiple source systems throughout the day. Some orders can arrive with NULL amounts
  due to a known upstream bug.

issues:
  - id: i1
    text: "No handling of NULL amounts — SUM will silently ignore NULLs, undercounting revenue"
    is_real: true
    severity: "bug"
    explanation: "If upstream sends NULL amounts, SUM() ignores them. Revenue will be undercounted with no error or warning."
    points: 10
  - id: i2
    text: "DELETE + INSERT on dashboard_cache is not atomic — brief window of missing data"
    is_real: true
    severity: "warning"
    explanation: "Between DELETE and INSERT, any dashboard query will see no data. Use a transaction or MERGE statement."
    points: 8
  - id: i3
    text: "No idempotency — re-running inserts duplicate rows into fact_daily_revenue"
    is_real: true
    severity: "bug"
    explanation: "If the job is retried (common in production), it will insert duplicate rows. Add DELETE-before-INSERT or use MERGE."
    points: 10
  - id: i4
    text: "GROUP BY 1, 2 is unclear — should use column names"
    is_real: true
    severity: "nit"
    explanation: "Positional GROUP BY works but is less readable. Not a bug, but a code quality issue."
    points: 3
  - id: i5
    text: "Using CURRENT_DATE makes the query non-deterministic and untestable"
    is_real: true
    severity: "warning"
    explanation: "If you need to backfill or test, CURRENT_DATE locks you to today. Parameterize the date."
    points: 5
  - id: i6
    text: "The WHERE clause should use >= and <= instead of >= and <"
    is_real: false
    severity: null
    explanation: "The >= and < pattern is actually correct for date ranges — it cleanly captures a full day without overlap. This is best practice."
    points: -5
  - id: i7
    text: "COUNT(*) includes orders with NULL amounts in the count"
    is_real: false
    severity: null
    explanation: "COUNT(*) counts all rows regardless of NULLs — this is likely intentional (counting orders, not valid amounts). If you want to count only non-null amounts, use COUNT(amount)."
    points: -3
---
```

**Validation:** For each issue: +points if correctly identified as real with correct severity, negative points if flagged a non-issue (distractor). Severity scoring: exact match = full points, one level off = half points. Pass: score > 60% of max possible points.

---

## New Question Type 9: **Translate** (Cross-Paradigm Translation)

**One-liner:** Given working code in one paradigm, rewrite it in another (SQL ↔ Python/PySpark/Pandas).

**Skill:** SQL + Python (cross-skill) | **Bloom's Level:** Apply → Analyze | **Complexity:** Low

**Learning Science:** Transfer of learning (cross-paradigm forces abstraction of underlying concepts), retrieval practice (must recall equivalent constructs), deliberate practice (targets the SQL↔Python gap that many data engineers have).

**Why it's better:** Real data engineers constantly switch between SQL and Python (PySpark, Pandas). No platform explicitly practices this translation skill. Understanding the same operation in both paradigms deepens understanding of both.

**User Interaction:**
1. Left panel: source code (read-only) in one language + description of what it does
2. Right panel: Monaco editor set to the target language
3. Same tables/data available for both languages
4. Run → compare outputs side-by-side
5. Submit → validated against hidden datasets (same as current SQL/Python)

**YAML Frontmatter:**
```yaml
---
title: "SQL to PySpark: Window Functions"
difficulty: "Medium"
skill: "python"
questionType: "translate"
tags: ["translation", "window-functions", "SQL-to-PySpark", "pyspark"]
source_language: "sql"
target_language: "pyspark"
source_code: |
  SELECT
    employee_id,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) as dept_avg,
    salary - AVG(salary) OVER (PARTITION BY department) as diff_from_avg
  FROM employees
  ORDER BY department, salary DESC
tables:
  - name: employees
    visible_data: |
      employee_id,department,salary
      1,Engineering,95000
      2,Engineering,85000
      3,Marketing,75000
      4,Marketing,90000
    hidden_datasets:
      - |
        employee_id,department,salary
        10,Sales,60000
        11,Sales,70000
        12,HR,55000
expected_output_query: |
  from pyspark.sql import Window
  from pyspark.sql.functions import avg, col

  window_spec = Window.partitionBy("department")
  result = employees.withColumn("dept_avg", avg("salary").over(window_spec)) \
                    .withColumn("diff_from_avg", col("salary") - col("dept_avg")) \
                    .select("employee_id", "department", "salary", "dept_avg", "diff_from_avg") \
                    .orderBy("department", col("salary").desc())
---
The SQL query above calculates each employee's salary difference from their department average. Translate this to PySpark.
```

**Validation:** Same as existing Python/PySpark validation — run against hidden datasets via Pyodide, compare output with reference. The source code serves as a "specification" so the user knows exactly what output to produce.

---

## New Question Type 10: **Stepwise** (Guided Problem Decomposition)

**One-liner:** Solve a complex problem step-by-step, with each step validated before proceeding.

**Skill:** SQL, Python | **Bloom's Level:** Apply → Create | **Complexity:** High

**Learning Science:** Cognitive load theory (sub-goal labeling breaks complex problems into manageable chunks), worked examples + fading (early steps can have more scaffolding), retrieval practice in stepwise worked examples (2025 study — predicting each step before reveal significantly improved learning), deliberate practice (targets the decomposition skill itself).

**Why it's better:** LeetCode gives you one big problem and one submit button. Real complex queries are built incrementally — CTE by CTE, transformation by transformation. This teaches *decomposition*, the #1 skill that separates junior from senior engineers.

**User Interaction:**
1. Full problem described at top
2. Step 1 shown with sub-goal description → user writes code for just this step → Run to validate
3. On success: step 1 code becomes read-only context, Step 2 reveals
4. Each step can reference previous steps (CTEs build on each other)
5. Final step composes everything
6. If stuck: can request hint (reduces max score)

**YAML Frontmatter:**
```yaml
---
title: "Customer Cohort Retention Analysis"
difficulty: "Hard"
skill: "sql"
questionType: "stepwise"
tags: ["CTEs", "cohort-analysis", "window-functions", "date-functions"]
tables:
  - name: orders
    visible_data: |
      order_id,customer_id,order_date,amount
      1,100,2024-01-15,50
      2,100,2024-02-20,75
      3,101,2024-01-05,30
      4,101,2024-01-22,45
      5,102,2024-02-10,60
    hidden_datasets:
      - |
        order_id,customer_id,order_date,amount
        1,200,2024-03-01,100
        2,200,2024-04-15,120
        3,201,2024-03-10,80
        4,202,2024-03-20,90
        5,202,2024-05-01,110

steps:
  - id: step1
    title: "Find each customer's first order month"
    description: "Write a CTE called `first_orders` that finds the first order month (as DATE, truncated to month start) for each customer."
    hint: "Use MIN(order_date) and DATE_TRUNC('month', ...)"
    expected_output_query: |
      SELECT customer_id, DATE_TRUNC('month', MIN(order_date)) as cohort_month
      FROM orders GROUP BY customer_id
    cte_name: "first_orders"
  - id: step2
    title: "Calculate months since first order for each transaction"
    description: "Write a CTE called `order_months` that joins orders with first_orders and calculates the number of months between the order and the customer's first order."
    hint: "Use DATEDIFF('month', cohort_month, DATE_TRUNC('month', order_date))"
    expected_output_query: |
      SELECT o.customer_id, f.cohort_month,
             DATEDIFF('month', f.cohort_month, DATE_TRUNC('month', o.order_date)) as months_since_first
      FROM orders o JOIN first_orders f ON o.customer_id = f.customer_id
    cte_name: "order_months"
  - id: step3
    title: "Build the cohort retention table"
    description: "Write the final SELECT that counts distinct customers per cohort_month and months_since_first, giving you a retention table."
    hint: "GROUP BY cohort_month, months_since_first and COUNT(DISTINCT customer_id)"
    expected_output_query: |
      SELECT cohort_month, months_since_first, COUNT(DISTINCT customer_id) as customers
      FROM order_months
      GROUP BY cohort_month, months_since_first
      ORDER BY cohort_month, months_since_first
    cte_name: null
---
Build a customer cohort retention analysis step by step. Each step builds a CTE that the next step can reference.
```

**Validation:** Each step: compose all previous CTEs + current step's code, run against datasets, compare output. Step passes if output matches. Final score: steps passed / total steps. Hints used reduce max score per step by 50%.

---

## Bloom's Coverage Summary

| Bloom's Level | Existing Types | New Types |
|---|---|---|
| **Remember** | Quiz | — (covered by Quiz) |
| **Understand** | — | **Predict**, **Parsons** |
| **Apply** | SQL, Python, Debug | **Translate**, **Stepwise** (lower steps) |
| **Analyze** | — | **Reverse**, **Review**, **Incident** |
| **Evaluate** | Architecture (all 3) | **Optimize**, **Tradeoff** |
| **Create** | Modeling | **Evolve**, **Stepwise** (final composition) |

## Learning Science Coverage

| Principle | Question Types That Apply It |
|---|---|
| Retrieval Practice | Predict, Parsons (blanks), Reverse, Translate |
| Worked Examples + Fading | Parsons, Stepwise |
| Elaborative Interrogation | Tradeoff (justifications), Review (why is this wrong?), Incident (what does this clue mean?) |
| Transfer of Learning | Translate (cross-paradigm), Reverse (varied contexts) |
| Cognitive Load Theory | Stepwise (sub-goals), Parsons (reduced generation demand) |
| Deliberate Practice | Optimize (process feedback), Review (breadth), Incident (diagnostic reasoning) |
| Desirable Difficulties | Reverse (harder than forward), Translate (cross-paradigm friction) |

## Implementation Priority

| Priority | Type | Complexity | Unique Value |
|---|---|---|---|
| 1 | **Predict** | Low | No platform has this; fills Understand gap |
| 2 | **Reverse** | Low | Mirrors real job; reuses existing validators |
| 3 | **Review** | Medium | Unique to DataDrill; daily senior skill |
| 4 | **Parsons** | Medium | Backed by strongest research (CHI 2021) |
| 5 | **Optimize** | Medium | Tests senior-level reasoning |
| 6 | **Stepwise** | High | Teaches decomposition; compound value |
| 7 | **Translate** | Low | Reuses existing validators; unique cross-skill |
| 8 | **Tradeoff** | Medium | Staff-level engineering judgment |
| 9 | **Incident** | High | Most immersive; simulates real work |
| 10 | **Evolve** | High | Only platform teaching schema evolution |

---

## UX Organization: How to Avoid Chaos

### Core Principle: Users Think in Skills, Not Question Types

The 5 skill tracks remain the primary navigation. Question types are a **property of a question**, not a navigation layer. Just like Architecture already has 3 subtypes (Constraints, Canvas, Quiz) without requiring a separate "choose your format" step — all skills will work this way.

**Zero additional clicks.** The path stays: Home → Skill → Question → Go.

### Skill Track → Question Type Mapping

```
SQL Track
├── Write        (existing — write query from scratch)
├── Predict      (new — predict output of given query)
├── Build        (new — Parsons: arrange + fill blanks)
├── Reverse      (new — input/output → write query)
├── Optimize     (new — rewrite slow query)
├── Stepwise     (new — solve complex query step-by-step)
└── Translate    (new — rewrite from Python to SQL)

Python Track  (replaces PySpark — broader scope)
├── Write        (existing PySpark write, now also Pandas/general Python)
├── Predict      (new — predict output of given code)
├── Build        (new — Parsons: arrange + fill blanks)
├── Reverse      (new — input/output → write code)
├── Optimize     (new — rewrite slow code)
├── Stepwise     (new — solve complex problem step-by-step)
├── Translate    (new — rewrite from SQL to Python)
│
│   Subcategories (via tags):
│   ├── PySpark      — DataFrame transformations, Spark SQL, UDFs
│   ├── Pandas       — Data manipulation, cleaning, analysis
│   └── General      — Python fundamentals for data engineering
│
│   Subcategories use the existing tags system. The Topic filter
│   already supports filtering by tag, so users can focus on
│   "pyspark" or "pandas" or see all Python questions mixed.

Debug Track
├── Fix          (existing — fix broken code)
├── Review       (new — find bugs in PR-style code)
└── Incident     (new — investigate production data incident)

Architecture Track
├── Constraints  (existing — select questions + choose arch)
├── Canvas       (existing — drag components to pipeline)
├── Quiz         (existing — multiple choice)
└── Tradeoff     (new — choose + justify trade-off)

Modeling Track
├── Design       (existing — build schema from scratch)
└── Evolve       (new — migrate schema safely)
```

### Why This Doesn't Create Chaos

**1. The user never chooses a question type explicitly.**
They browse questions by skill → difficulty → topic. The type badge is secondary information, like a tag. It tells you *what activity you'll do* — not a category to navigate into.

**2. Activity labels, not jargon.**
Users see human-readable labels that describe the activity:

| Internal Name | User-Facing Badge | What It Communicates |
|---|---|---|
| write | "Write" | You'll write code from scratch |
| predict | "Predict" | You'll predict what code outputs |
| parsons | "Build" | You'll assemble code from parts |
| reverse | "Reverse" | You'll figure out the transformation |
| optimize | "Optimize" | You'll make code faster |
| stepwise | "Step by Step" | You'll solve in guided steps |
| translate | "Translate" | You'll convert between languages |
| fix | "Fix" | You'll fix broken code |
| review | "Review" | You'll review code for issues |
| incident | "Investigate" | You'll diagnose a production issue |
| constraints | "Design" | You'll gather info + choose architecture |
| canvas | "Pipeline" | You'll build a data pipeline |
| quiz | "Quiz" | You'll answer knowledge questions |
| tradeoff | "Trade-offs" | You'll evaluate competing options |
| design | "Design" | You'll design a schema |
| evolve | "Evolve" | You'll migrate an existing schema |

**3. Visual differentiation through color-coded badges.**
Each type gets a subtle colored badge on the question card (same pattern Architecture already uses). Colors are grouped by cognitive activity:

- **Blue tones** = Writing/Building code (Write, Build, Stepwise, Translate)
- **Purple tones** = Analysis/Reasoning (Reverse, Optimize, Review, Investigate)
- **Green tones** = Selection/Judgment (Quiz, Constraints, Trade-offs, Pipeline)
- **Orange tones** = Schema/Design (Design, Evolve)
- **Teal** = Predict (unique — mental execution)

**4. Filtering, not categorizing.**
The existing Filters component gets a third dropdown: "Type" (alongside Difficulty and Topic). Default: "All Types" — showing everything mixed. Users who want to focus on a specific format can filter. The interleaved default is actually the scientifically optimal approach (see Interleaving research).

**5. Question count stays manageable per track.**
Even with new types, each skill track will have 20-40 questions total (across all types and difficulties). The grid already supports this. New types don't multiply the question count — they diversify it.

### Question Card Design (Updated)

Current card shows: Title, Difficulty Badge, Tags

Proposed card shows:
```
┌──────────────────────────────────┐
│  [Predict] [Medium]              │  ← Type badge + Difficulty badge (top-right)
│                                  │
│  Window Function Output          │  ← Title (prominent)
│                                  │
│  ROW_NUMBER  window-functions    │  ← Tags (muted, bottom)
└──────────────────────────────────┘
```

The type badge is the FIRST thing the eye hits — telling you immediately what kind of activity this is. This is like Duolingo showing a listening icon vs. a writing icon on each exercise — no explanation needed.

### Serving Two User Types: Interview Cramming vs. Deep Learning

The key insight: **most new question types ARE interview-relevant.** Real senior/staff interviews don't just ask "write a query." They ask:

- "Given this input and output, write the transformation" → **Reverse**
- "This query is slow, how would you improve it?" → **Optimize**
- "Break this problem into steps, solve each one" → **Stepwise**
- "What's wrong with this code?" → **Review**
- "Why would you choose architecture A over B?" → **Tradeoff**
- "Walk me through how you'd debug this" → **Incident**

So 6 of the 10 new types directly mirror interview formats. Only 4 are primarily learning scaffolds: **Predict**, **Build** (Parsons), **Translate**, and **Evolve**.

**Solution: Interview-relevance tagging (not modes)**

Each question gets a boolean `interview_relevant` flag in its YAML frontmatter. The SkillPage filter bar gets a toggle:

```
[All Types ▾] [All Difficulties ▾] [All Topics ▾]  [🎯 Interview Focus]
```

When "Interview Focus" is toggled ON:
- Only interview-relevant question types appear
- Questions are sorted by how commonly the pattern appears in real interviews
- The types hidden are: Predict, Build, Translate (scaffolding types)
- Everything else stays visible

When toggled OFF (default):
- All types visible, interleaved — the optimal learning experience

**Why a toggle, not separate modes:**
- No extra navigation or onboarding complexity
- Users can discover scaffolding types naturally ("what's this 'Predict' type?")
- One toggle, always visible, always reversible
- Interview-focused users see fewer questions but the ones that matter most
- Deep learners see everything

**Which types are interview-relevant:**

| Type | Interview Relevant? | Why |
|---|---|---|
| Write | Yes | Core interview format |
| Predict | No | Learning scaffold — builds mental models |
| Build (Parsons) | No | Learning scaffold — reduces cognitive load |
| Reverse | Yes | "Here's the output, write the query" is a common format |
| Optimize | Yes | Every senior interview asks optimization questions |
| Stepwise | Yes | Complex problems are solved incrementally in interviews |
| Translate | No | Useful skill but not a standard interview format |
| Fix | Yes | Debug questions are interview staples |
| Review | Yes | Senior/staff interviews include code review |
| Incident | Yes | On-site scenario for senior/staff roles |
| Constraints | Yes | System design interview format |
| Canvas | Yes | Pipeline design interview format |
| Quiz | Yes | Phone screen format |
| Tradeoff | Yes | Staff-level system design interviews |
| Design | Yes | Data modeling interviews |
| Evolve | No | Learning scaffold — advanced production skill |

**Result:** Interview Focus toggle shows 12 of 17 types. The 5 hidden ones are scaffolding tools that help users *learn*, while the visible ones help users *perform*. Users who toggle ON get a focused, interview-relevant experience. Users who don't get the scientifically optimal learning experience. Both benefit from the same question pool.

### Dedicated Interview Experience Features

Beyond the toggle, interview-focused users need three things that free-form practice doesn't provide: **structure** (what to practice in what order), **pressure** (time simulation), and **coverage clarity** (am I ready?).

#### Feature A: Mock Interview Sessions (Detailed Design)

A "Mock Interview" is a curated, timed sequence of questions that simulates a real interview loop. It's the centerpiece of the interview prep experience.

---

##### Session Structure: How Real Interviews Actually Work

Real data engineering interviews follow predictable patterns by level:

**Junior/Mid Interview (45 min, 3 questions):**
```
Round 1: SQL Write (Easy)        — 10 min — "Can you write basic queries?"
Round 2: SQL Write (Medium)      — 15 min — "Can you handle JOINs/aggregation?"
Round 3: Debug Fix (Easy-Medium) — 15 min — "Can you read and fix code?"
Buffer:                           5 min
```

**Senior Interview (60 min, 4 questions):**
```
Round 1: SQL Reverse (Medium)        — 12 min — "Deduce the transformation"
Round 2: SQL Optimize (Medium)       — 15 min — "Improve this query"
Round 3: Architecture Tradeoff (Med) — 15 min — "Choose and justify"
Round 4: Debug Review (Medium)       — 13 min — "Find the issues in this PR"
Buffer:                                5 min
```

**Staff Interview (75 min, 4-5 questions):**
```
Round 1: SQL Stepwise (Hard)          — 20 min — "Decompose and solve complex problem"
Round 2: Architecture Tradeoff (Hard) — 15 min — "Deep trade-off reasoning"
Round 3: Modeling Evolve (Hard)       — 15 min — "Evolve schema without breaking things"
Round 4: Debug Incident (Hard)        — 15 min — "Diagnose production issue"
Round 5: Debug Review (Hard)          — 10 min — "Quick code review under pressure"
```

**Mixed/Full Loop (90 min, 5 questions):**
```
Round 1: SQL Write (Medium)           — 15 min — Warm-up
Round 2: SQL Reverse (Medium)         — 15 min — Pattern recognition
Round 3: Architecture Canvas (Hard)   — 15 min — System design
Round 4: Debug Incident (Medium)      — 15 min — Production reasoning
Round 5: Modeling Design (Medium)     — 15 min — Data modeling
Buffer:                                15 min
```

##### User Flow (Click by Click)

**Step 1: Entry Point**
User clicks "Mock Interview" in the top nav bar. Lands on `/interview` page.

**Step 2: Session Configuration (single screen, no wizard)**
```
┌─────────────────────────────────────────────────────┐
│                  Mock Interview                      │
│                                                      │
│  Target Level                                        │
│  ┌──────┐ ┌──────┐ ┌────────┐ ┌───────┐            │
│  │Junior│ │ Mid  │ │ Senior │ │ Staff │             │
│  └──────┘ └──────┘ └────────┘ └───────┘             │
│                                                      │
│  Focus Area                                          │
│  ┌──────┐ ┌─────────┐ ┌────────────┐ ┌───────┐     │
│  │ SQL  │ │ Python  │ │ Sys Design │ │ Mixed │      │
│  └──────┘ └─────────┘ └────────────┘ └───────┘      │
│                                                      │
│  Duration: 45 min (3 questions)                      │
│  ↑ auto-calculated from level + focus                │
│                                                      │
│           [ Start Interview →]                       │
└─────────────────────────────────────────────────────┘
```

All options are buttons (not dropdowns). Default: nothing selected. Duration auto-calculates based on level + focus. One click per option, then "Start Interview."

**Total clicks to first question: 4** (Nav → Level → Focus → Start)

**Step 3: Interview In-Progress**
```
┌────────────────────────────────────────────────────────────┐
│  Round 2 of 4   │   ⏱ 12:00 remaining   │   Senior SQL    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  (The actual question view renders here — same components  │
│   as the normal question view, but wrapped in the          │
│   interview chrome: round indicator, timer, progress)      │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  ● ● ○ ○        [ Skip → ]                                │
│  Round progress dots                                       │
└────────────────────────────────────────────────────────────┘
```

Key UX details:
- **Top bar**: Round X of Y | Per-question timer (counts down) | Session label
- **Timer colors**: Green (>60% time left) → Yellow (20-60%) → Red (<20%) → Pulsing red (last 60s)
- **When timer hits 0**: Question auto-submits with current state (partial credit possible). Moves to next round.
- **Skip button**: Available but costs the round (0 points). Confirms with "Are you sure? This round will be scored as 0."
- **Progress dots**: Filled = completed (green = passed, red = failed), hollow = upcoming, current = pulsing
- **No back button**: Once submitted, can't revisit (mirrors real interviews)
- **Question views**: Same components as free practice, but Run button still works (users should test before submitting)

**Step 4: Scorecard (after final submission)**
```
┌──────────────────────────────────────────────────────────┐
│                   Interview Complete                      │
│                                                          │
│  Overall: 3/4 rounds passed  ⭐⭐⭐☆                    │
│  Time: 52:00 / 60:00                                     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │ Round 1: SQL Reverse (Medium)                   │     │
│  │ ✅ Passed  •  8:32 / 12:00  •  "Strong"        │     │
│  ├─────────────────────────────────────────────────┤     │
│  │ Round 2: SQL Optimize (Medium)                  │     │
│  │ ✅ Passed  •  14:20 / 15:00  •  "On pace"      │     │
│  ├─────────────────────────────────────────────────┤     │
│  │ Round 3: Architecture Tradeoff (Medium)         │     │
│  │ ✅ Passed  •  11:45 / 15:00  •  "Strong"       │     │
│  ├─────────────────────────────────────────────────┤     │
│  │ Round 4: Debug Review (Medium)                  │     │
│  │ ❌ Failed  •  13:00 / 13:00 ⏰ •  "Timed out"  │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
│  💡 Insight: You're strong on SQL and architecture but    │
│  struggle with time management on code review questions.  │
│  Practice more "Review" type questions.                   │
│                                                          │
│  [ Review Answers ]  [ Try Again ]  [ Back to Home ]     │
└──────────────────────────────────────────────────────────┘
```

Scorecard shows:
- **Overall score**: X/Y rounds passed + star rating (1-4 stars)
- **Total time used** vs. allotted
- **Per-round breakdown**: Pass/fail, time used vs. allotted, performance label
- **Performance labels**: "Strong" (<70% time, passed), "On pace" (70-100% time, passed), "Timed out" (ran out of time), "Struggled" (used all time, failed), "Skipped"
- **Insight**: One sentence identifying the weakest area with a concrete recommendation
- **Review Answers**: View each question's solution + your submission (read-only)
- **Try Again**: New session with same parameters but different questions

##### Session Template Data Structure

```typescript
interface InterviewSession {
  id: string;
  level: 'junior' | 'mid' | 'senior' | 'staff';
  focus: 'sql' | 'python' | 'system-design' | 'mixed';
  totalTimeMinutes: number;
  rounds: InterviewRound[];
}

interface InterviewRound {
  questionId: string;          // References a question in the question pool
  skill: SkillType;            // e.g., 'sql', 'debug'
  questionType: string;        // e.g., 'reverse', 'optimize'
  timeMinutes: number;         // Per-round time limit
  label: string;               // e.g., "Deduce the transformation"
}
```

**Session Definition (JSON file, not markdown):**
```json
{
  "id": "senior-sql-1",
  "level": "senior",
  "focus": "sql",
  "totalTimeMinutes": 60,
  "rounds": [
    { "questionId": "sql/reverse/medium/pivot-detection", "skill": "sql", "questionType": "reverse", "timeMinutes": 12, "label": "Deduce the transformation" },
    { "questionId": "sql/optimize/medium/correlated-subquery", "skill": "sql", "questionType": "optimize", "timeMinutes": 15, "label": "Improve this query" },
    { "questionId": "architecture/tradeoff/medium/batch-vs-stream", "skill": "architecture", "questionType": "tradeoff", "timeMinutes": 15, "label": "Choose and justify" },
    { "questionId": "debug/review/medium/etl-pipeline", "skill": "debug", "questionType": "review", "timeMinutes": 13, "label": "Find the issues in this PR" }
  ]
}
```

Sessions are stored in `public/interviews/` as JSON files. Build script generates an `index.json` listing all available sessions by level + focus. Client fetches the index, user picks, client fetches the session config, then fetches each question on demand as rounds progress.

##### Randomized Sessions (Optional Enhancement)

Instead of only hand-curated sessions, support **template-based random generation**:

```json
{
  "id": "senior-sql-random",
  "level": "senior",
  "focus": "sql",
  "totalTimeMinutes": 60,
  "rounds": [
    { "pool": { "skill": "sql", "questionType": "reverse", "difficulty": "Medium" }, "timeMinutes": 12 },
    { "pool": { "skill": "sql", "questionType": "optimize", "difficulty": "Medium" }, "timeMinutes": 15 },
    { "pool": { "skill": "architecture", "questionType": "tradeoff", "difficulty": "Medium" }, "timeMinutes": 15 },
    { "pool": { "skill": "debug", "questionType": "review", "difficulty": "Medium" }, "timeMinutes": 13 }
  ]
}
```

When `pool` is used instead of `questionId`, the client randomly selects a matching question at session start (excluding questions the user has already seen in previous sessions). This gives infinite replay value without hand-curating every session.

##### State Management

New Zustand store: `interviewStore.ts`
```typescript
interface InterviewState {
  session: InterviewSession | null;
  currentRound: number;
  roundResults: RoundResult[];
  startTime: number;
  roundStartTime: number;
  isActive: boolean;

  startSession(session: InterviewSession): void;
  submitRound(result: RoundResult): void;
  nextRound(): void;
  skipRound(): void;
  endSession(): void;
  reset(): void;
}

interface RoundResult {
  questionId: string;
  passed: boolean;
  score: number;
  timeUsedSeconds: number;
  timeLimitSeconds: number;
  skipped: boolean;
}
```

##### Supabase Storage (for history)

```sql
-- New table: interview_sessions
create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  session_template_id text not null,
  level text not null,
  focus text not null,
  total_time_seconds int not null,
  rounds_passed int not null,
  rounds_total int not null,
  star_rating int not null,  -- 1-4
  completed_at timestamptz default now()
);
```

Individual round results are stored as regular submissions (existing `submissions` table) with a `session_id` foreign key linking them to the interview session. **No schema changes to the submissions table** — just add an optional `session_id` column.

##### Why This Is Better Than Any Existing Platform

1. **LeetCode**: Has "contests" but no interview simulation. No time-per-question, no mixed types, no scorecard with insights.
2. **HackerRank/CodeSignal assessments**: These are employer-facing, not candidate-facing. No self-serve mock interviews.
3. **Interviewing.io/Pramp**: These require a partner. DataDrill's mock interviews are solo and available 24/7.
4. **StrataScratch/DataLemur**: Pure question banks with no structured session experience.

DataDrill's mock interview is unique because:
- **It mixes question types** within a single session (interleaving — scientifically optimal)
- **Per-round timers** create realistic pressure without the anxiety of a live partner
- **Actionable insights** on the scorecard tell you exactly what to practice next
- **Infinite replay** via randomized sessions from the question pool
- **Level-calibrated** — the question mix and difficulty match real interview expectations per level

#### Feature B: Time Targets on Individual Questions

Every question gets an `expected_time` field (in minutes) in its YAML frontmatter:

```yaml
expected_time: 15  # Minutes expected for interview-pace solving
```

**UX when Interview Focus toggle is ON:**
- A subtle timer appears when the user starts a question
- After completing: "Solved in 8:32 (target: 15:00)" — green if under, yellow if close, red if over
- No penalty for going over — it's informational, not punitive
- Timer can be hidden/shown with a click

**When Interview Focus is OFF:**
- No timer shown (learning mode = no time pressure = better for understanding)

This is a single YAML field per question + a client-side timer component. Near-zero implementation cost.

#### Feature C: Interview Readiness Map (Future — Out of Scope Now)

This is a platform-level feature that belongs in the "add platform features later" bucket, but the question type design supports it without refactoring:

- Aggregate submission data per user, per topic tag, per Bloom's level
- Show a coverage grid: "SQL JOINs: 5/8 questions passed | Window Functions: 2/6 | CTEs: 0/4"
- Highlight gaps: "You haven't practiced any Optimize questions for SQL"
- Every question type produces pass/fail + score → all data needed for this is already captured in submissions

No action needed now — the question type design naturally enables this later.

#### Organizing the Home Page for Both Audiences

The home page currently shows 5 skill cards. For interview users, we could add a **6th card** (or a prominent banner) that serves as the entry point to the interview experience:

```
┌─────────┐ ┌─────────┐ ┌─────────┐
│   SQL   │ │ Python  │ │  Debug  │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌──────────────────────┐
│  Arch   │ │Modeling │ │  🎯 Mock Interview   │
└─────────┘ └─────────┘ │  Practice under      │
                         │  real conditions     │
                         └──────────────────────┘
```

OR, keep the 5 skill cards clean and add a "Mock Interview" button in the top navigation bar. This separates the two entry points:
- **Skills** = I want to learn/practice at my own pace
- **Mock Interview** = I want to simulate a real interview

**Recommendation:** Top nav button. It's always accessible, doesn't clutter the skill grid, and clearly signals "this is a different mode." The skill pages get the Interview Focus toggle for browsing individual questions. The Mock Interview button leads to the structured session experience.

### Progressive Experience (Future Platform Feature Ready)

While this is out of scope now, the question type design supports a future "Recommended Path" feature:

```
Beginner Path (per skill):
  Quiz → Predict → Build → Write (Easy) → Fix

Intermediate Path:
  Write (Medium) → Reverse → Optimize → Review → Translate

Advanced Path:
  Stepwise → Incident → Write (Hard) → Tradeoff → Evolve
```

This follows Bloom's Taxonomy naturally: Remember → Understand → Apply → Analyze → Evaluate → Create. The question types already map to these levels, so a future recommendation engine just needs to order by Bloom's level.

### URL Structure

Stays clean and unchanged:
```
/sql/question/predict-window-function-1
/sql/question/build-running-total
/debug/question/review-etl-pipeline
/debug/question/incident-missing-revenue
```

The question type is encoded in the question ID (by naming convention), not in the URL path. No new routes needed.

### Type System Extension

Extend the existing `questionType` discriminator pattern:

```typescript
// Current
type ArchitectureQuestionType = 'constraints' | 'canvas' | 'quiz';

// Extended
type SqlQuestionType = 'write' | 'predict' | 'parsons' | 'reverse' | 'optimize' | 'stepwise' | 'translate';
type PythonQuestionType = 'write' | 'predict' | 'parsons' | 'reverse' | 'optimize' | 'stepwise' | 'translate';
type DebugQuestionType = 'fix' | 'review' | 'incident';
type ArchitectureQuestionType = 'constraints' | 'canvas' | 'quiz' | 'tradeoff';
type ModelingQuestionType = 'design' | 'evolve';
```

Existing questions that don't have a `questionType` field default to the "original" type: SQL→write, Python→write, Debug→fix, Modeling→design. **Zero breaking changes.** Existing PySpark questions move under the Python skill with a `pyspark` tag.

---

## Future-Proofing for Platform Features

Each question type is designed to support:
- **Spaced repetition:** Every type produces a pass/fail + score, enabling scheduling algorithms
- **Adaptive difficulty:** Each type scales Easy → Hard within its format, and Bloom's levels create a natural progression
- **Interleaving:** Types are cross-skill compatible (a session could mix Predict + Review + SQL + Translate)
- **Learning paths:** Bloom's tagging enables "master Understand before Apply before Analyze" progressions

## Verification Plan

For each implemented type:
1. Create 2-3 example questions in markdown format
2. Extend `processQuestions.ts` to parse the new YAML schema
3. Add TypeScript interfaces + type guards in `types/index.ts`
4. Build the view component with Zustand store
5. Build the validator
6. Run `npm run build` to verify full pipeline
7. Test in browser with example questions
