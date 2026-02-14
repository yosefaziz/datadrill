# Solution Playbook Categories

Blueprint for what question types to create at each level of every track. Each track progresses from scaffold types (build understanding) to interview types (build interview readiness).

See `product-strategy.md` for question type definitions and Bloom's taxonomy mapping.

## Question Type Legend

| Type | Category | Skills | Status |
|------|----------|--------|--------|
| **Quiz** | Scaffold | All | Built |
| **Predict** | Scaffold | SQL, Python | Planned |
| **Parsons** | Scaffold | SQL, Python | Planned |
| **Translate** | Scaffold | SQL-Python | Planned |
| **Evolve** | Scaffold | Modeling | Planned |
| **Write** | Interview | SQL, Python | Built |
| **Debug/Fix** | Interview | SQL, Python | Built |
| **Reverse** | Interview | SQL, Python | Planned |
| **Review** | Interview | SQL, Python | Planned |
| **Optimize** | Interview | SQL | Planned |
| **Stepwise** | Interview | SQL, Python | Planned |
| **Constraints** | Interview | Architecture | Built |
| **Canvas** | Interview | Architecture | Built |
| **Tradeoff** | Interview | Architecture | Planned |
| **Incident** | Interview | Debug, Tools | Planned |
| **Design** | Interview | Modeling | Built |

## Level Philosophy

Every track follows the same cognitive arc:

| Phase | Levels | Bloom's | Types | Goal |
|-------|--------|---------|-------|------|
| **Recognize** | 1 | Remember/Understand | Quiz, Predict | Can you read this pattern and know what it does? |
| **Reproduce** | 2 | Understand/Apply | Parsons, Write (guided) | Can you assemble/write a basic version? |
| **Apply** | 3 | Apply/Analyze | Write, Reverse, Debug | Can you use the pattern in new contexts? |
| **Interview** | 4+ | Analyze/Evaluate/Create | Write (complex), Review, Optimize, Stepwise | Can you handle this under interview conditions? |

Not every track needs all four phases. Simpler tracks (3 levels) compress Recognize+Reproduce into one level.

---

## SQL (16 tracks, 67 planned questions)

### Foundational Tracks

These cover building-block patterns. Most interviews assume you already know these.

#### `sql-agg-groupby` - Aggregate Mastery (6 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Basic Aggregates | COUNT, SUM, AVG | Predict, Quiz | Recognize: see aggregates, predict output |
| 2 - GROUP BY | Multiple columns | Parsons, Write | Reproduce: assemble a grouped query |
| 3 - HAVING & Filtering | Filter results | Write, Reverse | Apply: write HAVING from requirements; reverse from output |
| 4 - Conditional Aggregation | CASE inside SUM/COUNT | Write, Write | Interview: two full write problems combining CASE + agg |

#### `sql-window-ranking` - Window Ranking (5 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - ROW_NUMBER Basics | Simple numbering | Predict, Quiz | Recognize: predict which row gets which number |
| 2 - RANK vs DENSE_RANK | Handling ties | Predict, Parsons | Recognize: predict tie behavior; assemble ranking query |
| 3 - Top-N per Group | Top 3 per category | Write, Write | Apply: classic interview pattern, two scenarios |
| 4 - NTH_VALUE & NTILE | Advanced ranking | Write | Interview: less common but high-signal when asked |

#### `sql-window-lag-lead` - LAG & LEAD (5 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Basic LAG | Previous row value | Predict, Quiz | Recognize: predict LAG output |
| 2 - LEAD & Offsets | Next row, custom offsets | Parsons, Write | Reproduce: assemble LEAD with offset/default |
| 3 - Change Detection | Day/month-over-day/month | Write, Write | Apply: two change detection scenarios |
| 4 - FIRST_VALUE & LAST_VALUE | Boundary values | Write | Interview: tricky frame semantics |

#### `sql-window-rolling` - Rolling Averages (3 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Running Total | SUM() OVER basics | Predict, Quiz | Recognize: predict cumulative sum |
| 2 - Sliding Windows | ROWS BETWEEN | Write | Apply: 7-day moving average |
| 3 - Calendar Windows | RANGE BETWEEN + INTERVAL | Write | Interview: handles date gaps, harder framing |

