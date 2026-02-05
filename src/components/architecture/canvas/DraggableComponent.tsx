import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ToolboxComponent } from '@/data/toolbox';

interface DraggableComponentProps {
  component: ToolboxComponent;
  disabled?: boolean;
}

export function DraggableComponent({ component, disabled = false }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: { component },
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-2 rounded-lg border text-left transition-all select-none ${
        isDragging
          ? 'opacity-50 border-primary bg-primary/10 shadow-lg z-50'
          : 'border-border hover:border-primary hover:bg-bg-secondary'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="font-medium text-sm text-text-primary">{component.name}</div>
      <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">{component.description}</div>
    </div>
  );
}
