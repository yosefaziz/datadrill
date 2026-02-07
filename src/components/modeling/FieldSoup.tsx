import { useDraggable } from '@dnd-kit/core';
import { Clock } from 'lucide-react';
import { ModelingField, FieldDataType } from '@/types';

const TYPE_COLORS: Record<FieldDataType, string> = {
  integer: 'bg-info/20 border-info/50 text-info',
  string: 'bg-success/20 border-success/50 text-success',
  timestamp: 'bg-accent/20 border-accent/50 text-accent',
  decimal: 'bg-warning/20 border-warning/50 text-warning',
  boolean: 'bg-error/20 border-error/50 text-error',
};

const TYPE_ICONS: Record<FieldDataType, string | React.ReactNode> = {
  integer: '#',
  string: 'Aa',
  timestamp: 'clock', // Special marker for Clock icon
  decimal: '$',
  boolean: '✓',
};

interface DraggableFieldProps {
  field: ModelingField;
  usageCount: number;
  disabled?: boolean;
}

function DraggableField({ field, usageCount, disabled = false }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.id,
    data: { field },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative px-3 py-2 rounded-lg border-2 transition-all select-none ${TYPE_COLORS[field.dataType]} ${
        isDragging
          ? 'opacity-50 shadow-lg scale-105'
          : 'hover:shadow-md'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
      title={`${field.description}\nCardinality: ${field.cardinality}`}
    >
      {usageCount > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
          {usageCount}
        </div>
      )}
      <div className="flex items-center gap-2">
        {field.dataType === 'timestamp' ? (
          <Clock className="w-3 h-3 opacity-60" />
        ) : (
          <span className="text-xs font-mono opacity-60">{TYPE_ICONS[field.dataType]}</span>
        )}
        <span className="font-medium text-sm">{field.name}</span>
      </div>
      {field.sampleValues && field.sampleValues.length > 0 && (
        <div className="text-xs opacity-60 mt-0.5 truncate">
          e.g., {field.sampleValues.slice(0, 2).join(', ')}
        </div>
      )}
    </div>
  );
}

interface FieldSoupProps {
  fields: ModelingField[];
  usageCounts: Map<string, number>;
  disabled?: boolean;
}

export function FieldSoup({ fields, usageCounts, disabled = false }: FieldSoupProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-wrap gap-3 pt-1">
        {fields.map((field) => (
          <DraggableField
            key={field.id}
            field={field}
            usageCount={usageCounts.get(field.id) || 0}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-xs text-text-muted mb-2">Field Types</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${color}`}>
              {type === 'timestamp' ? (
                <Clock className="w-3 h-3" />
              ) : (
                <span>{TYPE_ICONS[type as FieldDataType]}</span>
              )}
              {type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
