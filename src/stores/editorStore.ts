import { create } from 'zustand';

interface EditorState {
  sql: string;
  setSql: (sql: string) => void;
  clearSql: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  sql: '',
  setSql: (sql) => set({ sql }),
  clearSql: () => set({ sql: '' }),
}));
