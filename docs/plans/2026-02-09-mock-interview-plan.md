# Mock Interview Sessions - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete Mock Interview feature with curated multi-round scenarios, timed sessions, and scorecard results.

**Architecture:** Interview scenarios are YAML files processed to JSON at build time (same pattern as questions/tracks). A new `interviewStore` manages session state client-side. Three views: lobby (pick scenario), active session (timed rounds with no back button), and results (scorecard). Reuses existing question view components for rendering rounds.

**Tech Stack:** React 18, TypeScript, Zustand, Tailwind, existing DuckDB/Pyodide executors, js-yaml for build processing

**Design doc:** `docs/plans/2026-02-09-mock-interview-design.md`

---

## Task 1: Add Interview Types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add interview types after the SkillTrack section (after line 329)**

Add these types before the `QueryResult` interface (line 331):

```typescript
// ── Interview Types ──────────────────────────────────────────────

export type InterviewCategory = 'coding' | 'system_design';
export type InterviewLevel = 'junior' | 'mid' | 'senior' | 'staff';

export interface InterviewQuizOption {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface InterviewRound {
  id: string;
  type: SkillType;
  questionType: string;
  timeMinutes: number;
  title: string;
  description: string;
  // Code round fields
  initialCode?: string;
  tables?: TableData[];
  hiddenTables?: TableData[];
  expectedOutput?: string;
  expectedOutputQuery?: string;
  language?: 'sql' | 'python';
  hints?: string[];
  // Quiz round fields
  questions?: InterviewQuizOption[];
}

export interface InterviewScenarioMeta {
  id: string;
  category: InterviewCategory;
  level: InterviewLevel;
  title: string;
  description: string;
  estimatedMinutes: number;
  roundCount: number;
  tags: string[];
}

export interface InterviewScenario extends InterviewScenarioMeta {
  rounds: InterviewRound[];
}

export interface RoundResult {
  roundId: string;
  passed: boolean;
  score: number;
  timeSpentSeconds: number;
  answer: string;
  resultMeta: Record<string, unknown> | null;
}

export interface InterviewSessionResult {
  scenarioId: string;
  category: InterviewCategory;
  level: InterviewLevel;
  startedAt: string;
  completedAt: string | null;
  roundResults: RoundResult[];
  overallScore: number;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build passes (types are just added, not yet consumed)

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(interview): add interview session types"
```

---

## Task 2: Build Pipeline - Process Interview YAML Files

**Files:**
- Modify: `scripts/processQuestions.ts`

**Reference:** Follow exact pattern from track processing (lines 722-799 of processQuestions.ts).

**Step 1: Add interview YAML interfaces after the track types (after line 384)**

```typescript
// ── Interview scenario types ────────────────────────────────────

interface InterviewQuizOptionYaml {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface InterviewRoundYaml {
  id: string;
  type: SkillType;
  question_type: string;
  time_minutes: number;
  title: string;
  description: string;
  initial_code?: string;
  tables?: TableFrontmatter[];
  hidden_tables?: TableFrontmatter[];
  expected_output?: string;
  expected_output_query?: string;
  language?: 'sql' | 'python';
  hints?: string[];
  questions?: InterviewQuizOptionYaml[];
}

interface InterviewScenarioYaml {
  id: string;
  category: 'coding' | 'system_design';
  level: 'junior' | 'mid' | 'senior' | 'staff';
  title: string;
  description: string;
  estimated_minutes: number;
  tags: string[];
  rounds: InterviewRoundYaml[];
}

interface ProcessedInterviewRound {
  id: string;
  type: SkillType;
  questionType: string;
  timeMinutes: number;
  title: string;
  description: string;
  initialCode?: string;
  tables?: ProcessedTable[];
  hiddenTables?: ProcessedTable[];
  expectedOutput?: string;
  expectedOutputQuery?: string;
  language?: 'sql' | 'python';
  hints?: string[];
  questions?: { question: string; options: string[]; correctAnswer: number; explanation: string }[];
}

interface ProcessedInterviewScenario {
  id: string;
  category: 'coding' | 'system_design';
  level: 'junior' | 'mid' | 'senior' | 'staff';
  title: string;
  description: string;
  estimatedMinutes: number;
  tags: string[];
  rounds: ProcessedInterviewRound[];
}

interface ProcessedInterviewMeta {
  id: string;
  category: 'coding' | 'system_design';
  level: 'junior' | 'mid' | 'senior' | 'staff';
  title: string;
  description: string;
  estimatedMinutes: number;
  roundCount: number;
  tags: string[];
}
```

