import { useCallback, useEffect, useRef, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ModelingQuestion, ModelingField, TableType } from '@/types';
import { useModelingStore } from '@/stores/modelingStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { validateModelingQuestion } from '@/services/validation/ModelingValidator';
import { FieldDock } from './FieldDock';
import { TableColumns } from './TableColumns';
import { RelationshipLines } from './RelationshipLines';
import { ScoreBars } from './ScoreBars';
import { ModelingFeedback } from './ModelingFeedback';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BugReportPopover } from '@/components/question-view/BugReportPopover';
import { TimerWidget } from '@/components/question-view/TimerWidget';
import { QuestionTabs, QuestionTab } from '@/components/question-view/QuestionTabs';
import { HintsPanel } from '@/components/question-view/HintsPanel';
import { DiscussionPanel } from '@/components/question-view/DiscussionPanel';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

interface ModelingQuestionViewProps {
  question: ModelingQuestion;
}

let factCounter = 0;
let dimCounter = 0;

export function ModelingQuestionView({ question }: ModelingQuestionViewProps) {
  const {
    tables,
    validationResult,
    isSubmitted,
    addTable,
    addFieldToTable,
    batchAddFieldsToTable,
    removeFieldFromTable,
    removeTable,
    renameTable,
    setValidationResult,
    reset,
  } = useModelingStore();

  const user = useAuthStore((s) => s.user);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);

  const [activeField, setActiveField] = useState<ModelingField | null>(null);
  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<string>>(new Set());
  const [isQuestionExpanded, setIsQuestionExpanded] = useState(true);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QuestionTab>('description');
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { hasSubmitted: hasSubmittedForGate } = useSubmissionGate(question.id);
  const hints = question.hints || [];

  const tableColumnsContainerRef = useRef<HTMLDivElement>(null);
  const fieldRowRefs = useRef<Map<string, HTMLElement>>(new Map());

  const isMobile = useIsMobile();

  // Require 5px movement before activating drag, so clicks work normally
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    reset();
    factCounter = 0;
    dimCounter = 0;
    setSelectedFieldIds(new Set());
    setEditingTableId(null);
    setIsQuestionExpanded(true);
    setActiveTab('description');
  }, [question.id, reset]);

  // Auto-collapse question card after first table is created
  useEffect(() => {
    if (tables.length === 1 && isQuestionExpanded) {
      setIsQuestionExpanded(false);
    }
  }, [tables.length]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <>
            <p className="mt-2 text-sm text-text-secondary">{question.prompt}</p>
          </>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmittedForGate} />;
    }
  };

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

    const targetTable = tables.find((t) => t.id === targetId);
    if (targetTable) {
      addFieldToTable(targetId, fieldId);
    }
  };

  const handleFieldClick = useCallback((fieldId: string, shiftKey: boolean) => {
    setSelectedFieldIds((prev) => {
      const next = new Set(prev);
      if (shiftKey) {
        if (next.has(fieldId)) {
          next.delete(fieldId);
        } else {
          next.add(fieldId);
        }
      } else {
        if (next.has(fieldId) && next.size === 1) {
          next.clear();
        } else {
          return new Set([fieldId]);
        }
      }
      return next;
    });
  }, []);

  const handleColumnClick = useCallback((tableId: string) => {
    if (selectedFieldIds.size > 0) {
      batchAddFieldsToTable(tableId, [...selectedFieldIds]);
      setSelectedFieldIds(new Set());
    }
  }, [selectedFieldIds, batchAddFieldsToTable]);

  const handleCreateTable = useCallback((type: TableType) => {
    if (type === 'fact') {
      factCounter++;
      addTable(type, `fact_${factCounter}`);
    } else {
      dimCounter++;
      addTable(type, `dim_${dimCounter}`);
    }
    // Auto-enter edit mode on the newly created table
    const newTables = useModelingStore.getState().tables;
    const newTable = newTables[newTables.length - 1];
    if (newTable) {
      setEditingTableId(newTable.id);
    }
  }, [addTable]);

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
    factCounter = 0;
    dimCounter = 0;
    setSelectedFieldIds(new Set());
    setEditingTableId(null);
    setIsQuestionExpanded(true);
  };

  // Count how many times each field is used
  const fieldUsageCounts = new Map<string, number>();
  tables.forEach((t) => {
    t.fieldIds.forEach((fieldId) => {
      fieldUsageCounts.set(fieldId, (fieldUsageCounts.get(fieldId) || 0) + 1);
    });
  });
  const hasTablesWithFields = tables.some((t) => t.fieldIds.length > 0);

  // Calculate live scores
  const liveResult = hasTablesWithFields
    ? validateModelingQuestion(question, tables)
    : null;

  // Clear selection when clicking empty space
  const handleBackgroundClick = () => {
    if (selectedFieldIds.size > 0) {
      setSelectedFieldIds(new Set());
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="flex-1 p-4 h-full overflow-hidden flex flex-col gap-3"
        onClick={handleBackgroundClick}
      >
        <Breadcrumb
          items={[
            { label: 'Modeling', href: '/modeling' },
            { label: question.title },
          ]}
        />

        {/* Compact Question Card */}
        <div
          className="bg-surface rounded-lg shadow-md flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsQuestionExpanded(!isQuestionExpanded)}
              className="flex items-center gap-3 min-w-0 flex-1 text-left"
            >
              <h1 className="text-lg font-bold text-text-primary truncate">{question.title}</h1>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded flex-shrink-0 ${
                  question.difficulty === 'Easy'
                    ? 'bg-success/20 text-success'
                    : question.difficulty === 'Medium'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-error/20 text-error'
                }`}
              >
                {question.difficulty}
              </span>
              <span className="text-xs text-warning truncate flex-shrink-0">
                {question.constraint}
              </span>
              {isQuestionExpanded ? (
                <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
              )}
            </button>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
              <TimerWidget />
              <BugReportPopover questionId={question.id} />
            </div>
          </div>
          {isQuestionExpanded && (
            <>
              <QuestionTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                hasHints={hints.length > 0}
                isAuthenticated={isAuthenticated}
                hasSubmitted={hasSubmittedForGate}
                showSolutions={false}
              />
              <div className="px-4 pb-3">
                {renderTabContent()}
              </div>
            </>
          )}
        </div>

        {/* Live Score Bars */}
        {!isSubmitted && (
          <div
            className="bg-surface rounded-lg shadow-md p-3 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ScoreBars
              storageScore={liveResult?.storageScore || 0}
              queryCostScore={liveResult?.queryCostScore || 0}
              storageThresholds={question.scoreThresholds.storage}
              queryCostThresholds={question.scoreThresholds.queryCost}
            />
          </div>
        )}

        {/* Table Columns Area (main workspace) */}
        <div
          className="flex-1 min-h-0 relative"
          ref={tableColumnsContainerRef}
          onClick={(e) => e.stopPropagation()}
        >
          {isSubmitted && validationResult ? (
            <div className="h-full overflow-auto bg-surface rounded-lg shadow-md p-4">
              <ModelingFeedback
                result={validationResult}
                thresholds={question.scoreThresholds}
              />
            </div>
          ) : (
            <>
              <div className="h-full overflow-auto">
                <TableColumns
                  tables={tables}
                  fields={question.fields}
                  hasSelectedFields={selectedFieldIds.size > 0}
                  editingTableId={editingTableId}
                  onColumnClick={handleColumnClick}
                  onCreateTable={handleCreateTable}
                  onRemoveField={removeFieldFromTable}
                  onRemoveTable={removeTable}
                  onRenameTable={renameTable}
                  onAutoEditHandled={() => setEditingTableId(null)}
                  disabled={isSubmitted}
                  fieldRowRefs={fieldRowRefs}
                />
              </div>
              {!isMobile && tables.length >= 2 && (
                <RelationshipLines
                  tables={tables}
                  containerRef={tableColumnsContainerRef}
                  fieldRowRefs={fieldRowRefs}
                />
              )}
            </>
          )}
        </div>

        {/* Field Dock (pinned bottom) */}
        {!isSubmitted && (
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <FieldDock
              fields={question.fields}
              usageCounts={fieldUsageCounts}
              selectedFieldIds={selectedFieldIds}
              onFieldClick={handleFieldClick}
              disabled={isSubmitted}
            />
          </div>
        )}

        {/* Submit / Try Again */}
        <div
          className="flex justify-end flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
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