#### `sql-joins-multi` - Multi-Table Joins (5 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Two-Table JOIN | INNER/LEFT basics | Quiz, Predict | Recognize: which rows survive which join type? |
| 2 - Three-Table JOIN | Adding a third table | Parsons, Write | Reproduce: chain joins correctly |
| 3 - Mixed Join Types | INNER + LEFT together | Write, Write | Apply: two mixed-join scenarios |
| 4 - Join + Aggregation | Joins + GROUP BY | Write | Interview: combined pattern |

#### `sql-dedup` - Deduplication (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - DISTINCT & GROUP BY | Basic dedup | Quiz, Predict | Recognize: when does DISTINCT vs GROUP BY matter? |
| 2 - ROW_NUMBER Dedup | Keep latest/first per group | Write, Write | Apply: the bread-and-butter dedup pattern |
| 3 - Complex Dedup | Multi-column tie-breaking | Write | Interview: complex dedup with QUALIFY |

#### `sql-subquery-filter` - Subquery Filtering (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - IN Subquery | Basic IN (SELECT ...) | Predict, Quiz | Recognize: predict IN behavior |
| 2 - EXISTS Pattern | Correlated EXISTS | Write, Write | Apply: two EXISTS scenarios |
| 3 - Complex Filtering | NOT EXISTS, nested | Write | Interview: nested subquery with negation |

#### `sql-self-join` - Self-Joins (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Employee-Manager | Basic self-join | Predict, Parsons | Recognize: predict self-join result; assemble the pattern |
| 2 - Row Comparison | Current vs previous | Write, Write | Apply: two comparison scenarios |
| 3 - Multi-Level Hierarchy | Grandparent chains | Write | Interview: multi-hop self-join |

#### `sql-anti-joins` - Find What's Missing (3 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - LEFT JOIN + IS NULL | Classic anti-join | Predict, Quiz | Recognize: predict which rows return NULL |
| 2 - NOT EXISTS | Correlated subquery approach | Write | Apply: write NOT EXISTS from requirements |
| 3 - Interview-Ready | Anti-join + aggregation | Write | Interview: combined anti-join + GROUP BY + HAVING |

### Analytics Tracks

These cover the high-signal patterns that separate strong candidates. Most questions are Write type since the value is in practicing the full pattern.

#### `sql-retention-cohort` - Retention & Cohort Analysis (4 questions)
Prereq: `sql-agg-groupby`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Simple Retention | Day 1 / Day 7 | Quiz, Write | Quick concept check, then write a simple retention query |
| 2 - Cohort Table | Monthly cohort matrix | Write, Write | Apply: the core pattern, two variations |
| 3 - Rolling Retention | N-day rolling | Write | Interview: hardest retention variant |

#### `sql-sessionization` - Sessionization (4 questions)
Prereq: `sql-window-lag-lead`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Time Gaps | Detect gaps between events | Predict, Write | Predict LAG-based gap detection, then write it |
| 2 - Session Assignment | Assign session IDs | Write, Write | Apply: the core pattern - conditional SUM for session IDs |
| 3 - Session Metrics | Duration, event count | Write | Interview: full sessionization + aggregation |

#### `sql-funnel-conversion` - Funnel & Conversion (4 questions)
Prereq: `sql-agg-groupby`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Two-Step Funnel | Signup to purchase | Quiz, Write | Concept check, then write a simple conversion rate |
| 2 - Multi-Step Funnel | 3+ steps with drop-off | Write, Write | Apply: multi-step with rates |
| 3 - Time-Bounded Funnel | Conversion within N days | Write | Interview: adds time constraint |

#### `sql-yoy-growth` - Period-over-Period Growth (4 questions)
Prereq: `sql-window-lag-lead`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Month-over-Month | Basic MoM with LAG | Predict, Write | Predict LAG percent change, then write it |
| 2 - Year-over-Year | YoY with self-join | Write, Write | Apply: self-join approach, two granularities |
| 3 - Growth with Gaps | Handle missing periods | Write | Interview: COALESCE + gap handling |

#### `sql-active-users` - Active User Metrics (4 questions)
Prereq: `sql-agg-groupby`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Daily Active Users | Basic DAU | Quiz, Write | Concept check, then write COUNT DISTINCT by date |
| 2 - WAU & MAU | Rolling windows | Write, Write | Apply: date range join for weekly/monthly |
| 3 - Engagement Ratios | DAU/MAU stickiness | Write | Interview: ratio calculation with nested aggregation |