**Step 2: Add interview processing function (after the `processQuestion` function, before `processQuestions`)**

```typescript
function processInterviewRound(round: InterviewRoundYaml): ProcessedInterviewRound {
  const processed: ProcessedInterviewRound = {
    id: round.id,
    type: round.type,
    questionType: round.question_type,
    timeMinutes: round.time_minutes,
    title: round.title,
    description: round.description,
  };

  if (round.initial_code) processed.initialCode = round.initial_code;
  if (round.tables) processed.tables = round.tables.map(processTable);
  if (round.hidden_tables) processed.hiddenTables = round.hidden_tables.map(processTable);
  if (round.expected_output) processed.expectedOutput = round.expected_output;
  if (round.expected_output_query) processed.expectedOutputQuery = round.expected_output_query;
  if (round.language) processed.language = round.language;
  if (round.hints) processed.hints = round.hints;
  if (round.questions) {
    processed.questions = round.questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
    }));
  }

  return processed;
}
```

**Step 3: Add interview processing to `processQuestions()` function (after the skill loop, before the global index write, around line 800)**

```typescript
  // ── Process interview scenarios ───────────────────────────────
  const interviewsDir = path.join(questionsDir, 'interviews');
  const interviewsOutputDir = path.join(process.cwd(), 'public', 'interviews');
  fs.mkdirSync(interviewsOutputDir, { recursive: true });

  if (fs.existsSync(interviewsDir)) {
    const interviewFiles = (await glob('**/*.yaml', { cwd: interviewsDir })).concat(
      await glob('**/*.yml', { cwd: interviewsDir })
    );

    const interviewMetas: ProcessedInterviewMeta[] = [];

    for (const file of interviewFiles) {
      try {
        const content = fs.readFileSync(path.join(interviewsDir, file), 'utf-8');
        const data = yaml.load(content) as InterviewScenarioYaml;

        const scenario: ProcessedInterviewScenario = {
          id: data.id,
          category: data.category,
          level: data.level,
          title: data.title,
          description: data.description,
          estimatedMinutes: data.estimated_minutes,
          tags: data.tags,
          rounds: data.rounds.map(processInterviewRound),
        };

        // Write individual scenario file
        fs.writeFileSync(
          path.join(interviewsOutputDir, `${data.id}.json`),
          JSON.stringify(scenario, null, 2)
        );

        interviewMetas.push({
          id: data.id,
          category: data.category,
          level: data.level,
          title: data.title,
          description: data.description,
          estimatedMinutes: data.estimated_minutes,
          roundCount: data.rounds.length,
          tags: data.tags,
        });

        console.log(`Processed interview: ${file}`);
      } catch (error) {
        console.error(`Error processing interview ${file}:`, error);
      }
    }

    // Write interview index
    fs.writeFileSync(
      path.join(interviewsOutputDir, 'index.json'),
      JSON.stringify(interviewMetas, null, 2)
    );

    console.log(`\nProcessed ${interviewMetas.length} interview scenarios.`);
  } else {
    // No interviews directory yet - write empty index
    fs.writeFileSync(
      path.join(interviewsOutputDir, 'index.json'),
      '[]'
    );
  }
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build passes, logs "Processed 0 interview scenarios." (no YAML files yet)

**Step 5: Commit**

```bash
git add scripts/processQuestions.ts
git commit -m "feat(interview): extend build pipeline to process interview YAML scenarios"
```

---

## Task 3: Create Sample Interview Scenario

**Files:**
- Create: `questions/interviews/coding/junior/basic-sql-aggregation.yaml`

This is a minimal but complete scenario to test the build pipeline and develop the UI against.

**Step 1: Create directory structure**

```bash
mkdir -p questions/interviews/coding/junior
mkdir -p questions/interviews/coding/mid
mkdir -p questions/interviews/coding/senior
mkdir -p questions/interviews/coding/staff
mkdir -p questions/interviews/system_design/junior
mkdir -p questions/interviews/system_design/mid
mkdir -p questions/interviews/system_design/senior
mkdir -p questions/interviews/system_design/staff
```

**Step 2: Create a sample coding interview scenario**

Create `questions/interviews/coding/junior/basic-sql-aggregation.yaml`:

```yaml
id: coding-junior-basic-sql-aggregation
category: coding
level: junior
title: "SQL Aggregation Basics"
description: "Write basic aggregation queries, then explain your understanding of how GROUP BY works."
estimated_minutes: 20
tags: [aggregation, group-by, count]

