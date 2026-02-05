import Editor from '@monaco-editor/react';
import { useEditorStore } from '@/stores/editorStore';

interface CodeEditorProps {
  language: 'sql' | 'python';
  onRun: () => void;
  onSubmit: () => void;
  isExecuting: boolean;
  isValidating: boolean;
}

export function CodeEditor({ language, onRun, onSubmit, isExecuting, isValidating }: CodeEditorProps) {
  const { code, setCode } = useEditorStore();

  const runLabel = language === 'python' ? 'Run Code' : 'Run Query';
  const runningLabel = language === 'python' ? 'Running...' : 'Running...';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 border border-border rounded-t-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
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
          className="px-4 py-2 bg-primary text-text-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExecuting ? runningLabel : runLabel}
        </button>
        <button
          onClick={onSubmit}
          disabled={isExecuting || isValidating || !code.trim()}
          className="px-4 py-2 bg-success text-text-primary rounded-md hover:bg-success disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? 'Validating...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