#### `sql-gaps-islands` - Gaps & Islands (5 questions)
Prereq: `sql-window-ranking`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Detect Gaps | Find missing dates | Predict, Write | Predict gap detection with LAG, then write it |
| 2 - Island Detection | Find consecutive groups | Write | Apply: the ROW_NUMBER difference technique |
| 3 - Streak Counting | Login streaks | Write, Write | Apply: two streak scenarios |
| 4 - Complex Islands | Multi-column, conditional | Write | Interview: hardest variant |

#### `sql-engagement-analytics` - Engagement Analytics (3 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Duration Aggregation | Join + aggregate watch time | Write | Straightforward join + GROUP BY |
| 2 - Rank Top Content | RANK per user | Write | Apply: window function in analytics context |
| 3 - Find Drop-Offs | Anti-join for no-activity users | Write | Apply: anti-join in analytics context |

---

## Architecture (6 tracks, 26 planned questions)

Architecture tracks use Quiz at early levels, Constraints/Tradeoff at mid levels, and Canvas at the capstone.

### `architecture-batch-etl` - Batch ETL Pipeline (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - ETL Fundamentals | Extract, transform, load | Quiz | Recognize: ETL vs ELT, staging areas |
| 2 - Orchestration | DAGs, retries | Constraints, Tradeoff | Apply: design choices with real constraints |
| 3 - Production Pipeline | Observability | Canvas | Interview: design a full pipeline with monitoring |

### `architecture-streaming-realtime` - Real-Time & Streaming (5 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Streaming Basics | Producers, consumers | Quiz | Recognize: core streaming vocabulary |
| 2 - Processing Patterns | Stateless vs stateful | Quiz, Tradeoff | Understand trade-offs between approaches |
| 3 - Delivery Guarantees | At-least-once, exactly-once | Constraints, Constraints | Apply: design under delivery constraints |
| 4 - Sessionization Pipeline | Real-time session detection | Canvas | Interview: full streaming pipeline design |

### `architecture-data-quality` - Data Quality & Schema Evolution (5 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - DQ Checks | Basic validations | Quiz | Recognize: types of quality checks |
| 2 - DQ Framework | Great Expectations, dbt tests | Constraints | Apply: design a testing framework |
| 3 - Schema Registry | Avro, Protobuf | Constraints, Tradeoff | Apply: schema management decisions |
| 4 - Schema Evolution | Backward/forward compatibility | Canvas | Interview: design evolution strategy |

### `architecture-cdc` - Change Data Capture (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - CDC Fundamentals | Log-based vs query-based | Quiz | Recognize: CDC approaches |
| 2 - CDC Pipeline | Debezium + Kafka | Constraints, Constraints | Apply: design CDC under constraints |
| 3 - Merge & Upsert | Apply CDC events | Canvas | Interview: end-to-end CDC to analytical store |

### `architecture-lakehouse` - Data Lake & Lakehouse (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Lake vs Warehouse | Trade-offs | Quiz | Recognize: when to use which |
| 2 - Table Formats | Delta, Iceberg, Hudi | Tradeoff, Tradeoff | Apply: format selection with constraints |
| 3 - Medallion Architecture | Bronze, silver, gold | Canvas | Interview: design a medallion lakehouse |

### `architecture-idempotent-backfill` - Idempotency & Backfill (4 questions)
Prereq: `architecture-batch-etl`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Idempotent Patterns | MERGE, DELETE+INSERT | Quiz | Recognize: idempotent write strategies |
| 2 - Backfill Design | Parallel, checkpointed | Constraints, Constraints | Apply: design backfill under production constraints |
| 3 - Production Scenarios | Late data, reprocessing | Canvas | Interview: full reprocessing scenario |

---

## Debug (5 tracks, 21 planned questions)

Debug tracks use Predict/Quiz at early levels (spot the bug conceptually), then Debug/Fix for hands-on practice, then Review/Incident for interview-level analysis.

