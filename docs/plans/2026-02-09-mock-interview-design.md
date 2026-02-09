# Mock Interview Sessions - Design Document

## Overview

Simulate real data engineering interviews with curated, multi-round scenarios. Each interview is a hand-crafted conversation: a core problem followed by probing follow-up questions that test whether the candidate truly understands their solution.

Two interview categories mirror how real interviews are structured:
- **Coding Interview** - SQL, Python, Debug questions with follow-up probing
- **System Design Interview** - Architecture and Modeling with follow-up questions

Four levels per category: Junior, Mid-Level, Senior, Staff.

## Core Concept: Interview as a Conversation

Each scenario is authored as a cohesive sequence of rounds:

1. **Core question** - Write code, design an architecture, build a model
2. **Follow-up probing** - "What would happen if we replaced X with Y?", "What if the input had nulls?" - quiz-style questions that test understanding of the work just done
3. **Extensions** - Debug a variant, extend the solution, design the next layer

This mirrors real senior/staff interviews where interviewers don't just ask "write a query" - they drill into your thinking.

## Content Format

Interview scenarios are YAML files in `questions/interviews/`:

```
questions/interviews/
  coding/
    junior/
    mid/
    senior/
    staff/
  system_design/
    junior/
    mid/
    senior/
    staff/
```

### Scenario YAML Schema

```yaml
id: coding-ecommerce-analytics
category: coding              # coding | system_design
level: senior                 # junior | mid | senior | staff
title: "E-Commerce Analytics Pipeline"
description: "Build analytics queries for an e-commerce platform, then defend your approach under pressure."
estimatedMinutes: 45
tags: [window-functions, aggregation, joins]

rounds:
  - id: round-1
    type: sql                 # skill: sql | python | debug | architecture | modeling
    questionType: write       # subtype: write | fix | quiz | constraints | canvas | design
    timeMinutes: 12
    title: "Top Products by Region"
    description: |
      Given tables `orders` and `products`, write a query...
    initialCode: ""
    tables:
      - name: orders
        columns: [order_id, product_id, region, quantity, price]
        rows: [...]
      - name: products
        columns: [product_id, product_name, category]
        rows: [...]
    hiddenTables:
      - name: orders
        columns: [order_id, product_id, region, quantity, price]
        rows: [...]  # different data for validation
      - name: products
        columns: [product_id, product_name, category]
        rows: [...]
    expectedOutput: |
      region,product_name,revenue
      ...
    hints:
      - "Consider using window functions"
      - "RANK() with PARTITION BY"

  - id: round-2
    type: quiz
    questionType: quiz
    timeMinutes: 5
    title: "Defend Your Approach"
    description: "Your interviewer wants to understand your solution deeper."
    questions:
      - question: "What would happen if two products had the same revenue in a region?"
        options:
          - "Both get the same rank"
          - "One is excluded"
          - "Error"
          - "Random ordering"
        correctAnswer: 0
        explanation: "RANK() assigns the same rank to ties, then skips the next rank."
      - question: "If you replaced RANK() with ROW_NUMBER(), what changes?"
        options:
          - "No ties - each row gets a unique sequential number"
          - "Same behavior as RANK()"
          - "Query would error"
          - "Performance would degrade"
        correctAnswer: 0
        explanation: "ROW_NUMBER() assigns unique numbers even for ties, with arbitrary ordering among ties."

  - id: round-3
    type: debug
    questionType: fix
    timeMinutes: 10
    title: "Fix the Revenue Query"
    description: "A colleague wrote this variant but it returns wrong results. Find and fix the bug."
    initialCode: |
      SELECT ... (buggy version)
    tables: [...]
    hiddenTables: [...]
    expectedOutput: "..."
```

### Build Pipeline

Extend `scripts/processQuestions.ts` to:
1. Read YAML files from `questions/interviews/**/*.yaml`
2. Validate schema (required fields, valid types)
3. Output to `public/interviews/index.json` (scenario metadata list)
4. Output per-scenario: `public/interviews/{id}.json` (full scenario with all rounds)

## User Flow

### Page 1: Interview Lobby (`/interview`)

