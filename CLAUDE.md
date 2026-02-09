# DataDrill

Interview prep platform for data professionals (DE, DA, analytics engineering). React 18 + TypeScript + Vite + Tailwind + Zustand + Monaco Editor. All execution client-side via DuckDB-WASM (SQL) and Pyodide (Python/PySpark).

**Live:** https://thedatadrill.vercel.app

## Commands

```bash
npm run dev       # Dev server (runs process-questions first)
npm run build     # Production build: process-questions → tsc -b → vite build
npm run lint      # ESLint
npx vercel --prod # Deploy to production
```

Always run `npm run build` to verify changes before claiming work is complete.

## Code Conventions

**Imports:**
- `@/*` path aliases for cross-directory imports — never `../../` across directories
- Relative `./` only within the same directory
- Order: React/third-party → `@/` aliases → local `./` relatives

**Components:**
- Named exports only — no `export default` (sole exception: `App.tsx`)
- Props interface named `{ComponentName}Props`, destructured in function signature
- Functional components + hooks only (`ErrorBoundary` is the only class component — required for `getDerivedStateFromError`)

**Stores (Zustand):**
- Pattern: `create<State>((set, get) => ({...}))` with explicit state interface
- Only stores with async setup get `initialize()` — called from `AppLayout`
- Use `get()` to read current state in actions, spread operator for immutable updates

**Types:**
- Discriminated unions on `skill` and `questionType` fields for question types
- Type guards in `src/types/index.ts` for runtime narrowing — never use `as` casts for question types
- New question types must add: interface + type guard + union member in `src/types/index.ts`

**Styling:**
- Tailwind only — no CSS files, no inline styles
- CSS variable colors only — never hardcoded colors (`bg-white`, `text-black`, etc.)
- Border: use `border-border-color` not `border` for theme border color (common mistake — `border` sets width, not color)
- Cards: `bg-surface rounded-xl shadow-lg ring-1 ring-white/5`
- Modals: fixed inset-0 backdrop, Escape key handler, `aria-modal`

**Supabase:**
- Every Supabase call must check `isSupabaseConfigured` first — app works without it
- Graceful degradation: if not configured, return early and set loading to false — never throw
- Destructure `{ data, error }` from responses, always check error

**React patterns:**
- Async effects must handle cleanup (mounted flags or request IDs to prevent stale updates)
- Effects with listeners/timers must return cleanup functions
- Env vars: `import.meta.env.VITE_*` - optional features typed as `string | undefined`

**Writing:**
- Never use em-dashes (-) - use hyphens (-) instead

## Gotchas — Do Not "Fix" These

- **Build warnings expected:** Pyodide node module externalization warnings and chunk size >500KB (Monaco + DuckDB) are normal
- **`noUnusedLocals` / `noUnusedParameters` enforced** in tsconfig — prefix unused params with `_`
- **`supabase` client is `null as unknown as SupabaseClient`** when not configured — intentional, guarded by `isSupabaseConfigured`
- **`fetchQuestion()` does NOT reset `currentQuestion` to null** before loading — prevents UI flash during navigation
- **`authStore` skips user update on token refresh** (checks same user ID) — prevents unnecessary profile re-fetch
- **All localStorage keys use `datadrill-` prefix** — don't change it
- **Anonymous users have 2-submission limit per question** — enforced in `submissionStore.canSubmit()`
- **Questions are JSON at runtime** — markdown is only source format, processed at build time by `scripts/processQuestions.ts`

## Project Structure

```
src/
├── components/          # UI components by feature
│   ├── architecture/    # Architecture question views (constraints, canvas, quiz)
│   ├── auth/            # AuthModal, AuthCallback, UserMenu, ProtectedRoute
│   ├── editor/          # Code editor components
│   ├── history/         # Past submissions
│   ├── layout/          # AppLayout, nav
│   ├── modeling/        # Modeling question views
│   ├── onboarding/      # OnboardingModal
│   ├── question-view/   # Shared QuestionViewLayout
│   ├── questions/       # Question listing/filtering
│   └── stats/           # Dashboard components
├── pages/               # HomePage, SkillPage, QuestionPage, ProfilePage, DashboardPage, HistoryPage
├── services/            # DuckDB, PySpark, validators, executors
├── stores/              # Zustand stores
├── hooks/               # useExecutor, useValidation, useDuckDB, useQuery, useAnonymousTracking
├── lib/supabase.ts      # Supabase client singleton
└── types/index.ts       # All interfaces + type guards

questions/               # Markdown source files (YAML frontmatter + markdown)
├── sql/easy|medium|hard/
├── python/easy|medium/
├── debug/easy|medium/
├── architecture/constraints|canvas|quiz/
└── modeling/easy|medium|hard/

scripts/processQuestions.ts  # Build script: markdown → JSON
supabase/migrations/         # Database schema migrations
docs/                        # Strategy and planning documents
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript types, discriminated unions, type guards |
| `src/pages/QuestionPage.tsx` | Main question routing logic |
| `src/services/validation/ValidatorFactory.ts` | Validator factory — routes to correct validator |
| `src/services/validation/ResultValidator.ts` | SQL/Python/Debug scoring |
| `src/stores/authStore.ts` | Auth state + onAuthStateChange listener |
| `src/stores/questionStore.ts` | Question data, filtering, fetching |
| `src/stores/submissionStore.ts` | Submission tracking + anonymous limits |
| `src/lib/supabase.ts` | Supabase client singleton + `isSupabaseConfigured` guard |
| `scripts/processQuestions.ts` | Build script: markdown → JSON |

## Development Workflows

### Adding a New Question Type

1. `src/types/index.ts` — Add type to discriminated union, create interface, add type guard
2. `src/services/validation/` — Create validator (implement `IValidator`), register in `ValidatorFactory`
3. `src/components/` — Create view component (or extend existing `QuestionViewLayout`)
4. `scripts/processQuestions.ts` — Parse new YAML frontmatter format
5. `questions/<skill>/` — Create sample questions
6. `src/pages/QuestionPage.tsx` — Wire into question rendering

### Adding a New Skill

1. `src/types/index.ts` — Add to `SkillType`, create interface, add type guard
2. `src/stores/questionStore.ts` — Add to initial state
3. `src/pages/HomePage.tsx` — Add to SKILLS array
4. `src/pages/SkillPage.tsx` — Add name/description
5. `src/pages/QuestionPage.tsx` — Handle rendering
6. `scripts/processQuestions.ts` — Parse new format
7. `questions/<skill>/` — Create markdown files

### Adding Questions

1. Create `questions/<skill>/<difficulty>/<name>.md` with YAML frontmatter
2. `npm run dev` to test
3. Commit, push, deploy

## Product Strategy & Roadmap

See `docs/product-strategy.md` for vision, question types, feature priority, and monetization plan.
