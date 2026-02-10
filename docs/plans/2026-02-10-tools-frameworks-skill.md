# Tools & Frameworks Skill Track Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 6th skill track "Tools & Frameworks" starting with Spark quiz questions and 7 solution playbook tracks.

**Architecture:** Reuse the existing quiz infrastructure (QuizQuestion type, QuizQuestionView component, QuizValidator). Widen `QuizQuestion.skill` from `'architecture'` to `'architecture' | 'tools'`. Add `'tools'` to `SkillType` and all Record/state objects keyed by skill. Create quiz markdown files and track YAML files following existing patterns.

**Tech Stack:** TypeScript types, Zustand stores, React components, YAML tracks, Markdown quiz questions, processQuestions.ts build script.

---

### Task 1: Update TypeScript Types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add 'tools' to SkillType**

In `src/types/index.ts:2`, change:
```ts
export type SkillType = 'sql' | 'python' | 'debug' | 'architecture' | 'modeling';
```
to:
```ts
export type SkillType = 'sql' | 'python' | 'debug' | 'architecture' | 'modeling' | 'tools';
```

**Step 2: Add ToolsQuestionType**

After the `ArchitectureQuestionType` line (line 47), add:
```ts
export type ToolsQuestionType = 'quiz';
```

**Step 3: Widen QuizQuestion.skill**

In the `QuizQuestion` interface (line 144), change:
```ts
  skill: 'architecture';
```
to:
```ts
  skill: 'architecture' | 'tools';
```

**Step 4: Add ToolsQuestion type alias**

After the `ArchitectureQuestion` union (line 174), add:
```ts
// Tools & Frameworks question types (quiz-only for now, expands later)
export type ToolsQuestion = QuizQuestion & { skill: 'tools' };
```

**Step 5: Update Question union**

Change line 260:
```ts
export type Question = SqlQuestion | PythonQuestion | DebugQuestion | ArchitectureQuestion | ModelingQuestion;
```
to:
```ts
export type Question = SqlQuestion | PythonQuestion | DebugQuestion | ArchitectureQuestion | ModelingQuestion | ToolsQuestion;
```

**Step 6: Update QuestionMeta.questionType**

Change line 266:
```ts
  questionType?: ArchitectureQuestionType; // Only for architecture questions
```
to:
```ts
  questionType?: ArchitectureQuestionType | ToolsQuestionType;
```

**Step 7: Add isToolsQuestion type guard**

After the `isModelingQuestion` guard (line 449-451), add:
```ts
export function isToolsQuestion(question: Question): question is ToolsQuestion {
  return question.skill === 'tools';
}

export function isToolsQuizQuestion(question: Question): question is ToolsQuestion {
  return question.skill === 'tools' && 'questionType' in question && (question as ToolsQuestion).questionType === 'quiz';
}
```

**Step 8: Update getQuestionTables and getExpectedQuery helpers**

In `getQuestionTables` (line 454-458), add `isToolsQuestion` to the guard:
```ts
export function getQuestionTables(question: Question): TableData[] {
  if (isArchitectureQuestion(question) || isModelingQuestion(question) || isToolsQuestion(question)) {
    return [];
  }
  return question.tables;
}
```

In `getExpectedQuery` (line 462-466), same change:
```ts
export function getExpectedQuery(question: Question): string {
  if (isArchitectureQuestion(question) || isModelingQuestion(question) || isToolsQuestion(question)) {
    return '';
  }
  return question.expectedOutputQuery;
}
```

**Step 9: Add 'tools' to WeakestSkill**

Change line 488:
```ts
export type WeakestSkill = 'sql' | 'python' | 'architecture' | 'modeling';
```
to:
```ts
export type WeakestSkill = 'sql' | 'python' | 'architecture' | 'modeling' | 'tools';
```

**Step 10: Run type check**

Run: `npx tsc -b --noEmit 2>&1 | head -50`
Expected: Type errors in files that have `Record<SkillType, ...>` without a `tools` key. These are fixed in Tasks 2-3.

**Step 11: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add 'tools' skill type and widen QuizQuestion for tools support"
```

---

### Task 2: Update Stores (questionStore + trackStore)

**Files:**
- Modify: `src/stores/questionStore.ts`
- Modify: `src/stores/trackStore.ts`

**Step 1: Add tools to questionStore initial state**

In `src/stores/questionStore.ts:59`, add `tools: []` to `questionsBySkill`:
```ts
  questionsBySkill: {
    sql: [],
    python: [],
    debug: [],
    architecture: [],
    modeling: [],
    tools: [],
  },
```

**Step 2: Add tools to trackStore initial state**

In `src/stores/trackStore.ts:24`, add `tools: []` to `tracksBySkill`:
```ts
  tracksBySkill: {
    sql: [],
    python: [],
    debug: [],
    architecture: [],
    modeling: [],
    tools: [],
  },
```

**Step 3: Search for other Record<SkillType, ...> that need updating**

Run: `grep -rn "Record<SkillType" src/`

Add `tools` key to every Record literal found. Known locations:
- `src/pages/HomePage.tsx:86-92` (questionCounts initial state)
- `src/pages/HomePage.tsx:119` (counts object in fetchCounts)

**Step 4: Commit**

```bash
git add src/stores/questionStore.ts src/stores/trackStore.ts
git commit -m "feat(stores): add tools skill to question and track store initial state"
```

---

### Task 3: Update Pages (HomePage, SkillPage, SkillPathPage, QuestionPage)

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/SkillPage.tsx`
- Modify: `src/pages/SkillPathPage.tsx`
- Modify: `src/pages/QuestionPage.tsx`

**Step 1: Add tools card to HomePage**

In `src/pages/HomePage.tsx`, import the `Wrench` icon from lucide-react (line 2):
```ts
import { Database, Zap, Bug, Network, Table2, Wrench, LucideIcon } from 'lucide-react';
```

Add the tools entry to the `SKILLS` array after modeling (after line 82):
```ts
  {
    skill: 'tools',
    name: 'Tools & Frameworks',
    Icon: Wrench,
    description: 'Learn the tools and frameworks used in modern data engineering',
  },
```

Add `tools: 0` to the `questionCounts` initial state (line 91):
```ts
  const [questionCounts, setQuestionCounts] = useState<Record<SkillType, number>>({
    sql: 0,
    python: 0,
    debug: 0,
    architecture: 0,
    modeling: 0,
    tools: 0,
  });
```

Add `tools: 0` to the counts object inside fetchCounts (line 119):
```ts
      const counts: Record<SkillType, number> = { sql: 0, python: 0, debug: 0, architecture: 0, modeling: 0, tools: 0 };
```

Update the skeleton count from 5 to 6 (line 144):
```ts
          {[...Array(6)].map((_, i) => (
```

**Step 2: Add tools to SkillPage**

In `src/pages/SkillPage.tsx`, add to `SKILL_NAMES` (after line 13):
```ts
  tools: 'Tools & Frameworks',
```

Add to `SKILL_DESCRIPTIONS` (after line 21):
```ts
  tools: 'Learn the tools and frameworks used in modern data engineering',
```

Update `isValidSkill` (line 24):
```ts
function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'python' || skill === 'debug' || skill === 'architecture' || skill === 'modeling' || skill === 'tools';
}
```

**Step 3: Add tools to SkillPathPage**

In `src/pages/SkillPathPage.tsx`, update `isValidSkill` (line 8):
```ts
function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'python' || skill === 'debug' || skill === 'architecture' || skill === 'modeling' || skill === 'tools';
}
```

Add to `SKILL_NAMES` (after line 17):
```ts
  tools: 'Tools & Frameworks',
```

**Step 4: Update QuestionPage**

In `src/pages/QuestionPage.tsx`, update `isValidSkill` (line 17):
```ts
function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'python' || skill === 'debug' || skill === 'architecture' || skill === 'modeling' || skill === 'tools';
}
```

Add `isToolsQuizQuestion` to the imports from `@/types` (line 15):
```ts
import { SkillType, getInitialCode, isArchitectureQuestion, isCanvasQuestion, isConstraintsQuestion, isQuizQuestion, isModelingQuestion, isToolsQuizQuestion } from '@/types';
```

Update the `needsExecutor` check (line 111) to exclude tools:
```ts
  const needsExecutor = skill !== 'architecture' && skill !== 'modeling' && skill !== 'tools';
```

Add tools quiz rendering before the constraints check (after line 176, before the `isConstraintsQuestion` block):
```ts
  if (isToolsQuizQuestion(currentQuestion)) {
    return <QuizQuestionView question={currentQuestion} />;
  }
```

Note: The existing `isQuizQuestion` check (line 174) will also catch tools quiz questions since it checks `questionType === 'quiz'`. However, the `isQuizQuestion` type guard currently checks `skill === 'architecture'`, so we need to update it (done in Task 1) OR add the `isToolsQuizQuestion` check before it. The cleanest approach: update `isQuizQuestion` in types to check for `questionType === 'quiz'` without restricting to architecture skill. Then both architecture and tools quiz questions route through the same `QuizQuestionView`.