### `debug-join-bugs` - Join Type Bugs (5 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Wrong JOIN Type | INNER vs LEFT vs FULL | Predict, Quiz | Recognize: predict wrong output from wrong join |
| 2 - WHERE Kills Outer | Predicate placement | Debug/Fix | Apply: fix the WHERE-on-NULL bug |
| 3 - Fan-Out Duplicates | One-to-many explosion | Debug/Fix, Debug/Fix | Apply: two fan-out scenarios |
| 4 - Mixed Join Bugs | Multiple issues at once | Review | Interview: review a query with several join bugs |

### `debug-null-bugs` - NULL Comparison Bugs (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - NULL Equality | = NULL vs IS NULL | Predict, Quiz | Recognize: predict three-valued logic behavior |
| 2 - NULL in Aggregates | COUNT, AVG, SUM | Debug/Fix, Debug/Fix | Apply: fix aggregate NULL bugs |
| 3 - NULL Logic Chains | NOT IN with NULL | Debug/Fix | Interview: the classic NOT IN trap |

### `debug-groupby-agg` - GROUP BY & Aggregate Bugs (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Missing GROUP BY | Non-aggregated columns | Predict, Quiz | Recognize: predict the error/wrong result |
| 2 - Wrong Aggregate | SUM vs COUNT, double-counting | Debug/Fix, Debug/Fix | Apply: two aggregate bug scenarios |
| 3 - Aggregate + NULL | NULL impact on results | Debug/Fix | Interview: subtle NULL + aggregate interaction |

### `debug-filter-offbyone` - Filter & Off-By-One (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Wrong Operator | < vs <= | Predict, Quiz | Recognize: predict boundary behavior |
| 2 - BETWEEN Boundaries | Inclusive semantics, date traps | Debug/Fix, Debug/Fix | Apply: two BETWEEN edge cases |
| 3 - Date Boundary Bugs | Midnight cutoff | Debug/Fix | Interview: timestamp vs date boundary |

### `debug-window-bugs` - Window Function Bugs (4 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Wrong Partition | Missing/incorrect PARTITION BY | Predict, Quiz | Recognize: predict wrong window scope |
| 2 - Frame Errors | ROWS vs RANGE | Debug/Fix, Debug/Fix | Apply: fix frame specification bugs |
| 3 - Order Mismatch | Wrong ORDER BY, tie-breaking | Debug/Fix | Interview: subtle ordering bug |

---

## Python (5 tracks, 34 planned questions)

Python tracks use Predict/Parsons early (PySpark API is verbose - assembly helps), then Write, then Translate for SQL-PySpark bridge.

### `python-dataframe-basics` - DataFrame Basics (8 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Basic Filter | filter, col | Predict, Quiz | Recognize: predict filter output |
| 2 - Complex Conditions | AND/OR, isin | Parsons, Write | Reproduce: assemble conditions, then write |
| 3 - Select & Rename | select, alias, drop | Write | Apply: column operations |
| 4 - Simple GroupBy | groupBy, count | Write | Apply: basic aggregation |
| 5 - Multiple Aggregations | agg with sum, avg | Write, Write | Apply: multi-function aggregation |
| 6 - Conditional Aggregation | when/otherwise | Write | Interview: CASE-equivalent in PySpark |

### `python-joins` - DataFrame Joins (5 questions)
Prereq: `python-dataframe-basics`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Inner Join | join on key | Predict, Quiz | Recognize: predict join result |
| 2 - Left & Anti Joins | left_outer, left_anti | Write | Apply: anti-join pattern in PySpark |
| 3 - Multi-Key Join | Composite key, dedup cols | Write, Write | Apply: real-world join complexity |
| 4 - Broadcast Join | broadcast optimization | Write | Interview: optimization pattern |

### `python-windows` - Windows & Running Stats (8 questions)
Prereq: `python-dataframe-basics`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - ROW_NUMBER | row_number over Window | Predict, Quiz | Recognize: predict window output |
| 2 - Ranking Functions | rank, dense_rank | Parsons, Write | Reproduce: assemble Window spec |
| 3 - Running Totals | Cumulative sum/avg | Write, Write | Apply: two cumulative scenarios |
| 4 - LAG & LEAD | Previous/next row | Write | Apply: PySpark lag/lead |
| 5 - Rolling Average | rangeBetween, rowsBetween | Write, Write | Apply: two rolling window scenarios |
| 6 - Cumulative Distinct | approx_count_distinct | Write | Interview: advanced window pattern |

