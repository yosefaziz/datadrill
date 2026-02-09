# Question Generation Framework

How to generate questions to fill Solution Playbooks using Claude Code.

## Generation Session Workflow

1. **Read coverage** — `questions/coverage.json` shows which concepts have 0 questions
2. **Pick a playbook** — Choose a track YAML from `questions/{skill}/tracks/`
3. **Read the track** — Understand levels, concepts, and question IDs expected
4. **Read examples** — Read 2-3 existing questions of the same type for format reference
5. **Read sources** (optional) — Check `questions/sources/` for company-specific patterns
6. **Generate questions** — Create .md files matching the expected question IDs
7. **Validate** — Run `npm run build` to verify parsing
8. **Update coverage** — Regenerate `coverage.json` by scanning .md files

## File Locations

| File | Purpose |
|------|---------|
| `questions/taxonomy.json` | Concept taxonomy with tags and difficulty levels |
| `questions/coverage.json` | Current coverage matrix (skill × difficulty × concept) |
| `questions/{skill}/tracks/*.yaml` | Track definitions with expected question IDs |
| `questions/{skill}/{difficulty}/*.md` | Question files |
| `questions/sources/*.md` | Company interview pattern files (user-curated) |
| `docs/generation/prompt-templates.md` | Prompt templates per question type |
| `docs/generation/validation-rules.md` | Validation checklist per type |

## Question ID Convention

Question IDs must match what's referenced in track YAML files:

- SQL: `{track-short}-{descriptor}` — e.g., `agg-basic-count`, `join-three-table`
- Python: `py-{track-short}-{descriptor}` — e.g., `py-filter-basic`, `py-groupby-count`
- Debug: `dbg-{track-short}-{descriptor}` — e.g., `dbg-join-wrong-type`, `dbg-null-equality`
- Architecture: `arch-{track-short}-{descriptor}` — e.g., `arch-etl-fundamentals`
- Modeling: `model-{track-short}-{descriptor}` — e.g., `model-star-facts-dims`

The question ID is derived from the .md filename (without extension). The file must be placed in the correct `{skill}/{difficulty}/` directory.

## Difficulty Mapping

| Track Level | Typical Difficulty |
|-------------|-------------------|
| Level 1 | Easy |
| Level 2 | Easy or Medium |
| Level 3 | Medium |
| Level 4+ | Medium or Hard |

## Data Design Rules

For SQL and Python questions with tables:

1. **Visible data**: 3-7 rows, realistic names/values, enough to show the pattern
2. **Hidden datasets**: 2 datasets for validation, different sizes, edge cases
3. **Edge cases to include**: NULLs, ties, boundary values, empty groups
4. **Column names**: snake_case, descriptive, consistent across questions in a track
5. **Data types**: Use integers for IDs, decimals for money, dates as YYYY-MM-DD strings

## Anti-Slop Rules

- No "Let's dive in" or "In this challenge" phrasing
- No unnecessary hints that give away the answer
- No overly long problem descriptions — 2-4 sentences max
- No contrived scenarios — use realistic business contexts
- Expected output tables must match the visible_data (not hidden)
- Question titles should be concise (3-5 words)
