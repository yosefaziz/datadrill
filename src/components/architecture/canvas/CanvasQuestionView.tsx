import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { CanvasQuestion } from '@/types';
import { useCanvasStore } from '@/stores/canvasStore';
import { validateCanvasQuestion } from '@/services/validation/CanvasValidator';
import { getComponentById, ToolboxComponent } from '@/data/toolbox';
import { Toolbox } from './Toolbox';
import { PipelineBuilder } from './PipelineBuilder';
import { CanvasFeedback } from './CanvasFeedback';

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

  const [activeComponent, setActiveComponent] = useState<ToolboxComponent | null>(null);

  // Reset state when question changes
  useEffect(() => {
    reset();
  }, [question.id, reset]);

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
  };

  const handleSubmit = () => {
    const result = validateCanvasQuestion(question, selections);
    setValidationResult(result);
  };

  const handleReset = () => {
    reset();
  };

  const allStepsSelected = question.steps.every((step) => selections[step.id]);
  const selectedCount = Object.keys(selections).length;
  const usedComponentIds = Object.values(selections);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 p-4 h-full overflow-hidden">
        <div className="h-full min-h-0 flex gap-4">
          {/* Left Panel - Question Description */}
          <div className="w-2/5 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border">
              <Link
                to="/architecture"
                className="text-primary hover:text-primary-hover text-sm mb-3 inline-block transition-colors duration-200"
              >
                &larr; All Questions
              </Link>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent/20 text-accent">
                  Canvas
                </span>
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

            <div className="flex-1 overflow-y-auto p-6">
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
            </div>
          </div>

          {/* Right Panel - Pipeline Builder (vertical split) */}
          <div className="w-3/5 bg-surface rounded-lg shadow-md overflow-hidden flex flex-col">
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
            <div className="flex-1 flex flex-col overflow-hidden">
              {isSubmitted && validationResult ? (
                <CanvasFeedback result={validationResult} onReset={handleReset} />
              ) : (
                <>
                  {/* Top: Pipeline Steps (Drop Zones) */}
                  <div className="flex-[3] p-6 border-b border-border bg-gradient-to-b from-bg-secondary to-surface overflow-auto">
                    <PipelineBuilder
                      steps={question.steps}
                      selections={selections}
                      onRemoveSelection={clearSelection}
                      disabled={isSubmitted}
                    />
                  </div>

                  {/* Bottom: Component Library (Draggables) */}
                  <div className="flex-[2] p-6 bg-surface overflow-auto">
                    <Toolbox
                      availableComponentIds={question.availableComponents}
                      usedComponentIds={usedComponentIds}
                      disabled={isSubmitted}
                    />
                  </div>
                </>
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