**Layout:**
- Two category sections: "Coding Interview" and "System Design Interview"
- Each category shows level cards: Junior / Mid / Senior / Staff
- Each level card shows: title, estimated time, round count, skill tags
- Levels with no scenarios show as "Coming Soon" (disabled)
- Clicking an available level shows the available scenarios for that level
- Clicking a scenario starts the session

**Auth:**
- Lobby is visible to all users
- Starting a session requires authentication (prompt to sign in if anonymous)

### Page 2: Active Session (`/interview/:scenarioId`)

**Header bar:**
- Round progress: "Round 2 of 5" with visual step indicator
- Countdown timer for current round (counts down from `timeMinutes`)
- "End Interview" button (confirms before ending early)

**Main area:**
- Renders the current round's question view
- Reuses existing question components based on round type:
  - SQL/Python write rounds -> QuestionViewLayout with Monaco editor
  - Debug/fix rounds -> QuestionViewLayout with pre-filled buggy code
  - Quiz rounds -> InterviewQuizRound (custom component for interview follow-up questions)
  - Architecture rounds -> ArchitectureQuestionView / CanvasQuestionView
  - Modeling rounds -> ModelingQuestionView

**Round transitions:**
- User clicks "Submit & Continue" to submit answer and proceed
- Brief feedback shown (pass/fail indicator) before moving to next round
- No back button - cannot revisit previous rounds
- Timer expiry: auto-submit current work, show warning, advance to next round
- Final round: "Submit & Finish" button, redirects to results

**Session persistence:**
- Session state stored in interviewStore (Zustand)
- If user navigates away, session is lost (intentional - mirrors real interview pressure)
- Could add localStorage backup later if needed

### Page 3: Scorecard (`/interview/:scenarioId/results`)

**Layout:**
- Overall score (percentage) with visual indicator (pie chart or radial)
- Level and category badge
- Per-round breakdown cards:
  - Round number and title
  - Pass/fail status with icon
  - Time spent vs time limit
  - Score for that round
- Summary section: strengths (passed rounds) and areas to improve (failed rounds)
- "Share Results" button - generates shareable card/link
- "Try Another Interview" button - back to lobby
- "Review Answers" - expandable sections showing what you submitted per round

**Data saved to Supabase:**
- `interview_sessions` table with overall results
- Individual round results linked to the session

## State Management

### interviewStore (Zustand)

```typescript
// Types
interface InterviewScenarioMeta {
  id: string
  category: 'coding' | 'system_design'
  level: 'junior' | 'mid' | 'senior' | 'staff'
  title: string
  description: string
  estimatedMinutes: number
  roundCount: number
  tags: string[]
}

interface InterviewRound {
  id: string
  type: SkillType
  questionType: string
  timeMinutes: number
  title: string
  description: string
  // Type-specific fields (initialCode, tables, questions, etc.)
  [key: string]: unknown
}

interface InterviewScenario extends InterviewScenarioMeta {
  rounds: InterviewRound[]
}

interface RoundResult {
  roundId: string
  passed: boolean
  score: number              // 0-1
  timeSpentSeconds: number
  answer: string
  resultMeta: Record<string, unknown> | null
}

interface InterviewSession {
  scenarioId: string
  startedAt: string
  completedAt: string | null
  roundResults: RoundResult[]
  overallScore: number
}

// Store
interface InterviewState {
  // Catalog
  scenarios: InterviewScenarioMeta[]
  scenariosLoading: boolean

  // Active session
  activeScenario: InterviewScenario | null
  currentRoundIndex: number
  roundResults: RoundResult[]
  sessionStartedAt: number | null
  roundStartedAt: number | null
  isComplete: boolean

  // Actions
  fetchScenarios: () => Promise<void>
  startSession: (scenarioId: string) => Promise<void>
  submitRound: (result: Omit<RoundResult, 'roundId'>) => void
  nextRound: () => void
  endSession: () => void
  resetSession: () => void

  // Persistence
  saveSessionToSupabase: (userId: string) => Promise<void>
  fetchSessionHistory: (userId: string) => Promise<InterviewSession[]>
}
```

### Key Store Behaviors

