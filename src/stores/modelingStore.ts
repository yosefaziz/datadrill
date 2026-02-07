import { create } from 'zustand';
import { ModelingValidationResult, TableType, UserTable } from '@/types';

interface ModelingState {
  tables: UserTable[];
  validationResult: ModelingValidationResult | null;
  isSubmitted: boolean;

  // Actions
  addTable: (type: TableType, name: string) => void;
  removeTable: (tableId: string) => void;
  renameTable: (tableId: string, name: string) => void;
  addFieldToTable: (tableId: string, fieldId: string) => void;
  batchAddFieldsToTable: (tableId: string, fieldIds: string[]) => void;
  removeFieldFromTable: (tableId: string, fieldId: string) => void;
  setValidationResult: (result: ModelingValidationResult) => void;
  reset: () => void;
}

let tableIdCounter = 0;

export const useModelingStore = create<ModelingState>((set) => ({
  tables: [],
  validationResult: null,
  isSubmitted: false,

  addTable: (type, name) =>
    set((state) => ({
      tables: [
        ...state.tables,
        {
          id: `table-${++tableIdCounter}`,
          type,
          name,
          fieldIds: [],
        },
      ],
    })),

  removeTable: (tableId) =>
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== tableId),
    })),

  renameTable: (tableId, name) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, name } : t
      ),
    })),

  addFieldToTable: (tableId, fieldId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId && !t.fieldIds.includes(fieldId)
          ? { ...t, fieldIds: [...t.fieldIds, fieldId] }
          : t
      ),
    })),

  batchAddFieldsToTable: (tableId, fieldIds) =>
    set((state) => ({
      tables: state.tables.map((t) => {
        if (t.id !== tableId) return t;
        const newIds = fieldIds.filter((fid) => !t.fieldIds.includes(fid));
        return newIds.length > 0
          ? { ...t, fieldIds: [...t.fieldIds, ...newIds] }
          : t;
      }),
    })),

  removeFieldFromTable: (tableId, fieldId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, fieldIds: t.fieldIds.filter((id) => id !== fieldId) }
          : t
      ),
    })),

  setValidationResult: (result) =>
    set({ validationResult: result, isSubmitted: true }),

  reset: () => {
    tableIdCounter = 0;
    return set({
      tables: [],
      validationResult: null,
      isSubmitted: false,
    });
  },
}));
