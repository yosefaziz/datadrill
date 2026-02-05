import { useDroppable } from '@dnd-kit/core';
import { CanvasStep } from '@/types';
import { getComponentById } from '@/data/toolbox';

interface DroppableStepProps {
  step: CanvasStep;
  index: number;
  selectedComponentId: string | null;
  disabled?: boolean;
  onRemove?: () => void;
}

export function DroppableStep({
  step,
  index,
  selectedComponentId,
  disabled = false,
  onRemove,
}: DroppableStepProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: step.id,
    disabled,
  });

  const selectedComponent = selectedComponentId ? getComponentById(selectedComponentId) : null;

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg border-2 border-dashed transition-all min-h-[100px] ${
        isOver
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : selectedComponent
            ? 'border-info bg-info/10'
            : 'border-border bg-bg-secondary'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            selectedComponent ? 'bg-info text-white' : 'bg-border text-text-secondary'
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-text-primary">{step.name}</div>
          <div className="text-sm text-text-secondary mt-0.5">{step.description}</div>

          {selectedComponent ? (
            <div className="mt-3 p-2 bg-surface rounded border border-info/50 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-info">{selectedComponent.name}</div>
                <div className="text-xs text-text-secondary">{selectedComponent.description}</div>
              </div>
              {!disabled && onRemove && (
                <button
                  onClick={onRemove}
                  className="p-2 hover:bg-error/20 rounded text-text-muted hover:text-error transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  title="Remove component"
                  aria-label={`Remove ${selectedComponent?.name || 'component'} from ${step.name}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div
              className={`mt-3 p-3 rounded border-2 border-dashed text-center text-sm ${
                isOver
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border text-text-muted'
              }`}
            >
              {isOver ? 'Drop here!' : 'Drag a component here'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
