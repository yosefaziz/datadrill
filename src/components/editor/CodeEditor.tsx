import { useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useEditorStore } from '@/stores/editorStore';
import { useThemeStore } from '@/stores/themeStore';

interface CodeEditorProps {
  language: 'sql' | 'python';
  onRun: () => void;
  onSubmit: () => void;
  isExecuting: boolean;
  isValidating: boolean;
}

export function CodeEditor({ language, onRun, onSubmit, isExecuting, isValidating }: CodeEditorProps) {
  const { code, setCode } = useEditorStore();
  const { theme } = useThemeStore();
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  const runLabel = language === 'python' ? 'Run Code' : 'Run Query';
  const runningLabel = language === 'python' ? 'Running...' : 'Running...';
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => onRunRef.current(),
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 rounded-t-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme={editorTheme}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
      <div className="flex gap-2 p-3 bg-bg-secondary rounded-b-lg">
        <button
          onClick={onRun}
          disabled={isExecuting || isValidating || !code.trim()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {isExecuting ? runningLabel : runLabel}
        </button>
        <button
          onClick={onSubmit}
          disabled={isExecuting || isValidating || !code.trim()}
          className="px-4 py-2 bg-success text-white rounded-md hover:bg-success disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
        >
          {isValidating ? 'Validating...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