rounds:
  - id: round-1
    type: sql
    question_type: write
    time_minutes: 8
    title: "Count Orders by Status"
    description: |
      Given an `orders` table, write a query that returns the count of orders
      for each status. Order the results by count descending.
    initial_code: ""
    tables:
      - name: orders
        visible_data: |
          order_id,customer_id,status,amount
          1,101,completed,50.00
          2,102,pending,30.00
          3,101,completed,75.00
          4,103,cancelled,20.00
          5,102,completed,60.00
          6,104,pending,45.00
        hidden_datasets:
          - |
            order_id,customer_id,status,amount
            1,201,completed,100.00
            2,202,pending,50.00
            3,203,completed,75.00
            4,204,cancelled,25.00
            5,205,completed,60.00
            6,206,completed,80.00
            7,207,pending,35.00
            8,208,cancelled,90.00
    expected_output: |
      status,order_count
      completed,3
      pending,2
      cancelled,1
    expected_output_query: |
      SELECT status, COUNT(*) as order_count
      FROM orders
      GROUP BY status
      ORDER BY order_count DESC
    hints:
      - "Use COUNT(*) with GROUP BY"
      - "ORDER BY can reference aliases"

  - id: round-2
    type: quiz
    question_type: quiz
    time_minutes: 4
    title: "Explain Your Approach"
    description: "Let's make sure you understand how GROUP BY works under the hood."
    questions:
      - question: "What happens if you SELECT a column that is not in GROUP BY and not aggregated?"
        options:
          - "SQL error - column must be in GROUP BY or an aggregate"
          - "It returns the first value found"
          - "It returns NULL"
          - "It returns all values concatenated"
        correct_answer: 0
        explanation: "Standard SQL requires that every selected column is either in the GROUP BY clause or wrapped in an aggregate function. Most databases will raise an error."
      - question: "If you used COUNT(customer_id) instead of COUNT(*), what would be different?"
        options:
          - "COUNT(column) skips NULLs, COUNT(*) counts all rows"
          - "No difference - they always return the same result"
          - "COUNT(column) is faster"
          - "COUNT(*) skips NULLs"
        correct_answer: 0
        explanation: "COUNT(*) counts all rows including those with NULL values. COUNT(column) only counts rows where that specific column is not NULL."

  - id: round-3
    type: sql
    question_type: write
    time_minutes: 8
    title: "Revenue by Status"
    description: |
      Now extend your analysis: write a query that returns each status with
      both the order count and total revenue (sum of amount). Only include
      statuses with total revenue above 50. Order by total revenue descending.
    initial_code: ""
    tables:
      - name: orders
        visible_data: |
          order_id,customer_id,status,amount
          1,101,completed,50.00
          2,102,pending,30.00
          3,101,completed,75.00
          4,103,cancelled,20.00
          5,102,completed,60.00
          6,104,pending,45.00
        hidden_datasets:
          - |
            order_id,customer_id,status,amount
            1,201,completed,100.00
            2,202,pending,50.00
            3,203,completed,75.00
            4,204,cancelled,25.00
            5,205,completed,60.00
            6,206,completed,80.00
            7,207,pending,35.00
            8,208,cancelled,90.00
    expected_output: |
      status,order_count,total_revenue
      completed,3,185.00
      pending,2,75.00
    expected_output_query: |
      SELECT status, COUNT(*) as order_count, SUM(amount) as total_revenue
      FROM orders
      GROUP BY status
      HAVING SUM(amount) > 50
      ORDER BY total_revenue DESC
    hints:
      - "Use HAVING to filter after GROUP BY"
      - "SUM() for total revenue"
```

**Step 3: Verify build processes the scenario**

Run: `npm run build`
Expected: Logs "Processed interview: coding/junior/basic-sql-aggregation.yaml" and "Processed 1 interview scenarios."

**Step 4: Verify output files exist**

```bash
cat public/interviews/index.json
cat public/interviews/coding-junior-basic-sql-aggregation.json | head -20
```

Expected: index.json contains one entry, scenario JSON has all rounds with camelCase field names.

**Step 5: Commit**

```bash
git add questions/interviews/ public/interviews/
git commit -m "content(interview): add sample junior coding interview scenario"
```

---

## Task 4: Build the Interview Store

**Files:**
- Create: `src/stores/interviewStore.ts`

**Reference:** Follow `src/stores/trackStore.ts` pattern exactly.

**Step 1: Create the store**

Create `src/stores/interviewStore.ts`:

```typescript
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  InterviewScenarioMeta,
  InterviewScenario,
  RoundResult,
  InterviewSessionResult,
} from '@/types';

