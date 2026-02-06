import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Puzzle, ClipboardList } from 'lucide-react';
import { ModelingQuestion, ModelingField, TableType } from '@/types';
import { useModelingStore } from '@/stores/modelingStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { validateModelingQuestion } from '@/services/validation/ModelingValidator';
import { FieldSoup } from './FieldSoup';
import { TableCanvas } from './TableCanvas';
import { ScoreBars } from './ScoreBars';
import { ModelingFeedback } from './ModelingFeedback';
import { AddTableModal } from './AddTableModal';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

interface ModelingQuestionViewProps {
  question: ModelingQuestion;
}

export function ModelingQuestionView({ question }: ModelingQuestionViewProps) {
  const {
    tables,
    validationResult,
    isSubmitted,
    addTable,
    addFieldToTable,
    removeFieldFromTable,
    removeTable,
    setValidationResult,
    reset,
  } = useModelingStore();

  const user = useAuthStore((s) => s.user);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);

  const [activeField, setActiveField] = useState<ModelingField | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);

  useEffect(() => {
    reset();
  }, [question.id, reset]);

  const handleDragStart = (event: DragStartEvent) => {
    const fieldId = event.active.id as string;
    const field = question.fields.find((f) => f.id === fieldId);
    setActiveField(field || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveField(null);
    const { active, over } = event;
    if (!over) return;

    const fieldId = active.id as string;
    const targetId = over.id as string;

    // Check if dropping on a table
    const targetTable = tables.find((t) => t.id === targetId);
    if (targetTable) {
      addFieldToTable(targetId, fieldId);
    }
  };

  const handleAddTable = (type: TableType, name: string) => {
    addTable(type, name);
    setShowAddTableModal(false);
  };

  const handleSubmit = async () => {
    const result = validateModelingQuestion(question, tables);
    setValidationResult(result);

    try {
      await submitAnswer(
        {
          question_id: question.id,
          skill: 'modeling',
          difficulty: question.difficulty,
          answer: JSON.stringify(tables),
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
    reset();
  };

  // Count how many times each field is used
  const fieldUsageCounts = new Map<string, number>();
  tables.forEach((t) => {
    t.fieldIds.forEach((fieldId) => {
      fieldUsageCounts.set(fieldId, (fieldUsageCounts.get(fieldId) || 0) + 1);
    });
  });
  const hasTablesWithFields = tables.some((t) => t.fieldIds.length > 0);

  // Calculate live scores for preview
  const liveResult = hasTablesWithFields
    ? validateModelingQuestion(question, tables)
    : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 p-4 h-full flex flex-col">
        <Breadcrumb
          items={[
            { label: 'Modeling', href: '/modeling' },
            { label: question.title },
          ]}
        />
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-auto lg:overflow-hidden">
          {/* Left Panel - Question, Fields, Add Table */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4 flex-shrink-0 lg:flex-shrink">
            {/* Question/Objective Panel */}
            <div className="bg-surface rounded-lg shadow-md p-4">
              <h1 className="text-xl font-bold text-text-primary">{question.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-bg-secondary text-text-secondary px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 p-3 bg-warning/10 rounded-lg ring-1 ring-warning/20">
                <div className="text-sm font-semibold text-warning">Constraint</div>
                <div className="text-sm text-text-secondary">{question.constraint}</div>
              </div>
              <p className="mt-3 text-sm text-text-secondary">{question.prompt}</p>
            </div>

            {/* Available Fields - Interactive area */}
            <div className="flex-1 bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl shadow-lg p-4 overflow-hidden flex flex-col ring-1 ring-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Puzzle className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Drag Fields to Tables
                </h3>
              </div>
              <p className="text-xs text-text-muted mb-3">
                Drag these fields into the tables on the right
              </p>
              <FieldSoup
                fields={question.fields}
                usageCounts={fieldUsageCounts}
                disabled={isSubmitted}
              />
            </div>

            {/* Add Table - Prominent action area */}
            {!isSubmitted && (
              <button
                onClick={() => setShowAddTableModal(true)}
                className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-primary/20 hover:from-accent/30 hover:to-primary/30 transition-all group ring-1 ring-accent/30 hover:ring-accent/50 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl text-accent group-hover:scale-110 transition-transform">+</span>
                  <div className="text-left">
                    <div className="font-semibold text-text-primary">Create Table</div>
                    <div className="text-xs text-text-secondary">Add a Fact or Dimension table</div>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Right Panel - Score + Tables + Submit */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4 flex-shrink-0 lg:flex-shrink">
            {/* Live Score - Top right */}
            {!isSubmitted && (
              <div className="bg-surface rounded-lg shadow-md p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Live Score</h3>
                <ScoreBars
                  storageScore={liveResult?.storageScore || 0}
                  queryCostScore={liveResult?.queryCostScore || 0}
                  storageThresholds={question.scoreThresholds.storage}
                  queryCostThresholds={question.scoreThresholds.queryCost}
                />
              </div>
            )}

            {/* Table Canvas */}
            <div className="flex-1 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
                <div className="text-sm text-text-secondary">
                  {isSubmitted
                    ? 'Review your model'
                    : tables.length === 0
                      ? 'Create tables and drag fields into them'
                      : `Your Schema (${tables.length} table${tables.length !== 1 ? 's' : ''})`}
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {isSubmitted && validationResult ? (
                  <ModelingFeedback
                    result={validationResult}
                    thresholds={question.scoreThresholds}
                  />
                ) : tables.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-text-muted">
                    <div className="text-center">
                      <ClipboardList className="w-12 h-12 mx-auto mb-2 text-text-muted" />
                      <div>No tables yet</div>
                      <div className="text-sm">Click "Create Table" on the left to start</div>
                    </div>
                  </div>
                ) : (
                  <TableCanvas
                    tables={tables}
                    fields={question.fields}
                    onRemoveField={removeFieldFromTable}
                    onRemoveTable={removeTable}
                    disabled={isSubmitted}
                  />
                )}
              </div>

              {/* Submit button - Bottom right */}
              <div className="px-6 py-3 border-t border-border bg-bg-secondary flex justify-end">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!hasTablesWithFields}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      hasTablesWithFields
                        ? 'bg-primary text-text-primary hover:bg-primary-hover shadow-md'
                        : 'bg-border text-text-muted cursor-not-allowed'
                    }`}
                  >
                    Submit Model
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 rounded-lg font-medium bg-accent text-text-primary hover:bg-accent-hover transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddTableModal && (
        <AddTableModal
          onAdd={handleAddTable}
          onClose={() => setShowAddTableModal(false)}
        />
      )}

      {/* Drag Overlay */}
      <DragOverlay>
        {activeField && (
          <div className="px-3 py-2 rounded-lg border-2 border-primary bg-primary/10 shadow-xl">
            <span className="font-medium text-sm text-text-primary">{activeField.name}</span>
            <span className="ml-2 text-xs text-text-muted">{activeField.dataType}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
