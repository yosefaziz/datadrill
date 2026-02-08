# DataDrill — Product Strategy

## Vision

Become the default platform data professionals use to prepare for interviews — like LeetCode for SWE, but purpose-built for DE/DA/analytics roles. Long-term: run real data tools in-browser (notebooks, dbt, Airflow) so practice mirrors actual work environments.

## Positioning

Interview-first. The platform has two complementary experiences:

1. **Interview Questions** (primary) — Question bank of interview-direct question types. Users practice the same formats they'll face in real interviews.
2. **Solution Playbooks** (secondary) — Progressive concept paths that build pattern recognition from simple to interview-realistic complexity. Triggered when users struggle with interview questions. Can include scaffold types and additional question formats beyond pure interview questions.

Scaffold types (Predict, Parsons, Translate) are the early levels of solution playbooks, not standalone features.

## Target Users

1. **Interview preppers** (primary) — DE, DA, analytics engineering candidates preparing for specific interviews
2. **Skill builders** (secondary) — Data professionals filling knowledge gaps via progressive paths
3. **Companies** (B2B future) — Hiring teams screening candidates across all data roles (DE, DA, data science, analytics engineering)

## Competitive Position

No existing platform covers this space:
- **LeetCode:** SWE-focused, no DE content, only tests "write code + pass tests"
- **StrataScratch / DataLemur:** Question banks only — no structured practice, no in-browser execution
- **HackerRank / CodeSignal:** Employer-facing assessments, not candidate-facing practice
- **Interviewing.io / Pramp:** Require a live partner, not available on-demand
- **dataexpert.io:** Video courses, not interactive practice

DataDrill's differentiators: full cognitive spectrum (Bloom's Taxonomy), in-browser execution (DuckDB + Pyodide), progressive solution playbooks, and structured mock interviews — all free, no setup.

## Development Principles

1. Interview-realism first — every feature must pass: "would this help in a real DE interview?"
2. Low-maintenance by design — no external API dependencies, no content that goes stale, no manual curation needed
3. Zero-friction UX — in-browser execution, no setup, instant practice

## Monetization

- **Phase 1 (now):** 100% free platform + data engineering Substack (content marketing, linked from platform). Win adoption through quality.
- **Phase 2:** Video courses (dataexpert.io model — paid courses alongside free platform).
- **Phase 3 (B2B):** Companies pay to use DataDrill for candidate screening across data roles — mock interview sessions, company dashboards, candidate reports.
- **Long-term:** Full B2B platform for data team interviews (DE + DA + data science + analytics engineering). Run real tools in-browser (notebooks, dbt, Airflow).

No individual paywall. All practice content and features free for end users.

## Growth

Product-led. Build features that create shareable moments (mock interview scorecards, skill profiles). Substack as content funnel. Target r/dataengineering, LinkedIn DE communities through word-of-mouth.

## Two-Experience UX Model

### Interview Prep (main experience)

Users browse interview questions by skill → difficulty → topic. Question types mirror real interview formats: Write, Reverse, Optimize, Review, Stepwise, Incident, Tradeoff, etc.

### Solution Playbooks (triggered by struggle)

When a user fails X attempts on questions involving a specific concept (e.g., window functions), the platform recommends a solution playbook:

> "Struggling with window functions? Try the Window Functions playbook."

Each path progressively layers complexity:
- **Level 1:** Single concept — e.g., `RANK()` (scaffold: Predict/Parsons)
- **Level 2:** Concept + modifier — e.g., `RANK()` + `PARTITION BY`
- **Level 3:** Two concepts combined — e.g., window function + CTE
- **Level N:** Interview-realistic — e.g., window function + CTE + self-join + GROUP BY

Scaffold types (Predict, Parsons, Translate) are the early levels. Interview-direct types (Write, Reverse, Optimize) are the later levels. The playbook ends at the complexity level the user was originally stuck on.

**Weak concept detection:** Mechanism TBD — options include tag-based pass/fail tracking, decomposed scoring, or self-reporting. Decision deferred until playbooks are built.

### Separate pages

- `/interview` or skill pages — interview questions bank
- `/paths` — solution playbook browser and progress tracking

## Difficulty Framework

**Current state:** Easy/Medium/Hard are author-assigned labels — subjective and inconsistent. Treat these as approximate until a deterministic framework exists.

**Future state:** Difficulty determined by concept composition — number of concepts combined, interaction complexity between concepts, and proximity to real interview problems. The solution playbook levels provide the natural difficulty gradient.

## Question Types

17 types across 5 skills, covering all levels of Bloom's Taxonomy:

