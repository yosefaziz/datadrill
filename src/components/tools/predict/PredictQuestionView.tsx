import { useState, useEffect } from 'react';
import { PredictQuestion } from '@/types';
import { usePredictStore } from '@/stores/predictStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { useTrackStore } from '@/stores/trackStore';
import { validatePredictQuestion } from '@/services/validation/PredictValidator';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BugReportPopover } from '@/components/question-view/BugReportPopover';
import { TimerWidget } from '@/components/question-view/TimerWidget';
import { QuestionNavButtons } from '@/components/question-view/QuestionNavButtons';
import { QuestionTabs, QuestionTab } from '@/components/question-view/QuestionTabs';
import { HintsPanel } from '@/components/question-view/HintsPanel';
import { DiscussionPanel } from '@/components/question-view/DiscussionPanel';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

interface PredictQuestionViewProps {
  question: PredictQuestion;
  trackId: string | null;
  prevUrl: string | null;
  nextUrl: string | null;
}

export function PredictQuestionView({ question, trackId, prevUrl, nextUrl }: PredictQuestionViewProps) {
  const {
    predictedRows,
    validationResult,
    isSubmitted,
    initializeGrid,
    setCellValue,
    setValidationResult,
    clearValidation,
    reset,
  } = usePredictStore();
  const user = useAuthStore((s) => s.user);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);
  const markQuestionCompleted = useTrackStore((s) => s.markQuestionCompleted);
  const [activeTab, setActiveTab] = useState<QuestionTab>('description');
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { hasSubmitted: hasSubmittedForGate } = useSubmissionGate(question.id);
  const hints = question.hints || [];

  useEffect(() => {
    reset();
    setActiveTab('description');
  }, [question.id, reset]);

  useEffect(() => {
    initializeGrid(question.expectedRows.length, question.expectedColumns.length, question.givenColumns, question.expectedRows);
  }, [question.id, question.expectedRows.length, question.expectedColumns.length, question.givenColumns, question.expectedRows, initializeGrid]);

  const handleSubmit = async () => {
    const result = validatePredictQuestion(question, predictedRows);
    setValidationResult(result);

    if (result.passed && trackId) {
      markQuestionCompleted(trackId, question.id);
    }

    try {
      await submitAnswer(
        {
          question_id: question.id,
          skill: question.skill,
          difficulty: question.difficulty,
          answer: JSON.stringify(predictedRows),
          passed: result.passed,
          result_meta: result as unknown as Record<string, unknown>,
        },
        user?.id || null
      );
    } catch {
      // Non-critical
    }
  };

  const handleReset = () => {
    clearValidation();
  };

  const handleClearAll = () => {
    reset();
    initializeGrid(question.expectedRows.length, question.expectedColumns.length, question.givenColumns, question.expectedRows);
  };

  const handleTabChange = (tab: QuestionTab) => {
    if (tab === 'hints' || tab === 'discussion') {
      if (!requireAuth()) return;
    }
    if (tab === 'discussion' && !hasSubmittedForGate) return;
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="space-y-4">
            <div className="prose prose-slate max-w-none prose-invert">
              {question.description && (
                <div
                  className="text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              )}
            </div>
            <div className="rounded-lg overflow-hidden ring-1 ring-white/10">
              <div className="px-3 py-2 bg-bg-secondary text-xs font-medium text-text-muted uppercase tracking-wider">
                {question.language === 'python' ? 'PySpark' : 'SQL'} Code
              </div>
              <pre className="p-4 bg-[#1e1e1e] text-sm text-text-primary overflow-x-auto font-mono leading-relaxed">
                <code>{question.code}</code>
              </pre>
            </div>
            {question.tables.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Input Data</div>
                {question.tables.map((table) => (
                  <div key={table.name} className="rounded-lg overflow-hidden ring-1 ring-white/10">
                    <div className="px-3 py-2 bg-bg-secondary text-xs font-medium text-text-muted">
                      {table.name}
                    </div>
                    <pre className="p-3 bg-[#1e1e1e] text-xs text-text-primary overflow-x-auto font-mono">
                      {table.visibleData}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmittedForGate} />;
    }
  };

  const givenCols = question.givenColumns ?? [];
  const hasFilled = predictedRows.some((row) => row.some((cell, colIdx) => !givenCols.includes(colIdx) && cell.trim() !== ''));

  const getCellResult = (row: number, col: number) => {
    return validationResult?.cellResults.find((c) => c.row === row && c.col === col);
  };

  return (
    <div className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-start justify-between">
        <Breadcrumb
          items={[
            { label: 'Tools & Frameworks', href: '/tools' },
            { label: question.title },
          ]}
        />
        <div className="flex items-center gap-3">
          <TimerWidget />
          <QuestionNavButtons prevUrl={prevUrl} nextUrl={nextUrl} />
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-auto lg:overflow-hidden">
        {/* Left Panel - Code & Data */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                  Predict
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <BugReportPopover questionId={question.id} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{question.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  question.difficulty === 'Easy'
                    ? 'bg-success/20 text-success'
                    : question.difficulty === 'Medium'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-error/20 text-error'
                }`}
              >
                {question.difficulty}
              </span>
            </div>
          </div>

          <QuestionTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            hasHints={hints.length > 0}
            isAuthenticated={isAuthenticated}
            hasSubmitted={hasSubmittedForGate}
            showSolutions={false}
          />
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Panel - Prediction Grid */}
        <div className="w-full lg:w-1/2 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
          <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {isSubmitted
                  ? validationResult?.passed
                    ? `All correct! ${validationResult.correctCells}/${validationResult.totalCells} cells`
                    : `${validationResult?.correctCells ?? 0}/${validationResult?.totalCells ?? 0} cells correct`
                  : 'Fill in the predicted output'}
              </div>
              <div className="flex items-center gap-2">
                {!isSubmitted ? (
                  <>
                    {hasFilled && (
                      <button
                        onClick={handleClearAll}
                        className="px-3 py-2 rounded-lg font-medium text-sm text-text-muted hover:text-text-secondary transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={!hasFilled}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        hasFilled
                          ? 'bg-primary text-white hover:bg-primary-hover'
                          : 'bg-border text-text-muted cursor-not-allowed'
                      }`}
                    >
                      Check Prediction
                    </button>
                  </>
                ) : !validationResult?.passed ? (
                  <>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-2 rounded-lg font-medium text-sm text-text-muted hover:text-text-secondary transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-accent text-white hover:bg-accent-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      Try Again
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {question.expectedColumns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider bg-bg-secondary border-b border-border"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {question.expectedRows.map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {question.expectedColumns.map((_, colIdx) => {
                        const isGiven = givenCols.includes(colIdx);
                        const cellKey = `${rowIdx},${colIdx}`;
                        const options = question.cellOptions?.[cellKey];
                        const cellResult = getCellResult(rowIdx, colIdx);
                        let cellBg = '';
                        if (isSubmitted && cellResult) {
                          cellBg = cellResult.correct
                            ? 'bg-success/10'
                            : 'bg-error/10';
                        }

                        return (
                          <td key={colIdx} className={`px-1 py-1 border-b border-border ${cellBg}`}>
                            {isGiven ? (
                              <div className="px-2 py-1.5 text-sm font-mono text-text-secondary">
                                {question.expectedRows[rowIdx]?.[colIdx]}
                              </div>
                            ) : isSubmitted ? (
                              <div className="px-2 py-1.5">
                                <div className={`text-sm font-mono ${
                                  cellResult?.correct ? 'text-success' : 'text-error'
                                }`}>
                                  {predictedRows[rowIdx]?.[colIdx] || '(empty)'}
                                </div>
                                {cellResult && !cellResult.correct && (
                                  <div className="text-xs text-text-muted mt-0.5">
                                    Expected: {cellResult.expected}
                                  </div>
                                )}
                              </div>
                            ) : options ? (
                              <select
                                value={predictedRows[rowIdx]?.[colIdx] ?? ''}
                                onChange={(e) => setCellValue(rowIdx, colIdx, e.target.value)}
                                className="w-full px-2 py-1.5 bg-bg-secondary rounded text-sm font-mono text-text-primary border border-border focus:border-primary focus:outline-none"
                              >
                                <option value="">Select...</option>
                                {options.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={predictedRows[rowIdx]?.[colIdx] ?? ''}
                                onChange={(e) => setCellValue(rowIdx, colIdx, e.target.value)}
                                className="w-full px-2 py-1.5 bg-bg-secondary rounded text-sm font-mono text-text-primary border border-border focus:border-primary focus:outline-none"
                                placeholder="..."
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
