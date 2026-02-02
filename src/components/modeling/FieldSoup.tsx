import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ModelingField, FieldDataType } from '@/types';

const TYPE_COLORS: Record<FieldDataType, string> = {
  integer: 'bg-blue-100 border-blue-300 text-blue-800',
  string: 'bg-green-100 border-green-300 text-green-800',
  timestamp: 'bg-purple-100 border-purple-300 text-purple-800',
  decimal: 'bg-amber-100 border-amber-300 text-amber-800',
  boolean: 'bg-pink-100 border-pink-300 text-pink-800',
};

const TYPE_ICONS: Record<FieldDataType, string> = {
  integer: '#',
  string: 'Aa',
  timestamp: '🕐',
  decimal: '$',
  boolean: '✓',
};

interface DraggableFieldProps {
  field: ModelingField;
  disabled?: boolean;
}

function DraggableField({ field, disabled = false }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.id,
    data: { field },
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
      className={`px-3 py-2 rounded-lg border-2 transition-all select-none ${TYPE_COLORS[field.dataType]} ${
        isDragging
          ? 'opacity-50 shadow-lg scale-105'
          : 'hover:shadow-md'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
      title={`${field.description}\nCardinality: ${field.cardinality}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono opacity-60">{TYPE_ICONS[field.dataType]}</span>
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
  disabled?: boolean;
}

export function FieldSoup({ fields, disabled = false }: FieldSoupProps) {
  if (fields.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        All fields assigned!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <DraggableField key={field.id} field={field} disabled={disabled} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="text-xs text-slate-500 mb-2">Field Types</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className={`px-2 py-0.5 rounded text-xs ${color}`}>
              {TYPE_ICONS[type as FieldDataType]} {type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
