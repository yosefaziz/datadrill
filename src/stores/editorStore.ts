import { create } from 'zustand';

interface EditorState {
  code: string;
  setCode: (code: string) => void;
  clearCode: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  code: '',
  setCode: (code) => set({ code }),
  clearCode: () => set({ code: '' }),
}));
