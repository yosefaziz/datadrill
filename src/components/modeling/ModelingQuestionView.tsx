import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { ModelingQuestion, ModelingField, TableType } from '@/types';
import { useModelingStore } from '@/stores/modelingStore';
import { validateModelingQuestion } from '@/services/validation/ModelingValidator';
import { FieldSoup } from './FieldSoup';
import { TableCanvas } from './TableCanvas';
import { ScoreBars } from './ScoreBars';
import { ModelingFeedback } from './ModelingFeedback';
import { AddTableModal } from './AddTableModal';

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

  const handleSubmit = () => {
    const result = validateModelingQuestion(question, tables);
    setValidationResult(result);
  };

  const handleReset = () => {
    reset();
  };

  // Get assigned field IDs
  const assignedFieldIds = new Set(tables.flatMap((t) => t.fieldIds));
  const unassignedFields = question.fields.filter((f) => !assignedFieldIds.has(f.id));
  const hasTablesWithFields = tables.some((t) => t.fieldIds.length > 0);

  // Calculate live scores for preview
  const liveResult = hasTablesWithFields
    ? validateModelingQuestion(question, tables)
    : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 p-4 h-full">
        <div className="h-full min-h-0 flex gap-4">
          {/* Left Panel - Objective & Field Soup */}
          <div className="w-1/3 flex flex-col gap-4">
            {/* Objective Panel */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <Link
                to="/modeling"
                className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
              >
                &larr; All Questions
              </Link>
              <h1 className="text-xl font-bold text-slate-800">{question.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    question.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-700'
                      : question.difficulty === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {question.difficulty}
                </span>
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-sm font-semibold text-amber-800">Constraint</div>
                <div className="text-sm text-amber-700">{question.constraint}</div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{question.prompt}</p>
            </div>

            {/* Score Bars (live preview) */}
            {!isSubmitted && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Live Score</h3>
                <ScoreBars
                  storageScore={liveResult?.storageScore || 0}
                  queryCostScore={liveResult?.queryCostScore || 0}
                  maxStorage={question.scoreThresholds.storage.yellow * 1.5}
                  maxQueryCost={question.scoreThresholds.queryCost.yellow * 1.5}
                  storageThresholds={question.scoreThresholds.storage}
                  queryCostThresholds={question.scoreThresholds.queryCost}
                />
              </div>
            )}

            {/* Field Soup */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 overflow-hidden flex flex-col">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Available Fields
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {unassignedFields.length} remaining
                </span>
              </h3>
              <FieldSoup
                fields={unassignedFields}
                disabled={isSubmitted}
              />
            </div>
          </div>

          {/* Right Panel - Table Canvas */}
          <div className="w-2/3 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {isSubmitted
                    ? 'Review your model'
                    : `Design your schema (${tables.length} tables)`}
                </div>
                <div className="flex gap-2">
                  {!isSubmitted && (
                    <>
                      <button
                        onClick={() => setShowAddTableModal(true)}
                        className="px-3 py-1.5 rounded-lg font-medium text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        + Add Table
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!hasTablesWithFields}
                        className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                          hasTablesWithFields
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Submit Model
                      </button>
                    </>
                  )}
                  {isSubmitted && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-1.5 rounded-lg font-medium text-sm bg-slate-600 text-white hover:bg-slate-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {isSubmitted && validationResult ? (
                <ModelingFeedback
                  result={validationResult}
                  thresholds={question.scoreThresholds}
                />
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
          <div className="px-3 py-2 rounded-lg border-2 border-blue-400 bg-blue-50 shadow-xl">
            <span className="font-medium text-sm text-slate-800">{activeField.name}</span>
            <span className="ml-2 text-xs text-slate-500">{activeField.dataType}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
