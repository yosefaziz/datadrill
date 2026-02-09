# Validation Rules for Generated Questions

## All Question Types

- [ ] YAML frontmatter parses without errors
- [ ] `title` is 3-5 words, no quotes needed inside
- [ ] `difficulty` is exactly "Easy", "Medium", or "Hard"
- [ ] `tags` array has 2-4 relevant tags
- [ ] File is in correct `questions/{skill}/{difficulty}/` directory
- [ ] Filename matches the question ID referenced in track YAML
- [ ] `npm run build` succeeds with the new file

## SQL Questions

- [ ] `tables` array has 1-3 tables with `visible_data` and `hidden_datasets`
- [ ] `visible_data` has 3-7 rows with realistic data
- [ ] `hidden_datasets` has exactly 2 datasets
- [ ] Hidden datasets have same column schema as visible_data
- [ ] Hidden datasets include edge cases (NULLs, ties, empty groups)
- [ ] `expected_output_query` is valid DuckDB SQL
- [ ] Expected output query produces correct results against visible_data
- [ ] Expected output query produces correct results against both hidden datasets
- [ ] Expected Output markdown table matches the query result on visible_data
- [ ] Column names in expected output use snake_case
- [ ] ORDER BY is included if row order matters

## Python (PySpark) Questions

- [ ] Same table rules as SQL
- [ ] `expected_output_query` uses PySpark API (not pandas)
- [ ] Result is assigned to variable named `result`
- [ ] `"pyspark"` is in the tags array
- [ ] Code runs successfully in Pyodide environment
- [ ] Problem description mentions storing result in `result`

## Debug Questions

- [ ] `language` field is present (usually "sql")
- [ ] `broken_code` contains exactly ONE bug
- [ ] `broken_code` produces wrong results (not a syntax error)
- [ ] `expected_output_query` is the correct fix
- [ ] `hint` points toward the bug without giving away the fix
- [ ] The bug is realistic (occurs in production code)
- [ ] The difference between broken and fixed is clearly identifiable

## Architecture Quiz Questions

- [ ] `question` is a clear, specific question
- [ ] `multi_select` is true or false
- [ ] `answers` has exactly 4 options (a-d)
- [ ] At least one answer is correct
- [ ] Each answer has an `explanation`
- [ ] Wrong answers are plausible (not obviously wrong)
- [ ] `explanation` field provides overall concept teaching
- [ ] No ambiguous questions where multiple answers could be argued

## Architecture Constraints Questions

- [ ] `prompt` describes a vague scenario
- [ ] `clarifying_questions` has 6-10 questions
- [ ] Mix of `crucial`, `helpful`, and `irrelevant` categories
- [ ] `crucial` questions have `reveals` with constraint/value
- [ ] `architecture_options` has 3-4 options
- [ ] At least one option is valid given crucial constraints
- [ ] `valid_when` conditions reference actual constraint names
- [ ] `feedback_if_wrong` explains why the choice was wrong
- [ ] `max_questions` is 3 (standard)

## Modeling Questions

- [ ] `prompt` describes a realistic business scenario
- [ ] `constraint` names the modeling pattern
- [ ] `fields` has 8-12 fields with varying cardinality
- [ ] Each field has `id`, `name`, `data_type`, `description`, `cardinality`, `sample_values`
- [ ] `expected_tables` covers all fields across fact and dimension tables
- [ ] Each table has `type`, `name`, `required_fields`, `optional_fields`, `feedback`
- [ ] `score_thresholds` has `storage` and `query_cost` with `green`/`yellow` values
- [ ] Fact tables contain measures and foreign keys
- [ ] Dimension tables contain descriptive attributes

## LLM-as-Judge Rubric (Architecture & Modeling)

For questions without deterministic validation, evaluate on:

1. **Correctness** (40%) — Is the answer technically accurate?
2. **Completeness** (30%) — Does it cover all important aspects?
3. **Trade-off awareness** (20%) — Does it acknowledge alternatives?
4. **Communication** (10%) — Is it clearly explained?