interface InterviewState {
  // Catalog
  scenarios: InterviewScenarioMeta[];
  scenariosLoading: boolean;
  scenariosById: Record<string, InterviewScenario>;

  // Active session
  activeScenario: InterviewScenario | null;
  currentRoundIndex: number;
  roundResults: RoundResult[];
  sessionStartedAt: number | null;
  roundStartedAt: number | null;
  isComplete: boolean;

  // Session history
  sessionHistory: InterviewSessionResult[];

  // Actions
  fetchScenarios: () => Promise<void>;
  fetchScenario: (scenarioId: string) => Promise<void>;
  startSession: (scenarioId: string) => void;
  submitRound: (result: Omit<RoundResult, 'roundId'>) => void;
  nextRound: () => void;
  endSession: () => void;
  resetSession: () => void;
  saveSessionToSupabase: (userId: string) => Promise<void>;
  fetchSessionHistory: (userId: string) => Promise<void>;
  getCurrentRound: () => InterviewScenario['rounds'][number] | null;
  getOverallScore: () => number;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  scenarios: [],
  scenariosLoading: false,
  scenariosById: {},
  activeScenario: null,
  currentRoundIndex: 0,
  roundResults: [],
  sessionStartedAt: null,
  roundStartedAt: null,
  isComplete: false,
  sessionHistory: [],

  fetchScenarios: async () => {
    if (get().scenarios.length > 0) return;

    set({ scenariosLoading: true });
    try {
      const response = await fetch('/interviews/index.json');
      if (!response.ok) {
        set({ scenariosLoading: false });
        return;
      }
      const scenarios: InterviewScenarioMeta[] = await response.json();
      set({ scenarios, scenariosLoading: false });
    } catch {
      set({ scenariosLoading: false });
    }
  },

  fetchScenario: async (scenarioId: string) => {
    if (get().scenariosById[scenarioId]) return;

    set({ scenariosLoading: true });
    try {
      const response = await fetch(`/interviews/${scenarioId}.json`);
      if (!response.ok) {
        set({ scenariosLoading: false });
        return;
      }
      const scenario: InterviewScenario = await response.json();
      set((state) => ({
        scenariosById: { ...state.scenariosById, [scenarioId]: scenario },
        scenariosLoading: false,
      }));
    } catch {
      set({ scenariosLoading: false });
    }
  },

  startSession: (scenarioId: string) => {
    const scenario = get().scenariosById[scenarioId];
    if (!scenario) return;

    const now = Date.now();
    set({
      activeScenario: scenario,
      currentRoundIndex: 0,
      roundResults: [],
      sessionStartedAt: now,
      roundStartedAt: now,
      isComplete: false,
    });
  },

  submitRound: (result) => {
    const { activeScenario, currentRoundIndex, roundResults } = get();
    if (!activeScenario) return;

    const round = activeScenario.rounds[currentRoundIndex];
    if (!round) return;

    const roundResult: RoundResult = {
      roundId: round.id,
      ...result,
    };

    set({ roundResults: [...roundResults, roundResult] });
  },

  nextRound: () => {
    const { activeScenario, currentRoundIndex } = get();
    if (!activeScenario) return;

    const nextIndex = currentRoundIndex + 1;
    if (nextIndex >= activeScenario.rounds.length) {
      // Last round - end session
      get().endSession();
      return;
    }

    set({
      currentRoundIndex: nextIndex,
      roundStartedAt: Date.now(),
    });
  },

  endSession: () => {
    set({ isComplete: true });
  },

  resetSession: () => {
    set({
      activeScenario: null,
      currentRoundIndex: 0,
      roundResults: [],
      sessionStartedAt: null,
      roundStartedAt: null,
      isComplete: false,
    });
  },

  saveSessionToSupabase: async (userId: string) => {
    if (!isSupabaseConfigured) return;

    const { activeScenario, roundResults, sessionStartedAt } = get();
    if (!activeScenario) return;

    const overallScore = get().getOverallScore();

    const { error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: userId,
        scenario_id: activeScenario.id,
        category: activeScenario.category,
        level: activeScenario.level,
        started_at: sessionStartedAt ? new Date(sessionStartedAt).toISOString() : new Date().toISOString(),
        completed_at: new Date().toISOString(),
        overall_score: overallScore,
        round_results: roundResults,
      });