| Type | Bloom's Level | Skill | Status | Category |
|------|--------------|-------|--------|----------|
| Write | Apply | SQL, PySpark | Built | Interview |
| Debug/Fix | Apply | SQL, PySpark | Built | Interview |
| Constraints | Evaluate | Architecture | Built | Interview |
| Canvas | Create | Architecture | Built | Interview |
| Quiz | Remember | Architecture | Built | Interview |
| Modeling/Design | Create | Modeling | Built | Interview |
| Predict | Understand | SQL, PySpark | Planned | Scaffold |
| Reverse | Analyze | SQL, PySpark | Planned | Interview |
| Review | Analyze | SQL, PySpark | Planned | Interview |
| Parsons/Build | Understand-Apply | SQL, PySpark | Planned | Scaffold |
| Optimize | Evaluate | SQL | Planned | Interview |
| Stepwise | Apply-Create | SQL, PySpark | Planned | Interview |
| Translate | Apply-Analyze | SQL-PySpark | Planned | Scaffold |
| Tradeoff | Evaluate | Architecture | Planned | Interview |
| Incident | Analyze-Evaluate | Debug | Planned | Interview |
| Evolve | Create | Modeling | Planned | Scaffold |

- **12 interview types** appear in the main question bank
- **5 scaffold types** (Predict, Parsons, Translate, Evolve, Quiz) are building blocks within solution playbooks
- See `new-question-types-plan.md` for detailed rationale, research backing, and implementation specs

## Skills

| Skill | Description | Question Types | Validation |
|-------|-------------|----------------|------------|
| SQL | Write queries from scratch | Write + new types | Run against hidden datasets |
| Python | DataFrame transformations (PySpark, Pandas, general) | Write + new types | Run against hidden datasets |
| Debug | Fix broken code | Fix, Review, Incident | Run against hidden datasets / scoring |
| Architecture | System design questions | Constraints, Canvas, Quiz, Tradeoff | Scoring: crucial +10, helpful +5, irrelevant -5 |
| Modeling | Data model design | Design, Evolve | Kanban-style column assignment |

**Note:** Python track replaces PySpark — broader scope with subcategories via tags (pyspark, pandas, general). Existing PySpark questions move under Python with a `pyspark` tag.

## Content Quality

- All questions must be validated against DuckDB (SQL) or Pyodide (Python) — no broken questions ship
- Each question is tagged with specific concepts it tests (e.g., `window-functions`, `CTEs`, `GROUP BY`)
- Questions within a solution playbook must have clear concept progression — each level adds exactly one new concept
- Interview-direct questions should mirror real interview formats, not textbook exercises
- LLM-assisted generation, human-validated against local execution
- Questions use YAML frontmatter + markdown, processed by `scripts/processQuestions.ts` at build time

## Key Product Decisions

Decisions already made (see `new-question-types-plan.md` for full rationale):

- **Users think in skills, not question types** — skill tracks are primary navigation, question types are properties (badges on cards), not categories to navigate into
- **Type badges with color-coded cognitive groupings** — blue=building code, purple=analysis, green=judgment, orange=design, teal=predict
- **Mock Interview as top-nav entry** — separate from skill-based practice: "Skills = learn at my pace" vs "Mock Interview = simulate a real interview"
- **URL structure stays flat** — type encoded in question ID by naming convention (e.g., `/sql/question/predict-window-function-1`), no new routes needed
- **Randomized mock sessions via pool-based templates** — define round slots by skill/type/difficulty, client randomly selects matching questions at session start
- **No Interview Focus toggle** — solution playbooks replace this. Users who struggle with interview questions get guided to playbooks; no need for a mode switch

## Feature Priority

**Tier 1 (next to build):**
- New question types: Predict → Reverse → Review → Parsons → Optimize (in priority order)
- Mock Interview Sessions (timed, scored, shareable)
- Question volume: target 100+ questions across all types

**Tier 2 (after Tier 1):**
- Remaining question types: Stepwise, Translate, Tradeoff, Incident, Evolve
- Solution Playbooks (progressive concept paths with scaffold types)
- Shareable skill profiles / public scorecards
- Substack integration (link from platform)

**Tier 3 (B2B readiness):**
- Company dashboard (send assessments, view candidate results)
- Custom interview session builder
- Candidate reports / analytics
- Video courses

**Tier 4 (long-term vision):**
- Expand to all data roles (data science, analytics engineering)
- In-browser notebooks, dbt, Airflow
- Full B2B data team interview platform

## Success Metrics

- **Phase 1 (adoption):** Monthly active users, questions attempted per user, return rate (7-day, 30-day)
- **Phase 2 (engagement):** Mock interviews completed, solution playbooks started/finished, Substack subscribers
- **Phase 3 (B2B):** Companies onboarded, assessments sent, candidate completion rates
