import { CanvasStep } from '@/types';
import { DroppableStep } from './DroppableStep';

interface PipelineBuilderProps {
  steps: CanvasStep[];
  selections: Record<string, string>;
  onRemoveSelection: (stepId: string) => void;
  disabled?: boolean;
}

export function PipelineBuilder({
  steps,
  selections,
  onRemoveSelection,
  disabled = false,
}: PipelineBuilderProps) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
        Pipeline Steps
      </h3>
      <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <div className="w-48 md:w-56 lg:w-64 flex-shrink-0">
              <DroppableStep
                step={step}
                index={index}
                selectedComponentId={selections[step.id] || null}
                disabled={disabled}
                onRemove={() => onRemoveSelection(step.id)}
              />
            </div>
            {/* Arrow connector */}
            {index < steps.length - 1 && (
              <svg
                className="w-8 h-8 text-text-muted flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