### `python-data-cleaning` - Data Cleaning & Transforms (8 questions)
No prereq

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Drop Duplicates | dropDuplicates | Predict, Quiz | Recognize: predict dedup behavior |
| 2 - Null Handling | fillna, coalesce | Write, Write | Apply: two null-handling scenarios |
| 3 - withColumn | Add/transform columns | Write | Apply: column transformation |
| 4 - Conditional Logic | when/otherwise | Write, Write | Apply: two conditional scenarios |
| 5 - Dedup with Window | row_number dedup | Write | Interview: common PySpark pattern |
| 6 - UDF Creation | Python UDF | Write | Interview: UDF with explicit types |

### `python-performance` - Performance & I/O (5 questions)
Prereq: `python-dataframe-basics`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Repartition & Coalesce | Partition control | Quiz, Predict | Recognize: when to use which |
| 2 - Cache & Persist | Caching strategies | Write | Apply: cache a reused DataFrame |
| 3 - Partitioned Writes | partitionBy, write | Write, Write | Apply: two I/O scenarios |
| 4 - Optimization Patterns | Pushdown, pruning | Review | Interview: review code for optimization opportunities |

---

## Modeling (4 tracks, 20 planned questions)

Modeling tracks use Quiz early, then guided Design (subset of requirements), then full Design, with Evolve as the capstone type (modify an existing model for new requirements).

### `modeling-star-schema` - Star Schema Design (5 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Facts vs Dimensions | Identify measures vs attributes | Quiz | Recognize: classify columns as facts or dimensions |
| 2 - Define the Grain | Transaction vs snapshot | Quiz, Design | Understand grain, then design a simple schema |
| 3 - Surrogate Keys | Natural vs surrogate | Design, Design | Apply: two key design scenarios |
| 4 - Complete Star Schema | Full schema from requirements | Design | Interview: end-to-end schema design |

### `modeling-scd` - Slowly Changing Dimensions (5 questions)
Prereq: `modeling-star-schema`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - SCD Type 1 | Overwrite, no history | Quiz | Recognize: when Type 1 is appropriate |
| 2 - SCD Type 2 | Versioned rows | Quiz, Design | Understand concept, then design Type 2 columns |
| 3 - SCD Type 2 Impl | Merge logic, current flag | Design, Design | Apply: two implementation scenarios |
| 4 - SCD Type 3 & Hybrid | Previous value columns | Design | Interview: choose and design the right SCD type |

### `modeling-kimball-inmon-vault` - Kimball vs Inmon vs Vault (5 questions)
Prereq: `modeling-star-schema`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Kimball Approach | Dimensional modeling | Quiz | Recognize: Kimball vocabulary and principles |
| 2 - Inmon Approach | 3NF enterprise DW | Quiz | Recognize: Inmon vocabulary and contrast with Kimball |
| 3 - Data Vault 2.0 | Hubs, links, satellites | Design, Design | Apply: model a Data Vault schema |
| 4 - Methodology Selection | When to use which | Design | Interview: choose methodology for given requirements |

### `modeling-dimension-patterns` - Dimension Patterns (5 questions)
Prereq: `modeling-star-schema`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Degenerate Dimensions | Dims in the fact table | Quiz | Recognize: identify degenerate dimensions |
| 2 - Junk Dimensions | Low-cardinality flags | Design | Apply: design a junk dimension |
| 3 - Role-Playing Dimensions | Multiple date/geo roles | Design, Design | Apply: two role-playing scenarios |
| 4 - Bridge Tables | Many-to-many | Design | Interview: bridge table with weighting factors |

---

## Tools/Spark (5 tracks, 32 planned questions)

Tools tracks use Quiz at early levels, then introduce Predict (predict execution plans), Tradeoff, and Review/Incident for interview-level depth. Most Spark interview questions are conceptual or analytical rather than write-code, so Quiz/Tradeoff/Review dominate.