    if (error) {
      console.error('Failed to save interview session:', error);
    }
  },

  fetchSessionHistory: async (userId: string) => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch session history:', error);
      return;
    }

    const sessions: InterviewSessionResult[] = (data || []).map((row) => ({
      scenarioId: row.scenario_id,
      category: row.category,
      level: row.level,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      roundResults: row.round_results as RoundResult[],
      overallScore: row.overall_score,
    }));

    set({ sessionHistory: sessions });
  },

  getCurrentRound: () => {
    const { activeScenario, currentRoundIndex } = get();
    if (!activeScenario) return null;
    return activeScenario.rounds[currentRoundIndex] ?? null;
  },

  getOverallScore: () => {
    const { activeScenario, roundResults } = get();
    if (!activeScenario || roundResults.length === 0) return 0;

    const totalRounds = activeScenario.rounds.length;
    const totalScore = roundResults.reduce((sum, r) => sum + r.score, 0);
    return totalScore / totalRounds;
  },
}));
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/stores/interviewStore.ts
git commit -m "feat(interview): add interviewStore for session state management"
```

---

## Task 5: Add Routes and InterviewPage

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/InterviewPage.tsx`

**Step 1: Create InterviewPage**

Create `src/pages/InterviewPage.tsx`:

```typescript
import { useParams, useLocation } from 'react-router-dom';
import { InterviewLobby } from '@/components/interview/InterviewLobby';

export function InterviewPage() {
  const { scenarioId } = useParams<{ scenarioId?: string }>();
  const location = useLocation();
  const isResults = location.pathname.endsWith('/results');

  // No scenario selected - show lobby
  if (!scenarioId) {
    return <InterviewLobby />;
  }

  // Results view
  if (isResults) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="text-text-secondary">Results view - coming in Task 9</div>
      </div>
    );
  }

  // Active session
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-center">
      <div className="text-text-secondary">Session view - coming in Task 7</div>
    </div>
  );
}
```

**Step 2: Add routes to App.tsx**

In `src/App.tsx`, add the import after line 12:

```typescript
import { InterviewPage } from '@/pages/InterviewPage';
```

Add the interview routes BEFORE the `/:skill` catch-all route (before line 46). The order is critical - `/interview` must come before `/:skill` or it will be caught as a skill:

```typescript
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/interview/:scenarioId" element={<InterviewPage />} />
            <Route path="/interview/:scenarioId/results" element={<InterviewPage />} />
```

**Step 3: Create a placeholder InterviewLobby**

Create `src/components/interview/InterviewLobby.tsx`:

```typescript
import { useEffect } from 'react';
import { useInterviewStore } from '@/stores/interviewStore';

export function InterviewLobby() {
  const { scenarios, scenariosLoading, fetchScenarios } = useInterviewStore();

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  if (scenariosLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Mock Interview</h1>
      <p className="text-text-secondary mb-8">Lobby placeholder - {scenarios.length} scenarios available</p>
    </div>
  );
}
```

**Step 4: Verify build and that /interview route works**

Run: `npm run build`
Expected: Build passes

Run: `npm run dev` and navigate to `/interview`
Expected: Shows "Mock Interview" heading with scenario count

**Step 5: Commit**

```bash
git add src/pages/InterviewPage.tsx src/components/interview/InterviewLobby.tsx src/App.tsx
git commit -m "feat(interview): add interview routes and placeholder pages"
```

---

## Task 6: Build the Interview Lobby

**Files:**
- Modify: `src/components/interview/InterviewLobby.tsx`

**Step 1: Build the full lobby component**

Replace the placeholder `InterviewLobby.tsx` with the full implementation. The lobby shows two category sections (Coding Interview, System Design Interview), each with level cards showing available scenarios.

Reference patterns:
- Card style: `bg-surface rounded-xl shadow-lg ring-1 ring-white/5` (from HomePage)
- Difficulty badges: same color scheme as question difficulty badges
- Loading state: skeleton cards (from HomePage)
- Navigation: `Link` to `/interview/{scenarioId}` (like skill cards link to `/{skill}`)

The lobby should:
1. Fetch scenarios on mount via `useInterviewStore().fetchScenarios()`
2. Group scenarios by category, then by level
3. Render two sections: "Coding Interview" and "System Design Interview"
4. Each section has a grid of level cards (Junior / Mid / Senior / Staff)
5. Each level card shows the available scenarios within that level
6. Clicking a scenario navigates to `/interview/{scenarioId}`
7. Levels with no scenarios show "Coming Soon" in a disabled card
8. Level badge colors: Junior=green, Mid=yellow, Senior=orange, Staff=red