**Revision to Task 1 Step 7:** Update `isQuizQuestion` to not restrict by skill:
```ts
export function isQuizQuestion(question: Question): question is QuizQuestion {
  return 'questionType' in question && (question as QuizQuestion).questionType === 'quiz';
}
```

This means the existing `QuizQuestionView` path in QuestionPage (line 174-176) handles both architecture and tools quiz questions. No additional rendering code needed in QuestionPage.

**Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/SkillPage.tsx src/pages/SkillPathPage.tsx src/pages/QuestionPage.tsx
git commit -m "feat(pages): add tools skill to all page routing and navigation"
```

---

### Task 4: Update QuizQuestionView to Be Skill-Aware

**Files:**
- Modify: `src/components/architecture/quiz/QuizQuestionView.tsx`

**Step 1: Make breadcrumb skill-aware**

In `QuizQuestionView.tsx`, the breadcrumb (lines 100-105) hardcodes 'Architecture':
```tsx
      <Breadcrumb
        items={[
          { label: 'Architecture', href: '/architecture' },
          { label: question.title },
        ]}
      />
```

Change to use the question's skill:
```tsx
      <Breadcrumb
        items={[
          { label: question.skill === 'tools' ? 'Tools & Frameworks' : 'Architecture', href: `/${question.skill}` },
          { label: question.title },
        ]}
      />
```

**Step 2: Make submission skill-aware**

In `handleSubmit` (line 48), change hardcoded `skill: 'architecture'`:
```ts
          skill: 'architecture',
```
to:
```ts
          skill: question.skill,
```

**Step 3: Commit**

```bash
git add src/components/architecture/quiz/QuizQuestionView.tsx
git commit -m "feat(quiz): make QuizQuestionView skill-aware for tools support"
```

---

### Task 5: Update Build Script (processQuestions.ts)

**Files:**
- Modify: `scripts/processQuestions.ts`

**Step 1: Add 'tools' to SkillType and SKILL_DIRS**

In `scripts/processQuestions.ts:8`, change:
```ts
type SkillType = 'sql' | 'python' | 'debug' | 'architecture' | 'modeling';
```
to:
```ts
type SkillType = 'sql' | 'python' | 'debug' | 'architecture' | 'modeling' | 'tools';
```

In line 462, change:
```ts
const SKILL_DIRS: SkillType[] = ['sql', 'python', 'debug', 'architecture', 'modeling'];
```
to:
```ts
const SKILL_DIRS: SkillType[] = ['sql', 'python', 'debug', 'architecture', 'modeling', 'tools'];
```

**Step 2: Add ToolsQuestionType**

After line 10, add:
```ts
type ToolsQuestionType = 'quiz';
```

**Step 3: Widen QuizProcessedQuestion.skill**

In `QuizProcessedQuestion` interface (line 239-252), change:
```ts
  skill: 'architecture';
```
to:
```ts
  skill: 'architecture' | 'tools';
```

**Step 4: Add ToolsProcessedQuestion type**

After the `ArchitectureProcessedQuestion` union (line 254), add:
```ts
type ToolsProcessedQuestion = QuizProcessedQuestion;
```

**Step 5: Update ProcessedQuestion union**

Change lines 295-300 to include tools:
```ts
type ProcessedQuestion =
  | SqlProcessedQuestion
  | PythonProcessedQuestion
  | DebugProcessedQuestion
  | ArchitectureProcessedQuestion
  | ModelingProcessedQuestion
  | ToolsProcessedQuestion;
```

**Step 6: Parameterize processQuizQuestion to accept skill**

Change the `processQuizQuestion` function (line 543-570) to accept a `skill` parameter:
```ts
async function processQuizQuestion(
  id: string,
  frontmatter: QuizFrontmatter,
  markdownContent: string,
  skill: 'architecture' | 'tools' = 'architecture'
): Promise<QuizProcessedQuestion> {
  const description = markdownContent.trim() ? await marked(markdownContent.trim()) : '';

  return {
    id,
    skill,
    questionType: 'quiz',
    title: frontmatter.title,
    difficulty: frontmatter.difficulty,
    tags: frontmatter.tags,
    question: frontmatter.question,
    description,
    answers: frontmatter.answers.map((a) => ({
      id: a.id,
      text: a.text,
      isCorrect: a.correct,
      explanation: a.explanation,
    })),
    multiSelect: frontmatter.multi_select,
    explanation: frontmatter.explanation,
    hints: frontmatter.hints,
  };
}
```

**Step 7: Update processQuestion to handle tools skill**

In the `processQuestion` function (line 615-691), add tools handling after the architecture block (after line 634):
```ts
  // Handle tools questions (quiz format)
  if (skill === 'tools') {
    if (architectureType === 'quiz' || !architectureType) {
      return processQuizQuestion(id, data as QuizFrontmatter, markdownContent, 'tools');
    }
  }
```

Also update the function signature to accept a more general type parameter. The `architectureType` parameter works for tools too since tools quiz uses the same `quiz/` path convention.

**Step 8: Add tools quiz type detection in the file processing loop**

In the main processing loop (lines 763-776), add tools handling after the architecture block:
```ts
      // Determine question type from path
      let architectureType: ArchitectureQuestionType | undefined;
      if (skill === 'architecture') {
        if (file.startsWith('canvas/')) {
          architectureType = 'canvas';
        } else if (file.startsWith('quiz/')) {
          architectureType = 'quiz';
        } else if (file.startsWith('constraints/')) {
          architectureType = 'constraints';
        } else {
          architectureType = 'constraints';
        }
      } else if (skill === 'tools') {
        if (file.startsWith('quiz/')) {
          architectureType = 'quiz';
        }
      }
