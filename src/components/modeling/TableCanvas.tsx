import { useDroppable } from '@dnd-kit/core';
import { UserTable, ModelingField, FieldDataType } from '@/types';

const TYPE_COLORS: Record<FieldDataType, string> = {
  integer: 'bg-blue-50 text-blue-700',
  string: 'bg-green-50 text-green-700',
  timestamp: 'bg-purple-50 text-purple-700',
  decimal: 'bg-amber-50 text-amber-700',
  boolean: 'bg-pink-50 text-pink-700',
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
      className={`rounded-lg border-2 transition-all min-w-[220px] ${
        isOver
          ? 'border-blue-500 bg-blue-50 scale-[1.02]'
          : isFact
            ? 'border-orange-300 bg-orange-50'
            : 'border-sky-300 bg-sky-50'
      }`}
    >
      {/* Table Header */}
      <div
        className={`px-3 py-2 border-b-2 flex items-center justify-between ${
          isFact ? 'border-orange-300 bg-orange-100' : 'border-sky-300 bg-sky-100'
        }`}
      >
        <div>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              isFact ? 'bg-orange-200 text-orange-800' : 'bg-sky-200 text-sky-800'
            }`}
          >
            {isFact ? 'FACT' : 'DIM'}
          </span>
          <span className="ml-2 font-semibold text-slate-800">{table.name}</span>
        </div>
        {!disabled && (
          <button
            onClick={() => onRemoveTable(table.id)}
            className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500 transition-colors"
            title="Remove table"
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

      {/* Fields */}
      <div className="p-2 min-h-[80px]">
        {tableFields.length === 0 ? (
          <div
            className={`p-3 border-2 border-dashed rounded text-center text-sm ${
              isOver
                ? 'border-blue-400 bg-blue-100 text-blue-600'
                : 'border-slate-300 text-slate-400'
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
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded text-slate-400 hover:text-red-500 transition-all"
                    title="Remove field"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
      <div className="px-3 py-1.5 border-t border-slate-200 text-xs text-slate-500">
        {tableFields.length} field{tableFields.length !== 1 ? 's' : ''}
        {isFact && tableFields.length > 0 && (
          <span className="ml-2 text-orange-600">
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
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-3">📊</div>
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
