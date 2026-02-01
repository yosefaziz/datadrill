# DataDrill - Claude Code Instructions

## Project Purpose

DataDrill is an interactive practice platform designed to **empower data engineers to ace any data engineering interview at senior/staff level**. The app provides hands-on practice with instant feedback across multiple skill tracks that mirror real interview scenarios.

**Live at:** https://thedatadrill.vercel.app

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Code Editor:** Monaco Editor
- **SQL Execution:** DuckDB-WASM (runs entirely in browser)
- **Python Execution:** Pyodide (WebAssembly Python runtime)
- **Routing:** React Router v7
- **Build:** Vite + TSX for scripts
- **Deployment:** Vercel

## Architecture Overview

```
src/
├── components/           # React components
│   ├── architecture/     # Architecture skill components
│   ├── editor/           # Code editor and output panel
│   ├── layout/           # App layout, header, error boundary
│   ├── question-view/    # Question display components
│   └── questions/        # Question list, cards, filters
├── hooks/                # Custom React hooks
│   ├── useExecutor.ts    # Code execution hook
│   └── useValidation.ts  # Answer validation hook
├── pages/                # Route pages
│   ├── HomePage.tsx      # Skill selection
│   ├── SkillPage.tsx     # Question list for a skill
│   └── QuestionPage.tsx  # Individual question view
├── services/             # Business logic
│   ├── duckdb/           # DuckDB-WASM service
│   ├── executors/        # Code execution (SQL, PySpark)
│   ├── pyspark/          # Pyodide PySpark simulation
│   └── validation/       # Answer validation
├── stores/               # Zustand state stores
│   ├── questionStore.ts  # Questions and filters
│   ├── editorStore.ts    # Editor state
│   └── architectureStore.ts # Architecture skill state
└── types/                # TypeScript types

questions/                # Question markdown files (source of truth)
├── sql/
├── pyspark/
├── debug/
└── architecture/

scripts/
└── processQuestions.ts   # Builds questions from markdown to JSON

public/questions/         # Generated JSON (gitignored, built at deploy)
```

## Skill Types

1. **SQL** - Write queries from scratch against sample tables
2. **PySpark** - Write DataFrame transformations (executed via Pyodide)
3. **Debug** - Fix broken SQL or PySpark code
4. **Architecture** - Select clarifying questions, then choose an architecture based on revealed constraints

## Key Patterns

### Adding a New Skill Type

1. Add to `SkillType` union in `src/types/index.ts`
2. Create question interface extending base or create new structure
3. Add type guard function (`isXxxQuestion`)
4. Update `questionStore.ts` initial state
5. Update `HomePage.tsx` SKILLS array
6. Update `SkillPage.tsx` SKILL_NAMES and SKILL_DESCRIPTIONS
7. Update `QuestionPage.tsx` to handle the new skill
8. Update `processQuestions.ts` to parse the new format
9. Create question markdown files in `questions/<skill>/`

### Question Format

Questions are authored in Markdown with YAML frontmatter. See:
- `questions/sql/medium/top-customers.md` for SQL/PySpark/Debug format
- `questions/architecture/README.md` for Architecture format

The build script (`npm run process-questions`) converts these to JSON in `public/questions/`.

### Validation Flow

For code-based skills (SQL, PySpark, Debug):
1. User writes code in Monaco editor
2. "Run" executes against visible data, shows results
3. "Submit" validates against visible + hidden datasets
4. All datasets must pass for success

For Architecture skill:
1. User selects N clarifying questions
2. Constraints are revealed based on selections
3. User chooses an architecture
4. Scoring: crucial (+10), helpful (+5), irrelevant (-5)

### State Management

- `questionStore` - Questions list, current question, filters
- `editorStore` - Code editor content
- `architectureStore` - Architecture skill phase and selections

## Commands

```bash
npm run dev              # Start dev server (processes questions first)
npm run build            # Production build
npm run process-questions # Convert markdown questions to JSON
npm run lint             # ESLint
npx vercel --prod        # Deploy to production
```

## Code Style

- Functional React components with hooks
- TypeScript strict mode
- Tailwind for all styling (no CSS files)
- Zustand for state (no Redux, no Context for global state)
- Discriminated unions for question types
- Type guards for narrowing question types

## Testing Questions Locally

1. Create/edit markdown in `questions/<skill>/<difficulty>/`
2. Run `npm run dev`
3. Navigate to the skill and question
4. Verify all phases work correctly

## Important Files

- `src/types/index.ts` - All TypeScript interfaces and type guards
- `scripts/processQuestions.ts` - Question build script
- `src/services/duckdb/DuckDBService.ts` - SQL execution engine
- `src/services/pyspark/PySparkService.ts` - Python/PySpark execution
- `src/pages/QuestionPage.tsx` - Main question routing logic

## Common Tasks

### Add a new question
1. Create markdown file in appropriate `questions/<skill>/<difficulty>/` folder
2. Follow existing format (check similar questions)
3. Run `npm run dev` to test
4. Commit and deploy

### Modify scoring logic
- SQL/PySpark/Debug: `src/services/validation/ResultValidator.ts`
- Architecture: `src/services/validation/ArchitectureValidator.ts`

### Change UI layout
- Question view: `src/components/question-view/QuestionViewLayout.tsx`
- Architecture view: `src/components/architecture/ArchitectureQuestionView.tsx`

## Deployment

The app deploys to Vercel. The build process:
1. Runs `process-questions` to generate JSON from markdown
2. TypeScript compilation
3. Vite production build
4. Static files served from `dist/`

All execution happens client-side (DuckDB-WASM, Pyodide) - no backend needed.