```

**Step 9: Update questionType metadata for tools**

In the meta building block (lines 798-800), change:
```ts
        if (skill === 'architecture' && 'questionType' in question) {
```
to:
```ts
        if ((skill === 'architecture' || skill === 'tools') && 'questionType' in question) {
```

**Step 10: Update QuestionMeta.questionType type in processQuestions.ts**

In the `QuestionMeta` interface (line 305), change:
```ts
  questionType?: ArchitectureQuestionType;
```
to:
```ts
  questionType?: ArchitectureQuestionType | ToolsQuestionType;
```

**Step 11: Commit**

```bash
git add scripts/processQuestions.ts
git commit -m "feat(build): add tools skill processing to processQuestions script"
```

---

### Task 6: Create Quiz Questions

**Files:**
- Create: `questions/tools/quiz/easy/` - 7 easy questions
- Create: `questions/tools/quiz/medium/` - 14 medium questions
- Create: `questions/tools/quiz/hard/` - 7 hard questions

All questions follow the existing quiz markdown format (see `questions/architecture/quiz/easy/cap-theorem.md` for reference).

**Question IDs follow the pattern:** `spark-{topic}-{subtopic}`

**Step 1: Create directory structure**

```bash
mkdir -p questions/tools/quiz/easy questions/tools/quiz/medium questions/tools/quiz/hard
```

**Step 2: Create easy questions (7)**

Create the following files in `questions/tools/quiz/easy/`:

**File: `spark-driver-executor-roles.md`**
```markdown
---
title: "Spark Driver vs Executor Roles"
difficulty: "Easy"
tags: ["spark", "architecture", "fundamentals"]
question: "In Apache Spark, what is the primary role of the Driver program?"
multi_select: false
answers:
  - id: a
    text: "Coordinates the execution of tasks across the cluster"
    correct: true
    explanation: "The Driver runs the main() function, creates the SparkContext, builds the DAG of stages, and schedules tasks on executors."
  - id: b
    text: "Stores data partitions in memory for fast access"
    correct: false
    explanation: "Data storage is the role of executors, which hold data partitions in memory or on disk."
  - id: c
    text: "Manages the physical cluster resources like CPU and RAM"
    correct: false
    explanation: "Resource management is handled by the cluster manager (YARN, Mesos, or Kubernetes), not the Driver."
  - id: d
    text: "Performs the actual data transformations on partitions"
    correct: false
    explanation: "Executors perform the data transformations. The Driver only coordinates and schedules."
explanation: "The Spark Driver is the control plane of a Spark application. It converts user code into a DAG of stages and tasks, then delegates actual computation to executors. Understanding this separation is key to debugging performance issues - for example, collecting too much data to the Driver (via .collect()) is a common cause of OOM errors."
---

Understanding the Driver/Executor model is fundamental to Spark interviews and debugging production jobs.
```

**File: `spark-rdd-vs-dataframe.md`**
```markdown
---
title: "RDD vs DataFrame"
difficulty: "Easy"
tags: ["spark", "api", "fundamentals"]
question: "What is the main advantage of Spark DataFrames over RDDs?"
multi_select: false
answers:
  - id: a
    text: "DataFrames use Catalyst optimizer for automatic query optimization"
    correct: true
    explanation: "DataFrames express intent via a structured API, allowing Spark's Catalyst optimizer to analyze and optimize the execution plan - something impossible with RDDs' opaque lambda functions."
  - id: b
    text: "DataFrames support distributed processing while RDDs do not"
    correct: false
    explanation: "Both RDDs and DataFrames support distributed processing. RDDs were Spark's original distributed abstraction."
  - id: c
    text: "DataFrames can store more data than RDDs"
    correct: false
    explanation: "Both abstractions can handle the same data volumes. The difference is in the API and optimization, not capacity."
  - id: d
    text: "RDDs are deprecated and will be removed in future Spark versions"
    correct: false
    explanation: "RDDs are not deprecated. They remain the low-level foundation, though DataFrames are recommended for most use cases."
explanation: "In interviews, the key insight is that DataFrames provide a declarative API (like SQL) while RDDs provide an imperative one (lambdas). The Catalyst optimizer can reorder, prune, and optimize DataFrame operations because it understands the semantics. With RDDs, Spark treats transformations as black boxes."
---

This is one of the most common Spark interview questions, asked at every level from junior to senior.
```

**File: `spark-lazy-evaluation.md`**
```markdown
---
title: "Lazy Evaluation in Spark"
difficulty: "Easy"
tags: ["spark", "fundamentals", "execution-model"]
question: "What does 'lazy evaluation' mean in Spark?"
multi_select: false
answers:
  - id: a
    text: "Transformations are not executed until an action is called"
    correct: true
    explanation: "Spark builds a DAG of transformations but only executes them when an action (collect, count, save, etc.) triggers computation."
  - id: b
    text: "Spark delays processing until the cluster has available resources"
    correct: false
    explanation: "Lazy evaluation is about building an execution plan, not about resource scheduling."
  - id: c
    text: "Data is loaded into memory only when it is first accessed"
    correct: false
    explanation: "While Spark does load data lazily, lazy evaluation specifically refers to the deferred execution of transformation chains."
  - id: d
    text: "Spark processes only the minimum number of partitions needed"
    correct: false
    explanation: "Partition pruning is a separate optimization. Lazy evaluation means deferring the entire computation until an action is triggered."
explanation: "Lazy evaluation is a core Spark concept. It enables the Catalyst optimizer to see the full chain of operations before executing anything, allowing optimizations like predicate pushdown, column pruning, and stage fusion. In interviews, follow up with: 'Can you name some transformations vs actions?' (map/filter/select are transformations; collect/count/write are actions)."
---

Lazy evaluation is fundamental to how Spark optimizes query execution.
```

**File: `spark-partition-basics.md`**
```markdown
---
title: "Spark Partitioning Basics"
difficulty: "Easy"
tags: ["spark", "partitioning", "fundamentals"]
question: "What happens when you call repartition(10) on a DataFrame with 5 partitions?"
multi_select: false
answers:
  - id: a
    text: "A full shuffle redistributes data across 10 new partitions"
    correct: true
    explanation: "repartition() always performs a full shuffle, redistributing data evenly across the specified number of partitions regardless of the current count."
  - id: b
    text: "Each existing partition is split into 2, with no data movement between nodes"
    correct: false
    explanation: "repartition() does not simply split partitions. It performs a full shuffle, meaning data moves between nodes."
  - id: c
    text: "Spark throws an error because you can only reduce the number of partitions"
    correct: false
    explanation: "repartition() can both increase and decrease partition count. You may be thinking of coalesce(), which is typically used to reduce partitions."
  - id: d
    text: "5 empty partitions are added to the existing 5"
    correct: false
    explanation: "Spark redistributes all data across the new partition count via a shuffle, not by appending empty partitions."
explanation: "The repartition vs coalesce distinction is a common interview question. repartition() performs a full shuffle (expensive but produces even partitions). coalesce() avoids a full shuffle by merging adjacent partitions (cheaper but only reduces count and can produce uneven partitions)."
---

Understanding partitioning is critical for Spark performance tuning.
```

**File: `spark-cache-vs-persist.md`**
```markdown
---
title: "Cache vs Persist"
difficulty: "Easy"
tags: ["spark", "caching", "memory"]
question: "What is the difference between cache() and persist() in Spark?"
multi_select: false
answers:
  - id: a
    text: "cache() is shorthand for persist(MEMORY_AND_DISK), while persist() lets you choose the storage level"
    correct: true
    explanation: "cache() is syntactic sugar for persist(StorageLevel.MEMORY_AND_DISK). persist() accepts a StorageLevel parameter for fine-grained control."
  - id: b
    text: "cache() stores data in memory only, persist() stores data on disk only"
    correct: false
    explanation: "cache() defaults to MEMORY_AND_DISK (not memory only). persist() can use any storage level including memory-only."
  - id: c
    text: "cache() is eager and persist() is lazy"
    correct: false
    explanation: "Both cache() and persist() are lazy - they mark a DataFrame for caching but don't materialize it until an action is called."
  - id: d
    text: "cache() can only be used on RDDs, persist() works on both RDDs and DataFrames"
    correct: false
    explanation: "Both cache() and persist() work on RDDs and DataFrames."
explanation: "In practice, cache() is almost always sufficient. Use persist() with a specific StorageLevel when you need MEMORY_ONLY (avoid disk spillover), DISK_ONLY (very large datasets), or MEMORY_AND_DISK_SER (serialized to save memory at the cost of CPU)."
---

Caching is a key Spark optimization technique for iterative algorithms and reused DataFrames.
```

**File: `spark-broadcast-join-basics.md`**
```markdown
---
title: "Broadcast Join Basics"
difficulty: "Easy"
tags: ["spark", "joins", "performance"]
question: "When should you use a broadcast join in Spark?"
multi_select: false
answers:
  - id: a
    text: "When one side of the join is small enough to fit in each executor's memory"
    correct: true
    explanation: "Broadcast joins send the small table to every executor, avoiding the expensive shuffle of the large table. This is much faster than a sort-merge join when one table is small."
  - id: b
    text: "When both tables are very large and distributed across many nodes"
    correct: false
    explanation: "Broadcast joins require one table to be small (typically < 10MB by default). For two large tables, Spark uses sort-merge join."
  - id: c
    text: "When you want to guarantee data locality for subsequent operations"
    correct: false
    explanation: "While broadcast joins avoid shuffles, their primary use case is when one table is small. Data locality is a side effect, not the decision criterion."
  - id: d
    text: "Only when performing inner joins, not left or right joins"
    correct: false
    explanation: "Broadcast joins work with inner, left, right, and other join types. The constraint is table size, not join type."
explanation: "Spark auto-broadcasts tables smaller than spark.sql.autoBroadcastJoinThreshold (default 10MB). In interviews, know that you can force it with broadcast() hint, and that broadcasting a table too large for memory causes OOM errors on executors."
---

Broadcast joins are one of the most impactful performance optimizations in Spark.
```

**File: `spark-structured-streaming-basics.md`**
```markdown
---
title: "Structured Streaming Basics"
difficulty: "Easy"
tags: ["spark", "streaming", "fundamentals"]
question: "How does Spark Structured Streaming process data?"
multi_select: false
answers:
  - id: a
    text: "Treats a stream as an unbounded table and processes new rows in micro-batches"
    correct: true
    explanation: "Structured Streaming's core abstraction is that a stream is an append-only table. Each micro-batch processes new rows since the last trigger, using the same DataFrame API as batch processing."
  - id: b
    text: "Processes each record individually as it arrives, with no batching"
    correct: false
    explanation: "While Spark has a 'continuous processing' mode (experimental), the default and production-standard mode is micro-batch processing."
  - id: c
    text: "Reads the entire stream into memory before processing any data"
    correct: false
    explanation: "Structured Streaming processes data incrementally in micro-batches, not by loading the entire stream."
  - id: d
    text: "Requires a separate streaming API that is incompatible with the batch DataFrame API"
    correct: false
    explanation: "A key advantage of Structured Streaming is that it uses the same DataFrame/Dataset API as batch processing. Most batch code works in streaming with minimal changes."
explanation: "Structured Streaming unifies batch and streaming in Spark. The 'unbounded table' mental model means you write the same transformations as batch, and Spark handles incremental execution. Interviewers often ask about trigger modes (fixed interval, once, available-now) and output modes (append, complete, update)."
---

Structured Streaming is Spark's recommended approach to stream processing.
```

**Step 3: Create medium questions (14)**

Create the following files in `questions/tools/quiz/medium/`:

**File: `spark-dag-stages-tasks.md`**
```markdown
---
title: "DAG, Stages, and Tasks"
difficulty: "Medium"
tags: ["spark", "architecture", "execution-model"]
question: "How does Spark determine stage boundaries when executing a job?"
multi_select: false
answers:
  - id: a
    text: "Stage boundaries are drawn at shuffle operations (wide transformations)"
    correct: true
    explanation: "Spark creates a new stage whenever a wide transformation (groupBy, join, repartition) requires data to move between partitions. Narrow transformations (map, filter) within a stage are pipelined together."
  - id: b
    text: "Each transformation creates a new stage"
    correct: false
    explanation: "Narrow transformations are pipelined within a single stage. Only wide transformations (requiring shuffles) create stage boundaries."
  - id: c
    text: "Stages are created based on available executor memory"
    correct: false
    explanation: "Stage boundaries are determined by the DAG structure (specifically, shuffle dependencies), not by available resources."
  - id: d
    text: "The user manually defines stage boundaries using the stage() API"
    correct: false
    explanation: "Spark automatically determines stage boundaries based on the DAG. There is no manual stage() API."
explanation: "Understanding stages is critical for performance tuning. Each stage boundary means a shuffle - data is written to disk, transferred over the network, and read by the next stage. Minimizing unnecessary shuffles (e.g., by pre-partitioning data) is a key Spark optimization strategy."
---

Understanding the DAG execution model is essential for Spark performance tuning.
```

**File: `spark-shuffle-operations.md`**
```markdown
---
title: "Shuffle Operations"
difficulty: "Medium"
tags: ["spark", "performance", "shuffles"]
question: "Which of the following operations causes a shuffle in Spark?"
multi_select: true
answers:
  - id: a
    text: "groupBy().agg()"
    correct: true
    explanation: "groupBy requires data with the same key to be co-located, causing a shuffle."
  - id: b
    text: "filter()"
    correct: false
    explanation: "filter() is a narrow transformation that operates on each partition independently - no data movement needed."
  - id: c
    text: "join() (without broadcast)"
    correct: true
    explanation: "A non-broadcast join requires both sides to be partitioned by the join key, causing shuffles on one or both sides."
  - id: d
    text: "repartition()"
    correct: true
    explanation: "repartition() explicitly triggers a full shuffle to redistribute data across the specified number of partitions."
explanation: "Shuffles are the most expensive operations in Spark. They involve serializing data, writing to disk, transferring over the network, deserializing, and sorting. In interviews, knowing which operations cause shuffles (groupBy, join, distinct, repartition, orderBy) vs which don't (map, filter, union, coalesce) is fundamental."
---

Identifying shuffle-causing operations is critical for Spark performance optimization.
```

**File: `spark-coalesce-vs-repartition.md`**
```markdown
---
title: "Coalesce vs Repartition"
difficulty: "Medium"
tags: ["spark", "partitioning", "performance"]
question: "You have a DataFrame with 200 partitions and need to write it as 10 output files. Which approach is most efficient?"
multi_select: false
answers:
  - id: a
    text: "coalesce(10) - merges partitions without a full shuffle"
    correct: true
    explanation: "coalesce() reduces partitions by merging adjacent ones without a full shuffle, making it much cheaper than repartition() when decreasing partition count."
  - id: b
    text: "repartition(10) - evenly distributes data across 10 partitions"
    correct: false
    explanation: "repartition(10) works but triggers a full shuffle, which is unnecessarily expensive when you just need to reduce partitions."
  - id: c
    text: "coalesce(10) with shuffle=true for even distribution"
    correct: false
    explanation: "coalesce(10, shuffle=true) is essentially the same as repartition(10). The default coalesce() without shuffle is the efficient choice here."
  - id: d
    text: "Write with maxRecordsPerFile option instead of changing partitions"
    correct: false
    explanation: "maxRecordsPerFile controls records per file but doesn't control the number of output files. coalesce() is the standard approach."
explanation: "The trade-off: coalesce() is cheaper (no shuffle) but can produce uneven partitions since it simply merges adjacent partitions. repartition() is expensive (full shuffle) but produces perfectly even partitions. For writing output files, coalesce() is almost always the right choice."
---

This is a very common Spark interview question that tests understanding of partition management.
```

**File: `spark-data-skew.md`**
```markdown
---
title: "Handling Data Skew"
difficulty: "Medium"
tags: ["spark", "performance", "skew"]
question: "A Spark job is slow because one partition has 10x more data than others after a groupBy. What is the best approach to handle this skew?"
multi_select: false
answers:
  - id: a
    text: "Use salting - add a random prefix to the skewed key, aggregate twice"
    correct: true
    explanation: "Salting splits the hot key across multiple partitions by appending a random number (e.g., key -> key_0, key_1, key_2), performing a partial aggregation, then removing the salt and doing a final aggregation."
  - id: b
    text: "Increase the number of executors to handle the larger partition"
    correct: false
    explanation: "Adding executors doesn't help because a single partition is processed by a single task. The skewed partition still bottlenecks on one core."
  - id: c
    text: "Use repartition() with more partitions to spread the data more evenly"
    correct: false
    explanation: "repartition() uses hash partitioning, so the same key still lands in the same partition. It doesn't solve skew for a specific hot key."
  - id: d
    text: "Enable Adaptive Query Execution (AQE) to automatically handle skew"
    correct: false
    explanation: "AQE can help with skew in joins (via skew join optimization) but doesn't solve skew in groupBy aggregations. Salting remains the standard approach for aggregation skew."
explanation: "Data skew is one of the most common Spark production issues. The salting technique works by: 1) Add random int (0 to N) to the key, 2) groupBy salted key and do partial aggregation, 3) Remove the salt, 4) groupBy original key and do final aggregation. This distributes the work across N tasks instead of one."
---

Data skew handling is a senior-level interview topic that comes up frequently in system design discussions.
```

**File: `spark-memory-model.md`**
```markdown
---
title: "Spark Memory Model"
difficulty: "Medium"
tags: ["spark", "memory", "architecture"]
question: "In Spark's unified memory model, what are the two main memory regions within an executor?"
multi_select: false
answers:
  - id: a
    text: "Storage memory (for caching) and execution memory (for shuffles/joins/sorts)"
    correct: true
    explanation: "Spark's unified memory manager divides executor memory into storage (cached data, broadcast variables) and execution (shuffle buffers, join maps, sort arrays). They can borrow from each other when one is underutilized."
  - id: b
    text: "Heap memory (for Java objects) and off-heap memory (for serialized data)"
    correct: false
    explanation: "Heap vs off-heap is about where memory is allocated (JVM heap vs native memory), not about Spark's logical memory regions."
  - id: c
    text: "Driver memory and executor memory"
    correct: false
    explanation: "Driver and executor memory are allocated to different JVM processes. The question asks about regions within a single executor."
  - id: d
    text: "User memory (for custom data structures) and Spark memory (for internal operations)"
    correct: false
    explanation: "While user memory exists (outside Spark's managed region), the two main regions within Spark's managed memory are storage and execution."
explanation: "The key insight is that storage and execution memory share a pool (controlled by spark.memory.fraction, default 0.6). They can borrow from each other: execution can evict cached data if needed, but cached data cannot evict execution data. This unified model (since Spark 1.6) replaced the older static allocation model."
---

Understanding Spark's memory model helps diagnose OOM errors and tune memory-intensive jobs.
```

**File: `spark-sort-merge-join.md`**
```markdown
---
title: "Sort-Merge Join"
difficulty: "Medium"
tags: ["spark", "joins", "performance"]
question: "What is Spark's default join strategy for two large DataFrames?"
multi_select: false
answers:
  - id: a
    text: "Sort-Merge Join - both sides are shuffled by join key, sorted, and merged"
    correct: true
    explanation: "For two large tables, Spark defaults to sort-merge join: shuffle both sides by the join key, sort each partition, then merge the sorted partitions. This scales well because it only requires sequential reads."
  - id: b
    text: "Hash Join - the smaller side builds a hash table for each partition"
    correct: false
    explanation: "Shuffle hash join exists in Spark but is not the default. It can be faster for medium-sized tables but uses more memory than sort-merge."
  - id: c
    text: "Nested Loop Join - every row from one side is compared against every row from the other"
    correct: false
    explanation: "Broadcast nested loop join is only used for non-equi joins (e.g., range conditions) or when no other strategy applies. It is the least efficient."
  - id: d
    text: "Broadcast Join - the smaller side is sent to all executors"
    correct: false
    explanation: "Broadcast join is only used when one side is below the broadcast threshold (default 10MB). For two large tables, Spark uses sort-merge join."
explanation: "Spark's join strategy selection: 1) Broadcast join if one side < 10MB (cheapest), 2) Sort-merge join for large-large joins (default), 3) Shuffle hash join if enabled and one side is much smaller, 4) Broadcast nested loop for non-equi joins. In interviews, knowing when each strategy is used and how to influence it (hints, config) is important."
---

Join strategies are a core Spark interview topic at the mid to senior level.
```

**File: `spark-aqe.md`**
```markdown
---
title: "Adaptive Query Execution"
difficulty: "Medium"
tags: ["spark", "optimization", "aqe"]
question: "Which optimizations does Spark's Adaptive Query Execution (AQE) perform at runtime?"
multi_select: true
answers:
  - id: a
    text: "Coalesces small post-shuffle partitions to reduce task overhead"
    correct: true
    explanation: "AQE detects when shuffle output partitions are too small and merges them to reduce the number of tasks and scheduling overhead."
  - id: b
    text: "Switches join strategy from sort-merge to broadcast when it detects a small table at runtime"
    correct: true
    explanation: "AQE checks actual data sizes after shuffles and can convert a planned sort-merge join to a broadcast join if one side turns out to be small enough."
  - id: c
    text: "Automatically caches frequently accessed DataFrames"
    correct: false
    explanation: "AQE does not perform automatic caching. Caching must be explicitly requested by the user."
  - id: d
    text: "Optimizes skewed join partitions by splitting them into smaller pieces"
    correct: true
    explanation: "AQE detects skewed partitions during shuffles and splits them into smaller sub-partitions to balance the workload."
explanation: "AQE (enabled by default since Spark 3.2) is a game-changer because it makes decisions based on actual runtime statistics rather than estimates. The three key features are: partition coalescing, dynamic join strategy switching, and skew join optimization. In interviews, knowing what AQE can and cannot do shows deep Spark knowledge."
---

AQE is a relatively modern Spark feature that comes up in interviews testing current knowledge.
```

**File: `spark-catalyst-optimizer.md`**
```markdown
---
title: "Catalyst Optimizer"
difficulty: "Medium"
tags: ["spark", "optimization", "catalyst"]
question: "What does Spark's Catalyst optimizer do during the 'logical optimization' phase?"
multi_select: false
answers:
  - id: a
    text: "Applies rule-based optimizations like predicate pushdown and column pruning"
    correct: true
    explanation: "The logical optimization phase applies rules to simplify the plan: push filters closer to the data source, prune unused columns, combine adjacent projections, fold constants, and simplify expressions."
  - id: b
    text: "Generates Java bytecode for the physical execution plan"
    correct: false
    explanation: "Bytecode generation happens in the code generation phase (Tungsten), not during logical optimization."
  - id: c
    text: "Selects the best physical operator for each logical operator (e.g., broadcast vs sort-merge join)"
    correct: false
    explanation: "Choosing physical operators happens in the physical planning phase, not the logical optimization phase."
  - id: d
    text: "Parses the SQL query or DataFrame operations into an abstract syntax tree"
    correct: false
    explanation: "Parsing happens in the analysis phase, before logical optimization."
explanation: "Catalyst's pipeline: 1) Analysis (resolve columns/tables), 2) Logical Optimization (rule-based rewrites), 3) Physical Planning (choose operators, cost-based selection), 4) Code Generation (Tungsten whole-stage codegen). In interviews, predicate pushdown is the most commonly discussed optimization - pushing filters to the data source (e.g., Parquet, JDBC) to reduce data read."
---

Understanding the Catalyst optimizer shows deep knowledge of how Spark processes queries.
```

**File: `spark-watermarks.md`**
```markdown
---
title: "Watermarks in Structured Streaming"
difficulty: "Medium"
tags: ["spark", "streaming", "watermarks"]
question: "What is the purpose of watermarks in Spark Structured Streaming?"
multi_select: false
answers:
  - id: a
    text: "Define how long to wait for late-arriving data before finalizing window aggregations"
    correct: true
    explanation: "Watermarks tell Spark how late data can arrive. Once the watermark passes a window's end time, that window is finalized and its state is cleaned up."
  - id: b
    text: "Track the exact position (offset) in the source stream for fault tolerance"
    correct: false
    explanation: "Offset tracking is handled by the checkpoint mechanism, not watermarks. Watermarks are about handling late data in event-time processing."
  - id: c
    text: "Limit the rate at which data is ingested from the source"
    correct: false
    explanation: "Rate limiting is configured through source-specific options (like maxOffsetsPerTrigger for Kafka), not watermarks."
  - id: d
    text: "Mark partitions that have been fully processed and can be evicted from memory"
    correct: false
    explanation: "Watermarks manage event-time window state, not partition-level processing state."
explanation: "Watermarks solve a key streaming problem: you can't wait forever for late data. Example: withWatermark('event_time', '10 minutes') means data arriving more than 10 minutes late is dropped. Without watermarks, window state grows unbounded. The trade-off: too short = missing late data, too long = high state/memory usage."
---

Watermarks are a key concept for streaming interviews, especially for senior roles.
```

**File: `spark-output-modes.md`**
```markdown
---
title: "Streaming Output Modes"
difficulty: "Medium"
tags: ["spark", "streaming", "output-modes"]
question: "In Spark Structured Streaming, when should you use 'update' output mode instead of 'append'?"
multi_select: false
answers:
  - id: a
    text: "When performing aggregations and you want only changed rows emitted each micro-batch"
    correct: true
    explanation: "Update mode emits only rows whose aggregation results have changed since the last trigger. This is ideal for aggregations where you want incremental updates (e.g., updating a dashboard)."
  - id: b
    text: "When you need to output the complete result table every micro-batch"
    correct: false
    explanation: "Outputting the complete result table every trigger is 'complete' mode, not 'update' mode."
  - id: c
    text: "When processing simple transformations without aggregations"
    correct: false
    explanation: "For simple transformations without aggregations, 'append' mode is the natural choice. 'Update' mode provides no benefit when there are no aggregations to update."
  - id: d
    text: "When you need exactly-once delivery guarantees"
    correct: false
    explanation: "Delivery guarantees depend on the sink and checkpointing, not the output mode. All three modes support exactly-once semantics with appropriate sinks."
explanation: "The three output modes: append (only new rows, default for non-aggregation queries), update (only changed rows, useful for aggregation updates), complete (full result table, useful for small aggregation results). Not all mode/query combinations are valid - append doesn't work with non-windowed aggregations because past rows could change."
---

Understanding output modes is important for designing streaming pipelines correctly.
```

**File: `spark-deploy-modes.md`**
```markdown
---
title: "Cluster vs Client Deploy Mode"
difficulty: "Medium"
tags: ["spark", "architecture", "deployment"]
question: "What is the key difference between Spark's 'cluster' and 'client' deploy modes?"
multi_select: false
answers:
  - id: a
    text: "In cluster mode, the Driver runs on a worker node; in client mode, it runs on the submitting machine"
    correct: true
    explanation: "Cluster mode runs the Driver inside the cluster (on a worker node managed by the cluster manager), while client mode runs the Driver on the machine that submitted the job."
  - id: b
    text: "Cluster mode uses all available nodes, while client mode limits execution to a single node"
    correct: false
    explanation: "Both modes use distributed executors across the cluster. The only difference is where the Driver process runs."
  - id: c
    text: "Cluster mode requires YARN, while client mode works with any cluster manager"
    correct: false
    explanation: "Both deploy modes work with YARN, Mesos, Kubernetes, and standalone cluster manager."
  - id: d
    text: "Cluster mode is for production workloads, client mode is for development only"
    correct: false
    explanation: "While cluster mode is preferred for production and client mode is convenient for development, both can be used in either context."
explanation: "Cluster mode is preferred for production because the Driver is managed by the cluster (auto-restart on failure, no dependency on submitting machine). Client mode is preferred for interactive work (spark-shell, notebooks) because you can see Driver output directly. Interview tip: know that in client mode, closing your laptop kills the Driver and the job."
---

Deploy mode is a practical Spark knowledge question common in operations-focused interviews.
```

**File: `spark-accumulator-broadcast.md`**
```markdown
---
title: "Accumulators and Broadcast Variables"
difficulty: "Medium"
tags: ["spark", "shared-variables", "performance"]
question: "When should you use a broadcast variable instead of a regular variable in Spark?"
multi_select: false
answers:
  - id: a
    text: "When a large read-only dataset needs to be shared across all tasks efficiently"
    correct: true
    explanation: "Broadcast variables are sent to each executor once and cached, rather than being serialized with every task closure. This is critical for large lookup tables or ML models."
  - id: b
    text: "When you need to update a shared counter from multiple tasks"
    correct: false
    explanation: "Shared write counters are handled by accumulators, not broadcast variables. Broadcast variables are read-only."
  - id: c
    text: "When data needs to be collected back to the Driver after processing"
    correct: false
    explanation: "Collecting data to the Driver is done with actions like collect() or reduce(). Broadcast variables only distribute data from Driver to executors."
  - id: d
    text: "When you need to persist data between different Spark jobs"
    correct: false
    explanation: "Broadcast variables exist only within a single Spark application. For cross-job persistence, use external storage or checkpointing."
explanation: "Without broadcast, if a task closure references a 100MB lookup table, that table is serialized and sent with every task (potentially thousands of copies). With broadcast, it's sent once per executor. Accumulators are the complement: write-only shared variables for counters (e.g., counting malformed records). Both are common interview topics."
---

Understanding shared variables demonstrates knowledge of Spark's distributed execution model.
```

**File: `spark-speculation.md`**
```markdown
---
title: "Speculative Execution"
difficulty: "Medium"
tags: ["spark", "performance", "fault-tolerance"]
question: "What is speculative execution in Spark, and when is it useful?"
multi_select: false
answers:
  - id: a
    text: "Spark launches duplicate copies of slow tasks on other nodes to mitigate stragglers"
    correct: true
    explanation: "When enabled (spark.speculation=true), Spark detects tasks running significantly slower than the median and launches copies on other nodes. The first copy to finish wins, and the other is killed."
  - id: b
    text: "Spark pre-computes results for likely future queries to reduce latency"
    correct: false
    explanation: "Spark doesn't pre-compute future query results. Speculative execution is about mitigating slow tasks in the current job."
  - id: c
    text: "Spark executes multiple query plans and picks the fastest at runtime"
    correct: false
    explanation: "Adaptive Query Execution can switch between plans, but speculative execution is about task-level redundancy, not plan selection."
  - id: d
    text: "Spark stages are executed in parallel even when they have dependencies"
    correct: false
    explanation: "Dependent stages must execute sequentially. Speculative execution is about running duplicate copies of slow tasks within a stage."
explanation: "Speculation is useful when stragglers are caused by hardware issues (slow disks, network) rather than data skew. For data skew, salting or AQE are better solutions. Speculation doubles resource usage for straggler tasks, so it should be used judiciously. Know the key configs: spark.speculation, spark.speculation.multiplier, spark.speculation.quantile."
---

Speculative execution is a fault-tolerance mechanism that comes up in senior-level Spark discussions.
```

**File: `spark-dynamic-allocation.md`**
```markdown
---
title: "Dynamic Resource Allocation"
difficulty: "Medium"
tags: ["spark", "resource-management", "cluster"]
question: "What does Spark's dynamic resource allocation do?"
multi_select: false
answers:
  - id: a
    text: "Automatically adds and removes executors based on workload, releasing resources when idle"
    correct: true
    explanation: "Dynamic allocation scales executors up during heavy computation and removes idle executors after a timeout, allowing resources to be shared across applications on the cluster."
  - id: b
    text: "Dynamically allocates memory between storage and execution within each executor"
    correct: false
    explanation: "Memory allocation within executors is handled by the unified memory manager, not dynamic resource allocation. Dynamic allocation manages the number of executors."
  - id: c
    text: "Automatically adjusts the number of partitions based on data size"
    correct: false
    explanation: "Partition count adjustment is handled by AQE's coalesce feature, not dynamic allocation. Dynamic allocation manages executor count."
  - id: d
    text: "Distributes tasks across executors based on data locality preferences"
    correct: false
    explanation: "Task scheduling with locality preferences is done by the task scheduler, not dynamic allocation."
explanation: "Dynamic allocation is important in shared clusters (YARN, Kubernetes) where resources are shared across teams. Key configs: spark.dynamicAllocation.enabled, minExecutors, maxExecutors, executorIdleTimeout. Important caveat: it interacts poorly with caching (cached data is lost when executors are removed), so use spark.dynamicAllocation.cachedExecutorIdleTimeout for cached executors."
---

Dynamic allocation is a practical cluster management topic relevant to production Spark deployments.
```

**Step 4: Create hard questions (7)**

Create the following files in `questions/tools/quiz/hard/`:

**File: `spark-exactly-once-streaming.md`**
```markdown
---
title: "Exactly-Once in Structured Streaming"
difficulty: "Hard"
tags: ["spark", "streaming", "fault-tolerance"]
question: "How does Spark Structured Streaming achieve exactly-once processing guarantees?"
multi_select: false
answers:
  - id: a
    text: "Replayable sources + idempotent sinks + checkpointed offsets"
    correct: true
    explanation: "Exactly-once requires three things: the source must be replayable (like Kafka with offsets), the sink must be idempotent (writing the same data twice produces the same result), and Spark must checkpoint which offsets have been committed."
  - id: b
    text: "By using distributed transactions across all executors"
    correct: false
    explanation: "Spark does not use distributed transactions. Exactly-once semantics come from the combination of replayable sources, idempotent sinks, and checkpointing."
  - id: c
    text: "Through Spark's built-in deduplication mechanism that tracks every record ID"
    correct: false
    explanation: "While Spark has a dropDuplicates operator for deduplication, exactly-once guarantees come from the source-checkpoint-sink contract, not per-record tracking."
  - id: d
    text: "By buffering all records in memory until processing is confirmed successful"
    correct: false
    explanation: "In-memory buffering would not survive failures. Exactly-once relies on external checkpointing (to HDFS/S3) and the ability to replay from the last committed offset."
explanation: "The exactly-once guarantee is end-to-end only when all three components cooperate. Kafka is replayable (can seek to any offset). File sinks are idempotent (atomic rename). JDBC sinks need UPSERT for idempotency. Checkpoints store: source offsets processed, sink commit log, and operator state. This is a deep topic - interviewers may ask about failure scenarios and recovery mechanics."
---

End-to-end exactly-once semantics is an advanced streaming topic for senior/staff interviews.
```

**File: `spark-skew-join-optimization.md`**
```markdown
---
title: "Skew Join Optimization"
difficulty: "Hard"
tags: ["spark", "joins", "skew", "performance"]
question: "You're joining a 1TB user_events table with a 50GB users table, but 30% of events have user_id=NULL (anonymous users). What is the best approach?"
multi_select: false
answers:
  - id: a
    text: "Filter out NULL keys before the join, process them separately, then union the results"
    correct: true
    explanation: "NULL keys never match in an equi-join anyway, so filtering them out before the shuffle eliminates the skew. Process the NULL events separately if needed, then union back. This avoids shuffling 300GB of data that would just be discarded."
  - id: b
    text: "Enable AQE's skew join optimization to automatically split the NULL partition"
    correct: false
    explanation: "AQE skew join can split large partitions, but NULL keys don't match in equi-joins, so this data would be shuffled and then discarded. Filtering first is more efficient."
  - id: c
    text: "Use a broadcast join since the users table is only 50GB"
    correct: false
    explanation: "50GB far exceeds the broadcast threshold and would cause OOM errors on executors. Even with increased thresholds, broadcasting 50GB is impractical."
  - id: d
    text: "Salt the NULL keys to distribute them across partitions evenly"
    correct: false
    explanation: "Salting would distribute the NULLs but they still wouldn't match anything in an equi-join. You'd add complexity and shuffles for no benefit. Filter first."
explanation: "This question tests practical problem-solving. The insight is recognizing that NULL keys in equi-joins are wasted work. The pattern: 1) Filter NULL keys before the join, 2) Perform the join on non-NULL keys (no skew), 3) If NULLs need to be in the output, left-join them back or union with a default. This is a common production scenario interviewers love because it tests both Spark knowledge and data engineering intuition."
---

Real-world skew handling requires understanding both Spark mechanics and data patterns.
```

**File: `spark-query-plan-analysis.md`**
```markdown
---
title: "Reading Spark Query Plans"
difficulty: "Hard"
tags: ["spark", "optimization", "catalyst", "debugging"]
question: "In a Spark physical plan, you see 'BroadcastHashJoin' followed by 'SortMergeJoin'. What does this indicate?"
multi_select: false
answers:
  - id: a
    text: "The query has two joins - one small enough for broadcast, one requiring sort-merge"
    correct: true
    explanation: "Physical plans show the actual execution strategy chosen by Catalyst for each join. A BroadcastHashJoin means one input was small enough to broadcast, while SortMergeJoin means both inputs of the second join were too large."
  - id: b
    text: "Spark tried broadcast first and fell back to sort-merge when it failed"
    correct: false
    explanation: "Spark doesn't 'fall back' between strategies for the same join. Each join in the plan has its strategy determined during physical planning."
  - id: c
    text: "The join is using a two-phase approach: hash first, then sort-merge for overflow"
    correct: false
    explanation: "There is no two-phase join strategy in Spark. These are two separate joins in the query, each with its own strategy."
  - id: d
    text: "This is a Spark bug - a join should use only one strategy"
    correct: false
    explanation: "A query can have multiple joins, and each can use a different strategy. This is normal and expected."
explanation: "Reading query plans is a critical debugging skill. Key operators to know: Exchange (shuffle), BroadcastExchange (broadcast), WholeStageCodegen (Tungsten-optimized), Filter/Project (pushdown candidates), and the various Join types. In interviews, being able to explain a physical plan and identify optimization opportunities demonstrates production experience."
---

Query plan analysis is a staff/senior-level skill that separates experienced practitioners from textbook learners.
```

**File: `spark-state-management-streaming.md`**
```markdown
---
title: "State Management in Streaming"
difficulty: "Hard"
tags: ["spark", "streaming", "state-management"]
question: "In Spark Structured Streaming, what happens to operator state when a streaming query is restarted from a checkpoint?"
multi_select: false
answers:
  - id: a
    text: "State is recovered from the checkpoint and processing resumes from the last committed offset"
    correct: true
    explanation: "Checkpoints store: 1) source offsets, 2) operator state (e.g., running aggregation values, dedup keys), 3) sink commit log. On restart, Spark restores all state and reprocesses any uncommitted micro-batches."
  - id: b
    text: "State is lost and must be rebuilt by reprocessing all historical data"
    correct: false
    explanation: "State recovery is the whole point of checkpointing. Without checkpoints, state would be lost, but with them, recovery is fast."
  - id: c
    text: "State is recovered but offsets are reset to the beginning of the source"
    correct: false
    explanation: "Both state and offsets are recovered from the checkpoint. Resetting offsets would cause reprocessing and potential duplicates."
  - id: d
    text: "State is only recovered if the query plan hasn't changed"
    correct: false
    explanation: "While some query changes are incompatible with existing checkpoints (e.g., changing aggregation columns), state recovery works as long as the operator structure is compatible."
explanation: "State management is critical for production streaming. Key considerations: checkpoint location must be on reliable storage (HDFS/S3, not local disk). State size grows with distinct keys (e.g., groupBy keys), so watermarks are essential to expire old state. RocksDB state backend (mapGroupsWithState) is needed for very large state. Breaking changes to query structure require careful checkpoint migration."
---

Stateful streaming is an advanced topic that tests production streaming experience.
```

**File: `spark-tungsten-codegen.md`**
```markdown
---
title: "Tungsten and Whole-Stage Code Generation"
difficulty: "Hard"
tags: ["spark", "optimization", "tungsten"]
question: "What does Spark's whole-stage code generation (Tungsten) do?"
multi_select: false
answers:
  - id: a
    text: "Fuses multiple operators into a single optimized function, eliminating virtual method calls and intermediate data materialization"
    correct: true
    explanation: "Whole-stage codegen compiles a chain of operators (filter, project, aggregate) into a single Java function. This eliminates the overhead of calling separate operator.next() methods and avoids creating intermediate Row objects."
  - id: b
    text: "Generates GPU-optimized code for parallel data processing"
    correct: false
    explanation: "Tungsten generates Java bytecode for CPU execution, not GPU code. GPU support requires separate frameworks like RAPIDS."
  - id: c
    text: "Compiles SQL queries directly to machine code, bypassing the JVM"
    correct: false
    explanation: "Tungsten generates Java source code that is compiled by the JVM's JIT compiler. It doesn't bypass the JVM."
  - id: d
    text: "Creates custom serialization formats for each data type to avoid Java object overhead"
    correct: false
    explanation: "Tungsten does use its own binary memory format (UnsafeRow) for memory management, but whole-stage code generation specifically refers to the operator fusion optimization."
explanation: "Tungsten has two key components: 1) Memory management (off-heap UnsafeRow format, avoiding GC overhead), 2) Whole-stage code generation (operator fusion into single functions). In physical plans, 'WholeStageCodegen' nodes show where this optimization applies. Operations that break codegen (e.g., Python UDFs, some complex expressions) show as separate stages."
---

Tungsten optimization is a deep Spark internals topic for staff-level interviews.
```

**File: `spark-partition-strategy-choice.md`**
```markdown
---
title: "Partition Strategy Selection"
difficulty: "Hard"
tags: ["spark", "partitioning", "performance", "data-modeling"]
question: "You're writing a large DataFrame to a Hive/Delta table that will be queried by date and region. Which partitioning approach is best?"
multi_select: false
answers:
  - id: a
    text: "partitionBy('date') with bucketBy on 'region' to avoid small files while enabling predicate pushdown on both columns"
    correct: true
    explanation: "partitionBy('date') creates a directory per date (enabling date-level predicate pushdown and partition pruning). bucketBy('region') pre-sorts data within each date partition into a fixed number of files, avoiding the small-file problem that partitionBy('date', 'region') would create."
  - id: b
    text: "partitionBy('date', 'region') for maximum query pruning on both columns"
    correct: false
    explanation: "While this enables pruning on both columns, it creates a directory for every date-region combination, leading to potentially millions of small files (small file problem). This degrades read performance and metadata operations."
  - id: c
    text: "repartition('date', 'region') before writing without partitionBy"
    correct: false
    explanation: "repartition() controls the number of output files but doesn't create Hive-style partitions. Queries would need to scan all files since there's no partition pruning."
  - id: d
    text: "Z-order the data by date and region before writing as a single large partition"
    correct: false
    explanation: "Z-ordering (available in Delta Lake) helps with data skipping but doesn't replace partitioning for time-based data. Date partitioning is still recommended for time-series data to enable efficient partition pruning."
explanation: "The partition strategy must balance query patterns, file counts, and data volumes. Rules of thumb: partition on the most common filter column (usually date), bucket on secondary filter columns. Aim for partition sizes of 128MB-1GB. Common mistakes: over-partitioning (too many small files), under-partitioning (full table scans), not considering downstream query patterns."
---

Table partitioning strategy is a practical design question that tests production data engineering experience.
```

**File: `spark-shuffle-internals.md`**
```markdown
---
title: "Shuffle Internals"
difficulty: "Hard"
tags: ["spark", "shuffles", "internals", "performance"]
question: "During a Spark shuffle, what happens between the map and reduce phases?"
multi_select: false
answers:
  - id: a
    text: "Map tasks write sorted, partitioned data to local disk; reduce tasks fetch their partitions over the network via the block transfer service"
    correct: true
    explanation: "Map tasks sort output by partition ID, write to local shuffle files (one per map task), and register file locations with the Driver. Reduce tasks then fetch their partitions from the appropriate map task nodes using the block transfer service (Netty-based)."
  - id: b
    text: "Data is written to HDFS/S3 by map tasks and read from there by reduce tasks"
    correct: false
    explanation: "Shuffle data is written to local disk on executor nodes, not to distributed storage like HDFS. This is why losing an executor can require recomputing the shuffle output."
  - id: c
    text: "Map tasks send data directly to reduce tasks over TCP connections without any disk I/O"
    correct: false
    explanation: "Shuffle data is always written to disk first (for fault tolerance and to handle data larger than memory). It is then served to reduce tasks. Push-based shuffle (Spark 3.2+) can change this flow slightly."
  - id: d
    text: "The Driver collects all shuffle data and redistributes it to the appropriate reduce tasks"
    correct: false
    explanation: "The Driver only tracks metadata (which map task produced which shuffle blocks). Data transfer is executor-to-executor, avoiding a Driver bottleneck."
explanation: "Shuffle internals: 1) Map side: sort by partition, write to shuffle files, 2) Register shuffle output locations with Driver, 3) Reduce side: fetch partitions from map nodes, 4) Merge and sort fetched data. Key tuning: spark.shuffle.compress, spark.reducer.maxSizeInFlight, spark.shuffle.io.maxRetries. External shuffle service (ESS) preserves shuffle files when executors are removed (important with dynamic allocation)."
---

Shuffle internals knowledge demonstrates deep Spark expertise expected at staff level.
```

**Step 5: Run the build to verify questions parse correctly**

Run: `npm run build 2>&1 | tail -20`
Expected: Questions processed successfully, no parsing errors for tools skill.

**Step 6: Commit**

```bash
git add questions/tools/
git commit -m "feat(content): add 28 Spark quiz questions across easy/medium/hard"
```

---

### Task 7: Create Track YAML Files

**Files:**
- Create: `questions/tools/tracks/` - 7 track YAML files

**Step 1: Create tracks directory**

```bash
mkdir -p questions/tools/tracks
```

**Step 2: Create track files**

**File: `questions/tools/tracks/spark-architecture.yaml`**
```yaml
id: tools-spark-architecture
name: "Spark Architecture"
tagline: "Master Spark's distributed execution model"
interviewer_says: "explain how Spark executes a job"
you_need: "driver/executor model, DAGs, stages, tasks"
description: "Understand the fundamentals of how Spark distributes and executes work across a cluster. This is the foundation for all other Spark topics."
icon: "cpu"
category: "Spark Core"
order: 1
prerequisites: []

levels:
  - level: 1
    title: "Driver & Executors"
    description: "Learn the roles of Driver and Executor processes"
    concepts: ["driver", "executors", "cluster manager"]
    questions:
      - spark-driver-executor-roles
    unlock: always_unlocked

  - level: 2
    title: "DAG Execution"
    description: "Understand how Spark creates and executes a DAG of stages"
    concepts: ["DAG", "stages", "tasks", "shuffle boundaries"]
    questions:
      - spark-dag-stages-tasks
      - spark-deploy-modes
    unlock: complete_previous

  - level: 3
    title: "Shuffle Internals"
    description: "Deep dive into the shuffle process between stages"
    concepts: ["shuffle write", "shuffle read", "block transfer"]
    questions:
      - spark-shuffle-internals
    unlock: complete_previous
```

**File: `questions/tools/tracks/spark-rdd-dataframe.yaml`**
```yaml
id: tools-spark-rdd-dataframe
name: "RDDs vs DataFrames"
tagline: "Choose the right abstraction for the job"
interviewer_says: "when would you use RDDs instead of DataFrames?"
you_need: "RDD vs DataFrame trade-offs, lazy evaluation, Catalyst"
description: "Understand Spark's core abstractions and when to use each. Most code should use DataFrames, but knowing why is what interviewers test."
icon: "layers"
category: "Spark Core"
order: 2
prerequisites: []

levels:
  - level: 1
    title: "Core Abstractions"
    description: "Understand RDD vs DataFrame vs Dataset"
    concepts: ["RDD", "DataFrame", "Dataset"]
    questions:
      - spark-rdd-vs-dataframe
    unlock: always_unlocked

  - level: 2
    title: "Lazy Evaluation"
    description: "How Spark defers computation for optimization"
    concepts: ["lazy evaluation", "transformations", "actions"]
    questions:
      - spark-lazy-evaluation
    unlock: complete_previous

  - level: 3
    title: "Catalyst Optimizer"
    description: "How Spark optimizes DataFrame operations"
    concepts: ["Catalyst", "logical plan", "physical plan", "code generation"]
    questions:
      - spark-catalyst-optimizer
      - spark-tungsten-codegen
    unlock: complete_previous
```

**File: `questions/tools/tracks/spark-partitioning.yaml`**
```yaml
id: tools-spark-partitioning
name: "Partitioning & Shuffles"
tagline: "Control data distribution for optimal performance"
interviewer_says: "how would you handle a slow Spark job with data skew?"
you_need: "partitioning strategies, shuffle mechanics, skew handling"
description: "Partitioning is the #1 lever for Spark performance. Learn to control data distribution, minimize shuffles, and handle skew."
icon: "grid-3x3"
category: "Spark Performance"
order: 3
prerequisites: ["tools-spark-architecture"]

levels:
  - level: 1
    title: "Partition Basics"
    description: "Understand how data is divided into partitions"
    concepts: ["partitions", "repartition", "coalesce"]
    questions:
      - spark-partition-basics
      - spark-coalesce-vs-repartition
    unlock: always_unlocked

  - level: 2
    title: "Shuffle Operations"
    description: "Identify which operations cause shuffles and why"
    concepts: ["wide transformations", "shuffle", "exchange"]
    questions:
      - spark-shuffle-operations
    unlock: complete_previous

  - level: 3
    title: "Data Skew"
    description: "Diagnose and fix data skew problems"
    concepts: ["skew", "salting", "hot keys"]
    questions:
      - spark-data-skew
    unlock: complete_previous
```

**File: `questions/tools/tracks/spark-caching-memory.yaml`**
```yaml
id: tools-spark-caching-memory
name: "Caching & Memory"
tagline: "Optimize memory usage and caching strategies"
interviewer_says: "explain Spark's memory model"
you_need: "cache vs persist, storage levels, memory regions, tuning"
description: "Understand how Spark manages memory across storage and execution, and when caching helps vs hurts performance."
icon: "hard-drive"
category: "Spark Performance"
order: 4
prerequisites: ["tools-spark-architecture"]

levels:
  - level: 1
    title: "Cache & Persist"
    description: "Learn when and how to cache DataFrames"
    concepts: ["cache", "persist", "storage levels"]
    questions:
      - spark-cache-vs-persist
    unlock: always_unlocked

  - level: 2
    title: "Memory Model"
    description: "Understand Spark's unified memory manager"
    concepts: ["storage memory", "execution memory", "unified memory"]
    questions:
      - spark-memory-model
    unlock: complete_previous

  - level: 3
    title: "Resource Management"
    description: "Tune executor resources and dynamic allocation"
    concepts: ["dynamic allocation", "executor memory", "overhead"]
    questions:
      - spark-dynamic-allocation
      - spark-speculation
    unlock: complete_previous
```

**File: `questions/tools/tracks/spark-joins.yaml`**
```yaml
id: tools-spark-joins
name: "Spark Joins"
tagline: "Master join strategies and optimization"
interviewer_says: "how does Spark choose a join strategy?"
you_need: "broadcast, sort-merge, shuffle hash, join selection"
description: "Joins are the most expensive operations in Spark. Learn the different strategies, when each is used, and how to optimize them."
icon: "merge"
category: "Spark Performance"
order: 5
prerequisites: ["tools-spark-partitioning"]

levels:
  - level: 1
    title: "Broadcast Joins"
    description: "Use broadcast joins for small-large table joins"
    concepts: ["broadcast join", "broadcast threshold", "auto-broadcast"]
    questions:
      - spark-broadcast-join-basics
    unlock: always_unlocked

  - level: 2
    title: "Sort-Merge & Hash Joins"
    description: "Understand large-table join strategies"
    concepts: ["sort-merge join", "shuffle hash join", "join selection"]
    questions:
      - spark-sort-merge-join
      - spark-accumulator-broadcast
    unlock: complete_previous

  - level: 3
    title: "Skew Joins & Optimization"
    description: "Handle join skew and read query plans"
    concepts: ["skew join", "AQE", "query plans"]
    questions:
      - spark-skew-join-optimization
      - spark-query-plan-analysis
    unlock: complete_previous
```

**File: `questions/tools/tracks/spark-sql-catalyst.yaml`**
```yaml
id: tools-spark-sql-catalyst
name: "Spark SQL & Catalyst"
tagline: "Understand query optimization from SQL to execution"
interviewer_says: "walk me through how Spark optimizes a query"
you_need: "Catalyst phases, predicate pushdown, AQE, codegen"
description: "Learn how Spark transforms SQL and DataFrame operations into optimized physical execution plans through the Catalyst optimizer."
icon: "sparkles"
category: "Spark Advanced"
order: 6
prerequisites: ["tools-spark-rdd-dataframe"]

levels:
  - level: 1
    title: "Catalyst Pipeline"
    description: "Walk through the query optimization phases"
    concepts: ["analysis", "logical optimization", "physical planning"]
    questions:
      - spark-catalyst-optimizer
    unlock: always_unlocked

  - level: 2
    title: "Adaptive Query Execution"
    description: "Runtime optimizations based on actual data statistics"
    concepts: ["AQE", "runtime re-optimization", "partition coalescing"]
    questions:
      - spark-aqe
    unlock: complete_previous

  - level: 3
    title: "Table Design"
    description: "Choose partitioning and bucketing strategies for optimal query performance"
    concepts: ["partitionBy", "bucketBy", "file layout"]
    questions:
      - spark-partition-strategy-choice
    unlock: complete_previous
```

**File: `questions/tools/tracks/spark-structured-streaming.yaml`**
```yaml
id: tools-spark-structured-streaming
name: "Structured Streaming"
tagline: "Build reliable streaming pipelines with Spark"
interviewer_says: "design a real-time pipeline with exactly-once guarantees"
you_need: "micro-batch, watermarks, output modes, state, exactly-once"
description: "Master Spark's streaming engine. From basic micro-batch processing to advanced stateful operations and exactly-once delivery."
icon: "radio"
category: "Spark Advanced"
order: 7
prerequisites: ["tools-spark-architecture"]

levels:
  - level: 1
    title: "Streaming Fundamentals"
    description: "Understand the unbounded table model and micro-batch processing"
    concepts: ["micro-batch", "unbounded table", "triggers"]
    questions:
      - spark-structured-streaming-basics
      - spark-output-modes
    unlock: always_unlocked

  - level: 2
    title: "Watermarks & Late Data"
    description: "Handle late-arriving data with watermarks"
    concepts: ["watermarks", "late data", "window aggregations"]
    questions:
      - spark-watermarks
    unlock: complete_previous

  - level: 3
    title: "State & Exactly-Once"
    description: "Manage state and guarantee exactly-once processing"
    concepts: ["state management", "checkpoints", "exactly-once"]
    questions:
      - spark-state-management-streaming
      - spark-exactly-once-streaming
    unlock: complete_previous
```

**Step 3: Run the build to verify tracks parse correctly**

Run: `npm run build 2>&1 | tail -20`
Expected: Tracks processed successfully for tools skill.

**Step 4: Commit**

```bash
git add questions/tools/tracks/
git commit -m "feat(content): add 7 Spark solution playbook tracks"
```

---

### Task 8: Fix Remaining Type Errors and Build Verification

**Files:**
- Potentially modify: any file with `Record<SkillType, ...>` that was missed
- Potentially modify: `src/components/onboarding/OnboardingModal.tsx` (if WeakestSkill is displayed)
- Potentially modify: `src/stores/statsStore.ts` or similar

**Step 1: Run full type check**

Run: `npx tsc -b --noEmit 2>&1`
Expected: No errors. If errors exist, fix each one (likely missing `tools` key in Record literals).

**Step 2: Search for hardcoded skill lists**

Run: `grep -rn "'sql'\|'python'\|'debug'\|'architecture'\|'modeling'" src/ --include='*.ts' --include='*.tsx' | grep -v node_modules | grep -v '.d.ts'`

Check every occurrence to see if `'tools'` needs to be added.

**Step 3: Run the full build**

Run: `npm run build`
Expected: Build succeeds. The only warnings should be the expected ones (pyodide externalization, chunk size).

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: add tools skill to all remaining type-keyed records"
```

---

### Task 9: Manual Smoke Test

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify the following**

1. Homepage shows 6 skill cards including "Tools & Frameworks"
2. Clicking "Tools & Frameworks" navigates to `/tools`
3. The skill page shows quiz questions with correct count
4. "Solution Playbooks" tab shows 7 Spark tracks grouped by category
5. Clicking a track shows the timeline with levels
6. Opening a quiz question renders the quiz UI correctly
7. Submitting an answer shows correct/incorrect feedback
8. Breadcrumb shows "Tools & Frameworks" (not "Architecture")

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: add Tools & Frameworks skill track with 28 Spark quiz questions and 7 playbook tracks"
```

---

## Summary

| Task | Description | Files | Est. |
|------|-------------|-------|------|
| 1 | TypeScript types | `src/types/index.ts` | 5 min |
| 2 | Store updates | `questionStore.ts`, `trackStore.ts` | 3 min |
| 3 | Page updates | 4 page files | 5 min |
| 4 | QuizQuestionView | 1 component | 3 min |
| 5 | Build script | `processQuestions.ts` | 5 min |
| 6 | Quiz questions | 28 markdown files | 10 min |
| 7 | Track YAMLs | 7 YAML files | 5 min |
| 8 | Fix remaining | Various | 5 min |
| 9 | Smoke test | - | 5 min |

**Total: ~46 minutes of implementation**

**Future work (not in this plan):**
- Config-writing question type (write dbt YAML, Airflow DAGs)
- Troubleshooting question type (fix broken configs with error logs)
- Additional tools: dbt, Airflow, Kafka, Flink tracks