Use `useAuthGate` hook to prompt sign-in when clicking a scenario if not authenticated. Import pattern: `import { useAuthGate } from '@/hooks/useAuthGate';`

**Step 2: Verify in dev server**

Run: `npm run dev` and navigate to `/interview`
Expected: Shows the lobby with 1 scenario in "Coding Interview > Junior" section, other levels show "Coming Soon"

**Step 3: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 4: Commit**

```bash
git add src/components/interview/InterviewLobby.tsx
git commit -m "feat(interview): build interview lobby with category and level cards"
```

---

## Task 7: Build the Interview Session

**Files:**
- Create: `src/components/interview/InterviewSession.tsx`
- Create: `src/components/interview/InterviewSessionHeader.tsx`
- Create: `src/components/interview/InterviewRoundView.tsx`
- Modify: `src/pages/InterviewPage.tsx`

This is the core experience - the timed, multi-round interview session.

**Step 1: Build InterviewSessionHeader**

Create `src/components/interview/InterviewSessionHeader.tsx`:

Shows: round progress dots/steps, countdown timer, "End Interview" button.

The timer should:
- Count down from `round.timeMinutes * 60` seconds
- Display as `MM:SS`
- Turn amber below 60 seconds
- Turn red below 30 seconds
- Call `onTimeUp()` callback when reaching 0
- Use `useEffect` with `setInterval` (1 second tick), clean up on unmount
- Reset when `roundStartedAt` or `currentRoundIndex` changes

Round progress:
- Show numbered circles/dots for each round
- Current round is highlighted with `bg-primary`
- Completed rounds show checkmark (passed=green) or X (failed=red)
- Future rounds are dim

The "End Interview" button should show a confirmation modal before ending.

**Step 2: Build InterviewRoundView**

Create `src/components/interview/InterviewRoundView.tsx`:

This routes to the correct question view based on `round.type` and `round.questionType`. It needs to:

1. Accept the current `InterviewRound` as a prop
2. For code rounds (sql/python write, debug fix): Construct a Question-like object from the round data and render `QuestionViewLayout` with `useExecutor` and `useValidation`
3. For quiz rounds: Render `InterviewQuizRound` (Task 8)
4. Expose an `onSubmit(passed: boolean, score: number, answer: string)` callback

For code rounds, the round data must be adapted to match the `Question` type:
```typescript
// Adapting an InterviewRound to a Question for QuestionViewLayout
const adaptedQuestion: SqlQuestion = {
  id: round.id,
  skill: 'sql',
  title: round.title,
  difficulty: 'Medium', // Not used in interview context
  tags: [],
  description: round.description,
  expectedOutput: round.expectedOutput || '',
  tables: round.tables || [],
  expectedOutputQuery: round.expectedOutputQuery || '',
};
```

Note: The `QuestionViewLayout` expects `onRun` and `onSubmit` callbacks. In interview mode, `onSubmit` triggers validation then calls the parent's submission handler. The community features (tabs, discussions, solutions, bug reports, timer widget) are NOT shown in interview mode - only the question description and code editor.

**Important:** Rather than forcing the adapted question through QuestionViewLayout (which has breadcrumbs, tabs, community features), it may be cleaner to build a simpler interview-specific code view that reuses just `CodeEditor` and `OutputPanel` directly with `PanelGroup`. This avoids fighting against QuestionViewLayout's opinions. The simpler view needs:
- Left panel: round title + description (rendered as HTML)
- Right panel top: CodeEditor (Monaco)
- Right panel bottom: OutputPanel
- "Run" and "Submit" buttons

**Step 3: Build InterviewSession**

Create `src/components/interview/InterviewSession.tsx`:

The main session container that orchestrates rounds:

1. On mount: fetch the scenario if not cached, then call `startSession(scenarioId)`
2. Render `InterviewSessionHeader` with round progress and timer
3. Render `InterviewRoundView` for the current round
4. Handle round submission: call `submitRound()`, then `nextRound()`
5. Handle timer expiry: auto-submit with `passed: false, score: 0`
6. When `isComplete` becomes true: navigate to results page
7. "Submit & Continue" button below the round view (changes to "Submit & Finish" on last round)

State flow:
```
startSession() → render round 0 → user submits → submitRound() → nextRound() →
render round 1 → ... → last round submitted → endSession() → navigate to results
```

**Step 4: Wire InterviewSession into InterviewPage**

Update `src/pages/InterviewPage.tsx` to render `InterviewSession` when a scenarioId is present and session is not complete:

