import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { UserTable, ModelingField, FieldDataType, TableType } from '@/types';

const TYPE_COLORS: Record<FieldDataType, string> = {
  integer: 'bg-info/20 text-info',
  string: 'bg-success/20 text-success',
  timestamp: 'bg-accent/20 text-accent',
  decimal: 'bg-warning/20 text-warning',
  boolean: 'bg-error/20 text-error',
};

interface DroppableColumnProps {
  table: UserTable;
  fields: ModelingField[];
  hasSelectedFields: boolean;
  autoEdit: boolean;
  onColumnClick: (tableId: string) => void;
  onRemoveField: (tableId: string, fieldId: string) => void;
  onRemoveTable: (tableId: string) => void;
  onRenameTable: (tableId: string, name: string) => void;
  onAutoEditHandled: () => void;
  disabled?: boolean;
  fieldRowRefs: React.MutableRefObject<Map<string, HTMLElement>>;
}

function DroppableColumn({
  table,
  fields,
  hasSelectedFields,
  autoEdit,
  onColumnClick,
  onRemoveField,
  onRemoveTable,
  onRenameTable,
  onAutoEditHandled,
  disabled = false,
  fieldRowRefs,
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: table.id,
    disabled,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(table.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const prefix = table.type === 'fact' ? 'fact_' : 'dim_';

  // Auto-enter edit mode for newly created tables
  useEffect(() => {
    if (autoEdit && !isEditing) {
      setEditName(table.name);
      setIsEditing(true);
      onAutoEditHandled();
    }
  }, [autoEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at end (after the prefix)
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const tableFields = table.fieldIds
    .map((fid) => fields.find((f) => f.id === fid))
    .filter(Boolean) as ModelingField[];

  const isFact = table.type === 'fact';

  const commitRename = () => {
    let trimmed = editName.trim();
    // If user left just the prefix or empty, generate a numbered default
    if (!trimmed || trimmed === prefix) {
      trimmed = table.name;
    }
    // Ensure prefix is preserved
    if (!trimmed.startsWith(prefix)) {
      trimmed = prefix + trimmed;
    }
    if (trimmed !== table.name) {
      onRenameTable(table.id, trimmed);
    }
    setEditName(trimmed);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={() => {
        if (hasSelectedFields && !disabled) {
          onColumnClick(table.id);
        }
      }}
      className={`flex flex-col rounded-xl transition-all min-w-[200px] flex-1 shadow-lg overflow-hidden ${
        isOver
          ? 'border-2 border-primary bg-primary/10 scale-[1.01]'
          : hasSelectedFields && !disabled
            ? 'border border-primary/30 hover:border-2 hover:border-primary hover:bg-primary/5 cursor-pointer'
            : isFact
              ? 'bg-gradient-to-b from-warning/10 to-transparent border border-warning/30'
              : 'bg-gradient-to-b from-info/10 to-transparent border border-info/30'
      }`}
    >
      {/* Header */}
      <div
        className={`px-3 py-2.5 flex items-center justify-between ${
          isFact ? 'bg-warning/20' : 'bg-info/20'
        }`}
      >
        <div
          className={`flex items-center gap-2 min-w-0 flex-1 ${!disabled && !isEditing ? 'cursor-text' : ''}`}
          onClick={(e) => {
            if (!disabled && !isEditing) {
              e.stopPropagation();
              setIsEditing(true);
            }
          }}
          title={!disabled && !isEditing ? 'Click to rename' : undefined}
        >
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
              isFact ? 'bg-warning/30 text-warning' : 'bg-info/30 text-info'
            }`}
          >
            {isFact ? 'FACT' : 'DIM'}
          </span>
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => {
                const val = e.target.value;
                // Don't let user delete the prefix
                if (val.length >= prefix.length || val === prefix.slice(0, val.length)) {
                  setEditName(val.length < prefix.length ? prefix : val);
                }
              }}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') {
                  setEditName(table.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder={`${prefix}orders`}
              className="font-semibold text-text-primary bg-bg-primary px-1.5 py-0.5 rounded text-sm ring-1 ring-primary min-w-0 flex-1"
            />
          ) : (
            <span className="font-semibold text-text-primary text-sm truncate px-1.5 py-0.5">
              {table.name}
            </span>
          )}
        </div>
        {!disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTable(table.id);
            }}
            className="p-1.5 hover:bg-error/20 rounded text-text-muted hover:text-error transition-colors flex-shrink-0"
            title="Remove table"
            aria-label={`Remove table ${table.name}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 p-2 min-h-[80px]">
        {tableFields.length === 0 ? (
          <div
            className={`p-3 rounded-lg text-center text-sm transition-colors ${
              isOver
                ? 'bg-primary/20 text-primary ring-1 ring-primary/50'
                : hasSelectedFields
                  ? 'bg-primary/5 text-primary/60'
                  : 'bg-white/5 text-text-muted'
            }`}
          >
            {isOver ? 'Drop here!' : hasSelectedFields ? 'Click to add' : 'Drag or click fields'}
          </div>
        ) : (
          <div className="space-y-1">
            {tableFields.map((field) => (
              <div
                key={field.id}
                ref={(el) => {
                  if (el) {
                    fieldRowRefs.current.set(`${table.id}:${field.id}`, el);
                  } else {
                    fieldRowRefs.current.delete(`${table.id}:${field.id}`);
                  }
                }}
                className={`px-2 py-1.5 rounded flex items-center justify-between group ${TYPE_COLORS[field.dataType]}`}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{field.name}</span>
                  <span className="text-xs opacity-60">{field.dataType}</span>
                </div>
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveField(table.id, field.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 hover:bg-error/20 rounded text-text-muted hover:text-error transition-all"
                    title="Remove field"
                    aria-label={`Remove field ${field.name} from ${table.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-black/10 text-xs text-text-muted">
        {tableFields.length} field{tableFields.length !== 1 ? 's' : ''}
        {isFact && tableFields.length > 0 && (
          <span className="ml-2 text-warning">(high storage cost)</span>
        )}
      </div>
    </div>
  );
}

interface InlineTableCreatorProps {
  onCreateTable: (type: TableType) => void;
}

function InlineTableCreator({ onCreateTable }: InlineTableCreatorProps) {
  return (
    <div className="flex flex-col gap-3 min-w-[160px] flex-shrink-0">
      <button
        onClick={() => onCreateTable('fact')}
        className="flex-1 p-4 rounded-xl border border-warning/30 hover:border-warning/60 bg-gradient-to-b from-warning/10 to-transparent hover:from-warning/20 shadow-lg transition-all group"
      >
        <div className="text-center">
          <span className="text-2xl text-warning group-hover:scale-110 transition-transform inline-block">+</span>
          <div className="text-sm font-semibold text-warning mt-1">Fact Table</div>
          <div className="text-xs text-text-muted mt-0.5">Billions of rows</div>
        </div>
      </button>
      <button
        onClick={() => onCreateTable('dimension')}
        className="flex-1 p-4 rounded-xl border border-info/30 hover:border-info/60 bg-gradient-to-b from-info/10 to-transparent hover:from-info/20 shadow-lg transition-all group"
      >
        <div className="text-center">
          <span className="text-2xl text-info group-hover:scale-110 transition-transform inline-block">+</span>
          <div className="text-sm font-semibold text-info mt-1">Dimension Table</div>
          <div className="text-xs text-text-muted mt-0.5">Small lookup table</div>
        </div>
      </button>
    </div>
  );
}

interface TableColumnsProps {
  tables: UserTable[];
  fields: ModelingField[];
  hasSelectedFields: boolean;
  editingTableId: string | null;
  onColumnClick: (tableId: string) => void;
  onCreateTable: (type: TableType) => void;
  onRemoveField: (tableId: string, fieldId: string) => void;
  onRemoveTable: (tableId: string) => void;
  onRenameTable: (tableId: string, name: string) => void;
  onAutoEditHandled: () => void;
  disabled?: boolean;
  fieldRowRefs: React.MutableRefObject<Map<string, HTMLElement>>;
}

export function TableColumns({
  tables,
  fields,
  hasSelectedFields,
  editingTableId,
  onColumnClick,
  onCreateTable,
  onRemoveField,
  onRemoveTable,
  onRenameTable,
  onAutoEditHandled,
  disabled = false,
  fieldRowRefs,
}: TableColumnsProps) {
  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-2">
      {!disabled && (
        <InlineTableCreator onCreateTable={onCreateTable} />
      )}
      {tables.map((table) => (
        <DroppableColumn
          key={table.id}
          table={table}
          fields={fields}
          hasSelectedFields={hasSelectedFields}
          autoEdit={editingTableId === table.id}
          onColumnClick={onColumnClick}
          onRemoveField={onRemoveField}
          onRemoveTable={onRemoveTable}
          onRenameTable={onRenameTable}
          onAutoEditHandled={onAutoEditHandled}
          disabled={disabled}
          fieldRowRefs={fieldRowRefs}
        />
      ))}
    </div>
  );
}
