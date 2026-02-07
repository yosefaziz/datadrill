import { useDraggable } from '@dnd-kit/core';
import { Check, Clock } from 'lucide-react';
import { ModelingField, FieldDataType } from '@/types';

const TYPE_COLORS: Record<FieldDataType, string> = {
  integer: 'bg-info/20 border-info/50 text-info',
  string: 'bg-success/20 border-success/50 text-success',
  timestamp: 'bg-accent/20 border-accent/50 text-accent',
  decimal: 'bg-warning/20 border-warning/50 text-warning',
  boolean: 'bg-error/20 border-error/50 text-error',
};

const TYPE_ICONS: Record<FieldDataType, string> = {
  integer: '#',
  string: 'Aa',
  timestamp: 'clock',
  decimal: '$',
  boolean: '✓',
};

interface DraggableFieldChipProps {
  field: ModelingField;
  usageCount: number;
  isSelected: boolean;
  disabled?: boolean;
  onClick: (fieldId: string, shiftKey: boolean) => void;
}

function DraggableFieldChip({
  field,
  usageCount,
  isSelected,
  disabled = false,
  onClick,
}: DraggableFieldChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.id,
    data: { field },
    disabled,
  });

  const isAssigned = usageCount > 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!disabled) {
          e.stopPropagation();
          onClick(field.id, e.shiftKey);
        }
      }}
      className={`relative px-3 py-1.5 rounded-lg border-2 transition-all select-none flex-shrink-0 ${TYPE_COLORS[field.dataType]} ${
        isDragging
          ? 'opacity-50 shadow-lg scale-105'
          : isSelected
            ? 'ring-2 ring-primary scale-105 shadow-lg'
            : 'hover:shadow-md'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      title={`${field.description}\nCardinality: ${field.cardinality}`}
    >
      {usageCount > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
          {usageCount}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        {isAssigned && (
          <Check className="w-3 h-3 opacity-60" />
        )}
        {field.dataType === 'timestamp' ? (
          <Clock className="w-3 h-3 opacity-60" />
        ) : (
          <span className="text-xs font-mono opacity-60">{TYPE_ICONS[field.dataType]}</span>
        )}
        <span className="font-medium text-sm">{field.name}</span>
      </div>
    </div>
  );
}

interface FieldDockProps {
  fields: ModelingField[];
  usageCounts: Map<string, number>;
  selectedFieldIds: Set<string>;
  onFieldClick: (fieldId: string, shiftKey: boolean) => void;
  disabled?: boolean;
}

export function FieldDock({
  fields,
  usageCounts,
  selectedFieldIds,
  onFieldClick,
  disabled = false,
}: FieldDockProps) {
  return (
    <div className="bg-surface rounded-xl shadow-lg ring-1 ring-white/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-text-primary">Fields</span>
        <span className="text-xs text-text-muted">
          {selectedFieldIds.size > 0
            ? `${selectedFieldIds.size} selected - click a table to assign`
            : 'Click to select, then click a table'}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pt-1 pb-1 scrollbar-thin">
        {fields.map((field) => (
          <DraggableFieldChip
            key={field.id}
            field={field}
            usageCount={usageCounts.get(field.id) || 0}
            isSelected={selectedFieldIds.has(field.id)}
            disabled={disabled}
            onClick={onFieldClick}
          />
        ))}
      </div>
    </div>
  );
}