```typescript
import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useInterviewStore } from '@/stores/interviewStore';
import { useAuthStore } from '@/stores/authStore';
import { InterviewLobby } from '@/components/interview/InterviewLobby';
import { InterviewSession } from '@/components/interview/InterviewSession';
import { InterviewResults } from '@/components/interview/InterviewResults';

export function InterviewPage() {
  const { scenarioId } = useParams<{ scenarioId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isResults = location.pathname.endsWith('/results');
  const { activeScenario, isComplete, fetchScenario, scenariosById } = useInterviewStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (scenarioId) {
      fetchScenario(scenarioId);
    }
  }, [scenarioId, fetchScenario]);

  if (!scenarioId) {
    return <InterviewLobby />;
  }

  if (isResults || isComplete) {
    return <InterviewResults />;
  }

  // Auth check
  if (!user) {
    navigate('/interview');
    return null;
  }

  const scenario = scenariosById[scenarioId];
  if (!scenario) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-text-secondary">Loading scenario...</div>
      </div>
    );
  }

  return <InterviewSession scenarioId={scenarioId} />;
}
```

**Step 5: Verify in dev server**

Run: `npm run dev`
Expected: Navigate to `/interview`, click the sample scenario, session starts with round 1 showing, timer counting down, round progress visible

**Step 6: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 7: Commit**

```bash
git add src/components/interview/InterviewSession.tsx src/components/interview/InterviewSessionHeader.tsx src/components/interview/InterviewRoundView.tsx src/pages/InterviewPage.tsx
git commit -m "feat(interview): build active session with timed rounds and round navigation"
```

---

## Task 8: Build the Interview Quiz Round

**Files:**
- Create: `src/components/interview/InterviewQuizRound.tsx`

This is a simplified quiz view for interview follow-up questions. Unlike the existing `QuizQuestionView`, this one:
- Shows multiple questions in sequence within a single round
- Has no tabs, no community features, no breadcrumbs
- Tracks selected answers for all questions
- Calculates score as correctAnswers/totalQuestions
- Calls `onSubmit(passed, score, answer)` when done

**Step 1: Build the component**

Reference: `src/components/architecture/quiz/QuizQuestionView.tsx` for answer rendering patterns.

The component receives:
```typescript
interface InterviewQuizRoundProps {
  questions: InterviewQuizOption[];
  onSubmit: (passed: boolean, score: number, answer: string) => void;
}
```

Layout:
- Display all questions at once (not one-at-a-time)
- Each question shows its text and radio options
- User selects one answer per question
- "Submit" button at the bottom (disabled until all questions answered)
- After submission: show correct/incorrect per question with explanations
- Score calculation: correctCount / totalCount

UI patterns:
- Answer buttons: `border-2 rounded-lg p-4` with selection state
- Correct after submit: `border-success bg-success/10`
- Wrong after submit: `border-error bg-error/10`
- Radio dots: `w-6 h-6 rounded-full border-2`

**Step 2: Wire into InterviewRoundView**

In `InterviewRoundView`, when `round.questionType === 'quiz'` and `round.questions` exists, render `InterviewQuizRound`.

**Step 3: Test with dev server**

Run: `npm run dev`
Navigate to the sample scenario, complete round 1 (SQL), then round 2 should show the quiz questions.

**Step 4: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 5: Commit**

```bash
git add src/components/interview/InterviewQuizRound.tsx src/components/interview/InterviewRoundView.tsx
git commit -m "feat(interview): add interview quiz round for follow-up questions"
```

---

## Task 9: Build the Results Page

**Files:**
- Create: `src/components/interview/InterviewResults.tsx`
- Create: `src/components/interview/InterviewRoundResult.tsx`

**Step 1: Build InterviewRoundResult**

Create `src/components/interview/InterviewRoundResult.tsx`:

A card showing one round's result:
```typescript
interface InterviewRoundResultProps {
  roundIndex: number;
  round: InterviewRound;
  result: RoundResult | undefined;
}
```

Layout:
- Card: `bg-surface rounded-xl shadow-lg ring-1 ring-white/5 p-4`
- Left: round number circle with pass/fail color
- Middle: round title, round type badge, time spent vs time limit
- Right: score percentage
- Expandable: click to show submitted answer (code block or quiz answers)

Pass/fail colors:
- Passed: `bg-success/20 text-success`
- Failed: `bg-error/20 text-error`
- Skipped: `bg-border text-text-muted`

**Step 2: Build InterviewResults**

Create `src/components/interview/InterviewResults.tsx`:

The scorecard page:

