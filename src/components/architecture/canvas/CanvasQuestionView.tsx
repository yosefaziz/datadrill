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
      <div className="flex-1 p-4 h-full">
        <div className="h-full min-h-0 flex gap-4">
          {/* Left Panel - Question Description */}
          <div className="w-2/5 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <Link
                to="/architecture"
                className="text-blue-600 hover:text-blue-800 text-sm mb-3 inline-block"
              >
                &larr; All Questions
              </Link>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  Canvas
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">{question.title}</h1>
              <div className="flex items-center gap-3 mt-2">
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
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{question.prompt}</p>

                {question.guidance && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-3">Guidance</h3>
                    <div
                      className="text-slate-600"
                      dangerouslySetInnerHTML={{ __html: question.guidance }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Pipeline Builder (vertical split) */}
          <div className="w-3/5 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
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
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
                  <div className="flex-[3] p-6 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white overflow-auto">
                    <PipelineBuilder
                      steps={question.steps}
                      selections={selections}
                      onRemoveSelection={clearSelection}
                      disabled={isSubmitted}
                    />
                  </div>

                  {/* Bottom: Component Library (Draggables) */}
                  <div className="flex-[2] p-6 bg-white overflow-auto">
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
          <div className="p-2 rounded-lg border border-blue-400 bg-blue-50 shadow-xl opacity-90">
            <div className="font-medium text-sm text-slate-800">{activeComponent.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{activeComponent.description}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