### `tools-spark-architecture` - Spark Architecture (13 questions)

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Driver & Executors | Process roles | Quiz | Recognize: driver vs executor responsibilities |
| 2 - DAG Execution | Stages, tasks, shuffles | Quiz, Quiz | Understand: DAG creation and stage boundaries |
| 3 - Shuffle Internals | Shuffle process | Quiz | Understand: shuffle write/read mechanics |
| 4 - Predicting Execution | Trace code to plan | Predict, Predict | Apply: predict DAG stages and shuffle output |
| 5 - Architecture Trade-offs | Strategy evaluation | Tradeoff, Tradeoff | Apply: evaluate broadcast vs shuffle, repartition strategies |
| 6 - Production Incidents | Failure investigation | Incident, Incident | Interview: diagnose OOM and skew incidents |
| 7 - Code Quality | Review & optimize | Review, Review, Review | Interview: review Spark code for anti-patterns |

### `tools-spark-partitioning` - Partitioning & Shuffles (4 questions)
Prereq: `tools-spark-architecture`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Partition Basics | Repartition, coalesce | Quiz, Quiz | Recognize: partition concepts and when to use each |
| 2 - Shuffle Operations | Which ops cause shuffles | Quiz | Understand: identify wide vs narrow transformations |
| 3 - Data Skew | Diagnose and fix skew | Tradeoff | Interview: evaluate skew mitigation strategies |

### `tools-spark-caching-memory` - Caching & Memory (4 questions)
Prereq: `tools-spark-architecture`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Cache & Persist | When and how to cache | Quiz | Recognize: cache vs persist vs unpersist |
| 2 - Memory Model | Unified memory manager | Quiz | Understand: storage vs execution memory |
| 3 - Resource Management | Dynamic allocation, tuning | Quiz, Quiz | Apply: resource configuration decisions |

### `tools-spark-joins` - Spark Joins (5 questions)
Prereq: `tools-spark-partitioning`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Broadcast Joins | Small-large table joins | Quiz | Recognize: broadcast join mechanics |
| 2 - Sort-Merge & Hash | Large-table join strategies | Quiz, Quiz | Understand: join algorithm selection |
| 3 - Skew Joins & Plans | Handle join skew, read plans | Tradeoff, Review | Interview: evaluate join strategies, review query plans |

### `tools-spark-structured-streaming` - Structured Streaming (6 questions)
Prereq: `tools-spark-architecture`

| Level | Title | Types | Rationale |
|-------|-------|-------|-----------|
| 1 - Streaming Fundamentals | Micro-batch, output modes | Quiz, Quiz, Quiz | Recognize: core streaming concepts (3 questions due to breadth) |
| 2 - Watermarks & Late Data | Watermark mechanics | Quiz | Understand: watermark behavior |
| 3 - State & Exactly-Once | State management, checkpoints | Quiz, Quiz | Interview: deep streaming concepts |

---

## Question Counts by Type

Projected distribution across all 41 tracks:

| Type | Count | % | Notes |
|------|-------|---|-------|
| Write | 74 | 37% | Core practice type for SQL and Python |
| Quiz | 52 | 26% | Foundation of every track's Level 1 |
| Predict | 22 | 11% | Key scaffold for recognizing patterns |
| Debug/Fix | 14 | 7% | Debug skill's primary type |
| Design | 14 | 7% | Modeling skill's primary type |
| Parsons | 6 | 3% | Assembly practice for verbose APIs |
| Constraints | 6 | 3% | Architecture mid-levels |
| Tradeoff | 7 | 4% | Architecture + Tools evaluation |
| Canvas | 5 | 3% | Architecture capstones |
| Review | 7 | 4% | Interview-level code analysis |
| Reverse | 1 | 1% | Used sparingly |
| Incident | 2 | 1% | Tools track capstone |
| **Total** | **200** | | |

## Content Creation Priority

Build question types in this order (matching product-strategy.md Tier 1):

1. **Write** - highest volume, already built, most tracks need more
2. **Quiz** - already built, every track Level 1 needs them
3. **Predict** - Tier 1 planned type, used in 16+ tracks at Level 1
4. **Debug/Fix** - already built, debug tracks need more content
5. **Design** - already built, modeling tracks need more content
6. **Constraints/Canvas** - already built, architecture tracks need more content
7. **Parsons** - Tier 1 planned type, used in ~6 tracks
8. **Reverse/Review/Tradeoff/Incident** - Tier 1-2 planned types
