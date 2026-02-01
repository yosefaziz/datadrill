# DataDrill

**Purpose:** Empower data engineers to ace any interview at senior/staff level with hands-on practice and instant feedback.

**Live:** https://thedatadrill.vercel.app

## Workflow: After Adding Features

```bash
npm run build                 # Verify build passes
git add -A && git commit -m "Your message"
git push
npx vercel --prod             # Deploy to https://thedatadrill.vercel.app
```

## Tech Stack

React 18 + TypeScript + Vite + Tailwind + Zustand + Monaco Editor

- **SQL Execution:** DuckDB-WASM (browser)
- **Python/PySpark:** Pyodide (WebAssembly)
- **Deployment:** Vercel (static, no backend)

## Project Structure

```
src/
├── components/          # UI components by feature
├── pages/               # HomePage, SkillPage, QuestionPage
├── services/            # DuckDB, PySpark, validators
├── stores/              # Zustand: questionStore, editorStore, architectureStore
├── hooks/               # useExecutor, useValidation
└── types/index.ts       # All interfaces + type guards

questions/               # Markdown source files
├── sql/easy|medium|hard/
├── pyspark/
├── debug/
└── architecture/

scripts/processQuestions.ts  # Converts markdown → JSON at build time
```

## Skills

| Skill | Description | Validation |
|-------|-------------|------------|
| SQL | Write queries from scratch | Run against hidden datasets |
| PySpark | DataFrame transformations | Run against hidden datasets |
| Debug | Fix broken code | Run against hidden datasets |
| Architecture | Select questions → choose architecture | Scoring: crucial +10, helpful +5, irrelevant -5 |

## Adding a New Skill

1. `src/types/index.ts` - Add to `SkillType`, create interface, add type guard
2. `src/stores/questionStore.ts` - Add to initial state
3. `src/pages/HomePage.tsx` - Add to SKILLS array
4. `src/pages/SkillPage.tsx` - Add name/description
5. `src/pages/QuestionPage.tsx` - Handle rendering
6. `scripts/processQuestions.ts` - Parse new format
7. `questions/<skill>/` - Create markdown files

## Adding Questions

1. Create `questions/<skill>/<difficulty>/<name>.md`
2. Use YAML frontmatter (see existing questions for format)
3. `npm run dev` to test
4. Commit, push, deploy

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript types |
| `src/pages/QuestionPage.tsx` | Main routing logic |
| `src/services/validation/ResultValidator.ts` | SQL/PySpark/Debug scoring |
| `src/services/validation/ArchitectureValidator.ts` | Architecture scoring |
| `scripts/processQuestions.ts` | Build script |

## Commands

```bash
npm run dev       # Dev server
npm run build     # Production build
npm run lint      # ESLint
npx vercel --prod # Deploy to production
```

## Code Conventions

- Functional components + hooks
- Tailwind only (no CSS files)
- Zustand for global state
- Discriminated unions + type guards for question types
- All execution client-side (no backend)
