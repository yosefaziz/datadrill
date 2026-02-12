import { useEffect, useCallback, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { InterviewRound, SqlQuestion, DebugQuestion, Question } from '@/types';
import { useEditorStore } from '@/stores/editorStore';
import { useExecutor } from '@/hooks/useExecutor';
import { useValidation } from '@/hooks/useValidation';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { OutputPanel } from '@/components/editor/OutputPanel';

interface InterviewCodeRoundProps {
  round: InterviewRound;
  onSubmit: (passed: boolean, score: number, answer: string) => void;
}

function getLanguage(round: InterviewRound): 'sql' | 'python' {
  if (round.type === 'python') return 'python';
  if (round.type === 'debug') return round.language || 'sql';
  return 'sql';
}

function buildQuestion(round: InterviewRound): Question {
  const language = getLanguage(round);

  if (round.questionType === 'fix' || round.type === 'debug') {
    const debugQ: DebugQuestion = {
      id: round.id,
      skill: 'debug',
      language,
      title: round.title,
      difficulty: 'Medium',
      tags: [],
      description: round.description,
      expectedOutput: round.expectedOutput || '',
      tables: [...(round.tables || []), ...(round.hiddenTables || [])],
      brokenCode: round.initialCode || '',
      expectedOutputQuery: round.expectedOutputQuery || '',
    };
    return debugQ;
  }

  if (round.type === 'python') {
    return {
      id: round.id,
      skill: 'python',
      pythonType: 'pyspark' as const,
      title: round.title,
      difficulty: 'Medium',
      tags: [],
      description: round.description,
      expectedOutput: round.expectedOutput || '',
      tables: [...(round.tables || []), ...(round.hiddenTables || [])],
      expectedOutputQuery: round.expectedOutputQuery || '',
    };
  }

  const sqlQ: SqlQuestion = {
    id: round.id,
    skill: 'sql',
    title: round.title,
    difficulty: 'Medium',
    tags: [],
    description: round.description,
    expectedOutput: round.expectedOutput || '',
    tables: [...(round.tables || []), ...(round.hiddenTables || [])],
    expectedOutputQuery: round.expectedOutputQuery || '',
  };
  return sqlQ;
}

export function InterviewCodeRound({ round, onSubmit }: InterviewCodeRoundProps) {
  const { code, setCode, clearCode } = useEditorStore();
  const question = buildQuestion(round);
  const { isInitialized, isLoading, error, result, isExecuting, executeCode, clearResult } =
    useExecutor(question);
  const { validationResult, isValidating, validate, clearValidation } = useValidation();
  const submittedRef = useRef(false);

  // Reset state when round changes
  useEffect(() => {
    submittedRef.current = false;
    clearResult();
    clearValidation();

    if (round.questionType === 'fix' && round.initialCode) {
      setCode(round.initialCode);
    } else {
      clearCode();
    }
  }, [round.id, round.questionType, round.initialCode, setCode, clearCode, clearResult, clearValidation]);

  const handleRun = useCallback(async () => {
    if (!isInitialized || !code.trim()) return;
    clearValidation();
    await executeCode(code, round.tables || []);
  }, [isInitialized, code, clearValidation, executeCode, round.tables]);

  const handleSubmit = useCallback(async () => {
    if (!isInitialized || !code.trim() || submittedRef.current) return;
    submittedRef.current = true;

    clearResult();
    const result = await validate(question, code);
    const score = result.totalDatasets > 0
      ? result.passedDatasets / result.totalDatasets
      : result.passed ? 1 : 0;
    onSubmit(result.passed, score, code);
  }, [isInitialized, code, question, clearResult, validate, onSubmit]);

  // Loading state for executor
  if (isLoading) {
    const language = getLanguage(round);
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary mb-2">
            {language === 'python' ? 'Initializing Python engine...' : 'Initializing SQL engine...'}
          </div>
          <div className="text-sm text-text-muted">This may take a moment</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg text-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left panel - problem description */}
        <Panel defaultSize={40} minSize={20}>
          <div className="h-full bg-surface rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">{round.title}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div
                className="prose prose-sm max-w-none text-text-secondary
                  prose-headings:text-text-primary prose-strong:text-text-primary
                  prose-code:text-primary prose-code:bg-bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-bg-secondary prose-pre:text-text-primary"
                dangerouslySetInnerHTML={{ __html: round.description }}
              />

              {/* Show visible table schemas */}
              {round.tables && round.tables.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                    Available Tables
                  </h3>
                  {round.tables.map((table) => (
                    <div key={table.name} className="bg-bg-secondary rounded-lg p-3">
                      <div className="text-sm font-mono font-semibold text-primary mb-2">
                        {table.name}
                      </div>
                      <div className="overflow-x-auto">
                        <pre className="text-xs text-text-secondary whitespace-pre-wrap">
                          {table.visibleData}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show expected output if provided */}
              {round.expectedOutput && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">
                    Expected Output
                  </h3>
                  <div className="bg-bg-secondary rounded-lg p-3">
                    <pre className="text-xs text-text-secondary whitespace-pre-wrap">
                      {round.expectedOutput}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-border hover:bg-border-focus transition-colors mx-1 rounded" />

        {/* Right panel - editor + output */}
        <Panel defaultSize={60} minSize={30}>
          <PanelGroup direction="vertical" className="h-full">
            <Panel defaultSize={60} minSize={30}>
              <CodeEditor
                language={getLanguage(round)}
                onRun={handleRun}
                onSubmit={handleSubmit}
                isExecuting={isExecuting}
                isValidating={isValidating}
              />
            </Panel>

            <PanelResizeHandle className="h-2 bg-border hover:bg-border-focus transition-colors my-1 rounded" />

            <Panel defaultSize={40} minSize={20}>
              <div className="h-full">
                <OutputPanel
                  result={result}
                  validationResult={validationResult}
                  isLoading={isExecuting || isValidating}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