```typescript
export function InterviewResults() {
  const { activeScenario, roundResults, getOverallScore, resetSession, saveSessionToSupabase } = useInterviewStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
```

Layout:
- Header: scenario title, category/level badge
- Overall score: large percentage with radial progress indicator (SVG circle)
  - Green: >= 80%
  - Yellow: >= 50%
  - Red: < 50%
- Stats row: rounds passed, total time, average score
- Per-round cards: list of `InterviewRoundResult` components
- Actions: "Try Another Interview" button (navigates to `/interview`, calls `resetSession()`), "Share Results" button (deferred to Task 11)

On mount:
- If user is authenticated, call `saveSessionToSupabase(user.id)`

The radial progress SVG pattern (no library needed):
```tsx
<svg className="w-32 h-32" viewBox="0 0 36 36">
  <path
    className="text-bg-secondary"
    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  />
  <path
    className={scoreColor}
    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeDasharray={`${score}, 100`}
  />
</svg>
```

**Step 3: Wire into InterviewPage**

Update `InterviewPage.tsx` to render `InterviewResults` when `isComplete` or when the URL ends with `/results`.

**Step 4: Test full flow**

Run: `npm run dev`
Complete the full sample scenario (3 rounds), verify the results page shows correctly.

**Step 5: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 6: Commit**

```bash
git add src/components/interview/InterviewResults.tsx src/components/interview/InterviewRoundResult.tsx src/pages/InterviewPage.tsx
git commit -m "feat(interview): add scorecard results page with round breakdown"
```

---

## Task 10: Supabase Migration

**Files:**
- Create: `supabase/migrations/20260210000000_interview_sessions.sql`

**Step 1: Create migration**

Create `supabase/migrations/20260210000000_interview_sessions.sql`:

```sql
-- Interview sessions - stores completed mock interview results

create table public.interview_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  scenario_id text not null,
  category text not null check (category in ('coding', 'system_design')),
  level text not null check (level in ('junior', 'mid', 'senior', 'staff')),
  started_at timestamptz not null,
  completed_at timestamptz,
  overall_score real,
  round_results jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.interview_sessions enable row level security;

create policy "Users can view own sessions"
  on public.interview_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id);

create index idx_interview_sessions_user on public.interview_sessions (user_id, created_at desc);
create index idx_interview_sessions_scenario on public.interview_sessions (scenario_id);
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260210000000_interview_sessions.sql
git commit -m "feat(interview): add interview_sessions Supabase migration"
```

---

## Task 11: Share Feature (Deferred)

**Files:**
- Create: `src/components/interview/InterviewShareCard.tsx`

This task can be deferred. For now, the "Share Results" button in the results page should copy a text summary to clipboard:

```
DataDrill Mock Interview Results
Coding Interview - Junior
Score: 85%
Rounds: 3/3 passed
https://thedatadrill.vercel.app/interview
```

Use `navigator.clipboard.writeText()` with a "Copied!" toast.

**Step 1: Implement clipboard share**

Add a share handler in `InterviewResults.tsx`:

```typescript
const [copied, setCopied] = useState(false);

const handleShare = async () => {
  const text = `DataDrill Mock Interview Results\n${categoryLabel} - ${levelLabel}\nScore: ${Math.round(overallScore * 100)}%\nRounds: ${passedCount}/${totalRounds} passed\nhttps://thedatadrill.vercel.app/interview`;
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

**Step 2: Verify and commit**

Run: `npm run build`

```bash
git add src/components/interview/InterviewResults.tsx
git commit -m "feat(interview): add clipboard share for interview results"
```

---

## Task 12: Polish and Final Build Verification

**Files:**
- Various interview components

**Step 1: Verify the full flow end-to-end**

1. Navigate to `/interview` - lobby renders with scenarios
2. Click the sample scenario - session starts, timer counts down
3. Complete round 1 (SQL write) - submit code
4. Round 2 (quiz) appears - answer questions
5. Round 3 (SQL write) appears - submit code
6. Results page shows with scorecard
7. "Try Another Interview" goes back to lobby
8. Share button copies text

**Step 2: Check mobile responsiveness**

Verify the lobby, session, and results pages work on mobile viewport (375px).

**Step 3: Check loading states**

- Lobby loading: skeleton cards
- Session loading: scenario fetch shows spinner
- Results loading: score calculation is instant (all local state)

**Step 4: Final build**

Run: `npm run build`
Expected: Build passes, no TypeScript errors, no lint errors

**Step 5: Commit any polish fixes**

```bash
git add -A
git commit -m "feat(interview): polish mock interview experience"
```