- `fetchScenarios()` - loads `public/interviews/index.json`, sets `scenarios`
- `startSession(id)` - fetches `public/interviews/{id}.json`, initializes session state
- `submitRound(result)` - stores result in `roundResults`, records time spent
- `nextRound()` - increments `currentRoundIndex`, resets `roundStartedAt`
- `endSession()` - marks remaining rounds as skipped, sets `isComplete`, calculates overall score
- `saveSessionToSupabase()` - persists session to `interview_sessions` table
- `resetSession()` - clears all active session state

## Component Architecture

### New Files

```
src/
├── pages/
│   └── InterviewPage.tsx                  # Route handler
│
├── components/interview/
│   ├── InterviewLobby.tsx                 # Category cards + level selection
│   ├── InterviewSession.tsx               # Active session container
│   ├── InterviewSessionHeader.tsx         # Progress bar + timer + end button
│   ├── InterviewRoundView.tsx             # Routes to correct view per round type
│   ├── InterviewQuizRound.tsx             # Quiz follow-up questions in interview context
│   ├── InterviewResults.tsx               # Scorecard
│   ├── InterviewRoundResult.tsx           # Individual round result card
│   └── InterviewShareCard.tsx             # Shareable results card
│
├── stores/
│   └── interviewStore.ts                  # Session state
│
├── types/
│   (extend index.ts with interview types)
```

### Reused Components
- `QuestionViewLayout` - SQL/Python/Debug code rounds
- `ArchitectureQuestionView` / `CanvasQuestionView` / `QuizQuestionView` - Architecture rounds
- `ModelingQuestionView` - Modeling rounds
- `useExecutor` / `useValidation` - Code execution and scoring
- `ProtectedRoute` - Auth guard

### Routing (App.tsx additions)

```typescript
<Route path="/interview" element={<InterviewPage />} />
<Route path="/interview/:scenarioId" element={<InterviewPage />} />
<Route path="/interview/:scenarioId/results" element={<InterviewPage />} />
```

## Database Schema (Supabase)

### interview_sessions table

```sql
CREATE TABLE interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('coding', 'system_design')),
  level TEXT NOT NULL CHECK (level IN ('junior', 'mid', 'senior', 'staff')),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  overall_score REAL,          -- 0.0 to 1.0
  round_results JSONB NOT NULL, -- array of RoundResult objects
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only see their own sessions
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Timer Behavior

- Each round has a `timeMinutes` limit
- Timer counts down from the limit
- At 60 seconds remaining: visual warning (timer turns red/amber)
- At 0 seconds: auto-submit current answer, show "Time's up!" notification, advance to next round after 2-second delay
- User can submit early at any time
- Total session time is tracked (sum of time spent per round)

## Scoring

- Per-round score: 0.0 to 1.0 (from existing validators)
  - Code questions: passedDatasets / totalDatasets
  - Quiz questions: correctAnswers / totalQuestions
  - Architecture: component scoring
  - Modeling: field assignment scoring
- Overall session score: average of all round scores (skipped rounds count as 0)
- Display as percentage on scorecard

## Shareable Results

- Generate a card-style summary:
  - DataDrill logo + "Mock Interview Results"
  - Category + Level badge
  - Overall score percentage
  - Round breakdown (passed/failed icons)
  - Date
- Share as: copy link (URL with session ID), download as PNG (html2canvas or similar)
- Shared view is read-only - recipient sees the scorecard but not the questions/answers

## Implementation Order

1. **Types** - Add interview types to `src/types/index.ts`
2. **Build pipeline** - Extend `processQuestions.ts` to process interview YAML files
3. **Sample content** - Create 1-2 sample scenarios to test with
4. **Store** - Build `interviewStore.ts`
5. **Routing** - Add interview routes to `App.tsx`
6. **Lobby page** - `InterviewLobby.tsx` with category/level selection
7. **Session page** - `InterviewSession.tsx` + `InterviewSessionHeader.tsx` + `InterviewRoundView.tsx`
8. **Quiz round** - `InterviewQuizRound.tsx` for follow-up questions
9. **Results page** - `InterviewResults.tsx` + `InterviewRoundResult.tsx`
10. **Supabase migration** - `interview_sessions` table + RLS policies
11. **Share feature** - `InterviewShareCard.tsx` + shareable link
12. **Polish** - Loading states, error handling, mobile responsiveness
