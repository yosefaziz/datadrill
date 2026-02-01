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
          ? 'border-blue-500 bg-blue-50 scale-[1.02]'
          : selectedComponent
            ? 'border-sky-400 bg-sky-50'
            : 'border-slate-300 bg-slate-50'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            selectedComponent ? 'bg-sky-500 text-white' : 'bg-slate-300 text-slate-600'
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-800">{step.name}</div>
          <div className="text-sm text-slate-500 mt-0.5">{step.description}</div>

          {selectedComponent ? (
            <div className="mt-3 p-2 bg-white rounded border border-sky-300 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-sky-700">{selectedComponent.name}</div>
                <div className="text-xs text-slate-500">{selectedComponent.description}</div>
              </div>
              {!disabled && onRemove && (
                <button
                  onClick={onRemove}
                  className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove component"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  ? 'border-blue-400 bg-blue-100 text-blue-600'
                  : 'border-slate-300 text-slate-400'
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
