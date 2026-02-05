import { useDroppable } from '@dnd-kit/core';
import { BarChart3 } from 'lucide-react';
import { UserTable, ModelingField, FieldDataType } from '@/types';

const TYPE_COLORS: Record<FieldDataType, string> = {
  integer: 'bg-info/20 text-info',
  string: 'bg-success/20 text-success',
  timestamp: 'bg-accent/20 text-accent',
  decimal: 'bg-warning/20 text-warning',
  boolean: 'bg-error/20 text-error',
};

interface DroppableTableProps {
  table: UserTable;
  fields: ModelingField[];
  onRemoveField: (tableId: string, fieldId: string) => void;
  onRemoveTable: (tableId: string) => void;
  disabled?: boolean;
}

function DroppableTable({
  table,
  fields,
  onRemoveField,
  onRemoveTable,
  disabled = false,
}: DroppableTableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: table.id,
    disabled,
  });

  const tableFields = table.fieldIds
    .map((fid) => fields.find((f) => f.id === fid))
    .filter(Boolean) as ModelingField[];

  const isFact = table.type === 'fact';

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl transition-all min-w-[220px] shadow-lg overflow-hidden ${
        isOver
          ? 'ring-2 ring-primary bg-primary/10 scale-[1.02]'
          : isFact
            ? 'bg-gradient-to-b from-warning/15 to-warning/5 ring-1 ring-warning/20'
            : 'bg-gradient-to-b from-info/15 to-info/5 ring-1 ring-info/20'
      }`}
    >
      {/* Table Header */}
      <div
        className={`px-3 py-2.5 flex items-center justify-between ${
          isFact ? 'bg-warning/20' : 'bg-info/20'
        }`}
      >
        <div>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              isFact ? 'bg-warning/30 text-warning' : 'bg-info/30 text-info'
            }`}
          >
            {isFact ? 'FACT' : 'DIM'}
          </span>
          <span className="ml-2 font-semibold text-text-primary">{table.name}</span>
        </div>
        {!disabled && (
          <button
            onClick={() => onRemoveTable(table.id)}
            className="p-2 hover:bg-error/20 rounded text-text-muted hover:text-error transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            title="Remove table"
            aria-label={`Remove table ${table.name}`}
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

      {/* Fields */}
      <div className="p-2 min-h-[80px]">
        {tableFields.length === 0 ? (
          <div
            className={`p-3 rounded-lg text-center text-sm transition-colors ${
              isOver
                ? 'bg-primary/20 text-primary ring-1 ring-primary/50'
                : 'bg-white/5 text-text-muted'
            }`}
          >
            {isOver ? 'Drop here!' : 'Drag fields here'}
          </div>
        ) : (
          <div className="space-y-1">
            {tableFields.map((field) => (
              <div
                key={field.id}
                className={`px-2 py-1.5 rounded flex items-center justify-between group ${TYPE_COLORS[field.dataType]}`}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{field.name}</span>
                  <span className="text-xs opacity-60">{field.dataType}</span>
                </div>
                {!disabled && (
                  <button
                    onClick={() => onRemoveField(table.id, field.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 hover:bg-error/20 rounded text-text-muted hover:text-error transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    title="Remove field"
                    aria-label={`Remove field ${field.name} from ${table.name}`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
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
            ))}
          </div>
        )}
      </div>

      {/* Footer with field count */}
      <div className="px-3 py-1.5 bg-black/10 text-xs text-text-muted">
        {tableFields.length} field{tableFields.length !== 1 ? 's' : ''}
        {isFact && tableFields.length > 0 && (
          <span className="ml-2 text-warning">
            (high storage cost)
          </span>
        )}
      </div>
    </div>
  );
}

interface TableCanvasProps {
  tables: UserTable[];
  fields: ModelingField[];
  onRemoveField: (tableId: string, fieldId: string) => void;
  onRemoveTable: (tableId: string) => void;
  disabled?: boolean;
}

export function TableCanvas({
  tables,
  fields,
  onRemoveField,
  onRemoveTable,
  disabled = false,
}: TableCanvasProps) {
  if (tables.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-text-muted">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-text-muted" />
          <div className="text-lg font-medium">No tables yet</div>
          <div className="text-sm">Click "Add Table" to start building your schema</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {tables.map((table) => (
        <DroppableTable
          key={table.id}
          table={table}
          fields={fields}
          onRemoveField={onRemoveField}
          onRemoveTable={onRemoveTable}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
