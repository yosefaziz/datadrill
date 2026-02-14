# Track Prioritization Framework

Governs which solution playbook tracks exist in DataDrill. Every track must justify its presence - more tracks means more maintenance, slower content completion, and a diluted user experience.

## Target Persona

Mid/Senior Data Engineer (2-5 years experience) preparing for interviews at top-tier tech companies.

## Scoring Rubric

Score each track 1-3 on four dimensions. **Keep >= 9. Cut <= 6. Discuss 7-8.**

### Interview Frequency (1-3)

How often does this pattern come up in real DE interviews?

- **3** - Almost every DE interview loop includes this
- **2** - Shows up in ~30-50% of interviews or at specific company tiers
- **1** - Rare or niche (only relevant at very specific companies)

### Signal-to-Noise (1-3)

Does this topic differentiate strong candidates from weak ones?

- **3** - High signal - interviewers use this to separate levels (e.g., sessionization, retention cohorts)
- **2** - Moderate signal - shows competence but doesn't strongly differentiate
- **1** - Low signal - most prepared candidates get this right regardless

### Platform Fit (1-3)

Is DataDrill the right format to learn this, vs. reading a blog post or watching a video?

- **3** - Hands-on practice is essential (writing SQL, debugging code, building models)
- **2** - Mixed - some concepts are better learned by doing, some by reading
- **1** - Mostly conceptual knowledge - a good article teaches it better

### Completion Effort (1-3, inverted)

How much work remains to finish this track?

- **3** - Most/all questions already exist
- **2** - Partial, but structure is solid
- **1** - Mostly empty, would need significant content creation

## Current Inventory (41 tracks)

### SQL (16 tracks)

| Track | Freq | Signal | Fit | Effort | Total | Rationale |
|-------|------|--------|-----|--------|-------|-----------|
| `agg-groupby` | 3 | 1 | 3 | 3 | 10 | Foundational, every interview |
| `window-ranking` | 3 | 2 | 3 | 3 | 11 | Every interview |
| `window-lag-lead` | 3 | 2 | 3 | 3 | 11 | Every interview |
| `window-rolling` | 3 | 2 | 3 | 3 | 11 | Very common |
| `joins-multi` | 3 | 2 | 3 | 3 | 11 | Every interview |
| `dedup` | 3 | 2 | 3 | 3 | 11 | Extremely common |
| `subquery-filter` | 3 | 2 | 3 | 2 | 10 | Common |
| `self-join` | 2 | 2 | 3 | 3 | 10 | Common |
| `anti-joins` | 2 | 2 | 3 | 2 | 9 | Common pattern, distinct from subquery |
| `retention-cohort` | 2 | 3 | 3 | 1 | 9 | High signal for analytics-heavy roles |
| `sessionization` | 2 | 3 | 3 | 1 | 9 | High signal, hard to practice elsewhere |
| `funnel-conversion` | 2 | 3 | 3 | 1 | 9 | Common in product analytics |
| `yoy-growth` | 2 | 2 | 3 | 1 | 8 | Common metric question |
| `active-users` | 2 | 2 | 3 | 1 | 8 | Common metric question |
| `gaps-islands` | 1 | 3 | 3 | 1 | 8 | High signal when it comes up |
| `engagement-analytics` | 2 | 2 | 3 | 1 | 8 | Distinct from retention/funnel |

### Architecture (6 tracks)

| Track | Freq | Signal | Fit | Effort | Total | Rationale |
|-------|------|--------|-----|--------|-------|-----------|
| `batch-etl` | 3 | 2 | 2 | 2 | 9 | Foundational |
| `streaming-realtime` | 3 | 2 | 2 | 2 | 9 | Foundational |
| `data-quality` | 2 | 2 | 2 | 2 | 8 | Comes up frequently |
| `cdc` | 2 | 3 | 2 | 1 | 8 | Increasingly common |
| `lakehouse` | 2 | 2 | 2 | 1 | 7 | Modern DE standard |
| `idempotent-backfill` | 2 | 3 | 2 | 1 | 8 | High signal topic |

### Debug (5 tracks)

| Track | Freq | Signal | Fit | Effort | Total | Rationale |
|-------|------|--------|-----|--------|-------|-----------|
| `join-bugs` | 3 | 2 | 3 | 3 | 11 | Most common SQL bug category |
| `null-bugs` | 3 | 2 | 3 | 3 | 11 | Second most common |
| `groupby-agg` | 3 | 2 | 3 | 3 | 11 | Very common |
| `filter-offbyone` | 2 | 2 | 3 | 2 | 9 | Practical and common |
| `window-bugs` | 2 | 2 | 3 | 1 | 8 | Relevant given window function prevalence |

