import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CanvasQuestion } from '@/types';
import { useCanvasStore } from '@/stores/canvasStore';
import { useAuthStore } from '@/stores/authStore';
import { useSubmissionStore } from '@/stores/submissionStore';
import { validateCanvasQuestion } from '@/services/validation/CanvasValidator';
import { getComponentById, ToolboxComponent } from '@/data/toolbox';
import { Toolbox } from './Toolbox';
import { PipelineBuilder } from './PipelineBuilder';
import { CanvasFeedback } from './CanvasFeedback';
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

interface CanvasQuestionViewProps {
  question: CanvasQuestion;
}

export function CanvasQuestionView({ question }: CanvasQuestionViewProps) {
  const {
    selections,
    validationResult,
    isSubmitted,
    selectComponent,
    clearSelection,
    setValidationResult,
    reset,
  } = useCanvasStore();

  const user = useAuthStore((s) => s.user);
  const submitAnswer = useSubmissionStore((s) => s.submitAnswer);

  const isMobile = useIsMobile();
  const [activeComponent, setActiveComponent] = useState<ToolboxComponent | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QuestionTab>('description');
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { hasSubmitted: hasSubmittedForGate } = useSubmissionGate(question.id);
  const hints = question.hints || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Reset state when question changes
  useEffect(() => {
    reset();
    setSelectedComponentId(null);
    setActiveTab('description');
  }, [question.id, reset]);

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
          <div className="prose prose-slate max-w-none prose-invert">
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Requirements</h3>
            <p className="text-text-primary whitespace-pre-wrap">{question.prompt}</p>

            {question.guidance && (
              <>
                <h3 className="text-lg font-semibold mt-6 mb-3 text-text-primary">Guidance</h3>
                <div
                  className="text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: question.guidance }}
                />
              </>
            )}
          </div>
        );
      case 'hints':
        return <HintsPanel hints={hints} />;
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmittedForGate} />;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const componentId = event.active.id as string;
    const component = getComponentById(componentId);
    setActiveComponent(component || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveComponent(null);

    const { active, over } = event;
    if (!over) return;

    const componentId = active.id as string;
    const stepId = over.id as string;

    // Verify the step exists
    const step = question.steps.find((s) => s.id === stepId);
    if (!step) return;

    selectComponent(stepId, componentId);
    setSelectedComponentId(null);
  };

  const handleComponentClick = (id: string) => {
    setSelectedComponentId((prev) => (prev === id ? null : id));
  };

  const handleStepClick = (stepId: string) => {
    if (selectedComponentId) {
      selectComponent(stepId, selectedComponentId);
      setSelectedComponentId(null);
    }
  };

  const handleBackgroundClick = () => {
    setSelectedComponentId(null);
  };

  const handleSubmit = async () => {
    const result = validateCanvasQuestion(question, selections);
    setValidationResult(result);

    try {
      await submitAnswer(
        {
          question_id: question.id,
          skill: 'architecture',
          difficulty: question.difficulty,
          answer: JSON.stringify(selections),
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

  const allStepsSelected = question.steps.every((step) => selections[step.id]);
  const selectedCount = Object.keys(selections).length;
  const usedComponentIds = Object.values(selections);


  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 p-4 h-full overflow-hidden flex flex-col" onClick={handleBackgroundClick}>
        <Breadcrumb
          items={[
            { label: 'Architecture', href: '/architecture' },
            { label: question.title },
          ]}
        />
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-auto lg:overflow-hidden">
          {/* Left Panel - Question Description */}
          <div className="w-full lg:w-2/5 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent/20 text-accent">
                    Canvas
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <TimerWidget />
                  <BugReportPopover questionId={question.id} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-text-primary">{question.title}</h1>
              <div className="flex items-center gap-3 mt-2">
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

          {/* Right Panel - Pipeline Builder (vertical split) */}
          <div className="w-full lg:w-3/5 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-shrink-0 lg:flex-shrink">
            {/* Header */}
            <div className="px-6 py-3 border-b border-border bg-bg-secondary flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  {isSubmitted
                    ? 'Review your results'
                    : `Build your pipeline (${selectedCount}/${question.steps.length})`}
                </div>
                {!isSubmitted && (
                  <button
                    onClick={handleSubmit}
                    disabled={!allStepsSelected}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      allStepsSelected
                        ? 'bg-primary text-white hover:bg-primary-hover'
                        : 'bg-border text-text-muted cursor-not-allowed'
                    }`}
                  >
                    Submit Pipeline
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 flex flex-col ${isMobile ? 'overflow-auto' : 'overflow-hidden'}`}>
              {isSubmitted && validationResult ? (
                <CanvasFeedback result={validationResult} onReset={handleReset} />
              ) : isMobile ? (
                <>
                  <div className="p-6 border-b border-border bg-gradient-to-b from-bg-secondary to-surface" onClick={(e) => e.stopPropagation()}>
                    <PipelineBuilder
                      steps={question.steps}
                      selections={selections}
                      onRemoveSelection={clearSelection}
                      disabled={isSubmitted}
                      hasSelectedComponent={!!selectedComponentId}
                      onStepClick={handleStepClick}
                    />
                  </div>
                  <div className="p-6 bg-surface" onClick={(e) => e.stopPropagation()}>
                    <Toolbox
                      availableComponentIds={question.availableComponents}
                      usedComponentIds={usedComponentIds}
                      disabled={isSubmitted}
                      selectedComponentId={selectedComponentId}
                      onComponentClick={handleComponentClick}
                    />
                  </div>
                </>
              ) : (
                <PanelGroup direction="vertical">
                  <Panel defaultSize={40} minSize={25}>
                    <div className="h-full p-6 border-b border-border bg-gradient-to-b from-bg-secondary to-surface overflow-auto" onClick={(e) => e.stopPropagation()}>
                      <PipelineBuilder
                        steps={question.steps}
                        selections={selections}
                        onRemoveSelection={clearSelection}
                        disabled={isSubmitted}
                        hasSelectedComponent={!!selectedComponentId}
                        onStepClick={handleStepClick}
                      />
                    </div>
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-transparent hover:bg-border-focus transition-colors cursor-row-resize rounded" />

                  <Panel defaultSize={60} minSize={25}>
                    <div className="h-full p-6 bg-surface overflow-auto" onClick={(e) => e.stopPropagation()}>
                      <Toolbox
                        availableComponentIds={question.availableComponents}
                        usedComponentIds={usedComponentIds}
                        disabled={isSubmitted}
                        selectedComponentId={selectedComponentId}
                        onComponentClick={handleComponentClick}
                      />
                    </div>
                  </Panel>
                </PanelGroup>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay for smooth dragging */}
      <DragOverlay>
        {activeComponent && (
          <div className="p-2 rounded-lg border border-primary bg-primary/10 shadow-xl opacity-90">
            <div className="font-medium text-sm text-text-primary">{activeComponent.name}</div>
            <div className="text-xs text-text-muted mt-0.5">{activeComponent.description}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
