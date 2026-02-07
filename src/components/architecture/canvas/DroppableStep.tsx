import { useDroppable } from '@dnd-kit/core';
import { CanvasStep } from '@/types';
import { getComponentById } from '@/data/toolbox';

interface DroppableStepProps {
  step: CanvasStep;
  index: number;
  selectedComponentId: string | null;
  disabled?: boolean;
  onRemove?: () => void;
  hasSelectedComponent?: boolean;
  onClickAssign?: () => void;
}

export function DroppableStep({
  step,
  index,
  selectedComponentId,
  disabled = false,
  onRemove,
  hasSelectedComponent = false,
  onClickAssign,
}: DroppableStepProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: step.id,
    disabled,
  });

  const selectedComponent = selectedComponentId ? getComponentById(selectedComponentId) : null;

  const handleClick = () => {
    if (hasSelectedComponent && !disabled && !selectedComponent && onClickAssign) {
      onClickAssign();
    }
  };

  const canClickAssign = hasSelectedComponent && !disabled && !selectedComponent;

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={`p-4 rounded-xl transition-all min-h-[100px] shadow-md ${
        isOver
          ? 'ring-2 ring-primary bg-primary/10 scale-[1.02]'
          : canClickAssign
            ? 'bg-primary/5 ring-1 ring-primary/30 cursor-pointer'
            : selectedComponent
              ? 'bg-info/10 ring-1 ring-info/30'
              : 'bg-bg-secondary ring-1 ring-white/5'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            selectedComponent ? 'bg-info text-white' : 'bg-white/10 text-text-secondary'
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-text-primary">{step.name}</div>
          <div className="text-sm text-text-secondary mt-0.5">{step.description}</div>

          {selectedComponent ? (
            <div className="mt-3 p-2 bg-surface rounded-lg ring-1 ring-info/30 flex items-center justify-between">
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
              className={`mt-3 p-3 rounded-lg text-center text-sm transition-colors ${
                isOver
                  ? 'bg-primary/20 text-primary ring-1 ring-primary/50'
                  : 'bg-white/5 text-text-muted'
              }`}
            >
              {isOver ? 'Drop here!' : canClickAssign ? 'Click to assign' : 'Click or drag a component'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