### Python (5 tracks)

| Track | Freq | Signal | Fit | Effort | Total | Rationale |
|-------|------|--------|-----|--------|-------|-----------|
| `dataframe-basics` | 3 | 1 | 3 | 3 | 10 | Foundational |
| `joins` | 3 | 2 | 3 | 3 | 11 | Every PySpark interview |
| `data-cleaning` | 2 | 2 | 3 | 1 | 8 | Very common |
| `windows` | 2 | 2 | 3 | 1 | 8 | Common for PySpark roles |
| `performance` | 2 | 3 | 2 | 1 | 8 | High signal for senior roles |

### Modeling (4 tracks)

| Track | Freq | Signal | Fit | Effort | Total | Rationale |
|-------|------|--------|-----|--------|-------|-----------|
| `star-schema` | 3 | 2 | 2 | 2 | 9 | Foundational, asked everywhere |
| `scd` | 3 | 3 | 2 | 1 | 9 | Very high frequency |
| `kimball-inmon-vault` | 2 | 2 | 1 | 1 | 6 | Common conceptual question |
| `dimension-patterns` | 2 | 2 | 2 | 1 | 7 | Useful advanced topic |

### Tools/Spark (5 tracks)

| Track | Freq | Signal | Fit | Effort | Total | Rationale |
|-------|------|--------|-----|--------|-------|-----------|
| `spark-architecture` | 3 | 2 | 2 | 3 | 10 | Foundational for Spark roles |
| `spark-partitioning` | 3 | 3 | 2 | 3 | 11 | High signal |
| `spark-joins` | 3 | 2 | 2 | 3 | 10 | Very common |
| `spark-structured-streaming` | 2 | 2 | 2 | 2 | 8 | Increasingly common |
| `spark-caching-memory` | 2 | 2 | 2 | 2 | 8 | Common performance question |

## Previously Cut Tracks (21)

These tracks were evaluated and removed (Feb 2026):

| Skill | Track | Total | Cut Reason |
|-------|-------|-------|------------|
| SQL | `set-operations` | 6 | Rarely a standalone interview topic |
| SQL | `date-string-json` | 5 | Utility functions, not a pattern |
| SQL | `median-percentile` | 5 | Niche |
| SQL | `pivot-unpivot` | 5 | Niche, syntax varies by engine |
| SQL | `recursive-cte` | 5 | Rare in DE interviews |
| SQL | `query-optimization` | 6 | Better as architecture/tools content |
| SQL | `attribution-bucketing` | 5 | Adtech-specific |
| Architecture | `lambda-kappa` | 5 | Theoretical, better as a blog post |
| Architecture | `clickstream` | 5 | Too specific a use case |
| Architecture | `gdpr-deletion` | 5 | Niche compliance topic |
| Architecture | `advanced-systems` | 4 | Vague grab bag |
| Debug | `case-order` | 5 | Minor topic |
| Debug | `subquery-bugs` | 6 | Lower frequency |
| Debug | `type-cast` | 5 | Lower frequency |
| Python | `reshaping` | 6 | Moderate frequency, lower signal |
| Python | `python-coding` | 5 | Better served by LeetCode |
| Modeling | `snowflake-vs-star` | 5 | Overlaps with star-schema |
| Modeling | `factless-fact` | 5 | Niche |
| Modeling | `wide-table-activity` | 5 | Modern but not established in interviews |
| Tools | `spark-rdd-dataframe` | 5 | RDDs fading from interviews |
| Tools | `spark-sql-catalyst` | 5 | Niche/advanced internals |

## Process for Adding New Tracks

1. Score the proposed track on all four dimensions
2. Must score >= 9 to be added without discussion
3. Scores 7-8 require explicit justification for why this track clears the bar despite a lower score
4. Scores <= 6 are rejected
5. Check for overlap with existing tracks - a new track should cover a distinct pattern, not a variant of something already covered
6. Add the scored row to the relevant table above

## Process for Re-evaluating Existing Tracks

Trigger a review when:
- A track has been in the inventory for 3+ months with < 3 questions created
- User analytics show consistently low engagement on a track
- Interview trends shift (e.g., a technology falls out of favor)

Re-score using the same rubric. If the score has dropped below 7, discuss cutting it.
