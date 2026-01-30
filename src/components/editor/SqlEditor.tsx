import Editor from '@monaco-editor/react';
import { useEditorStore } from '@/stores/editorStore';

interface SqlEditorProps {
  onRun: () => void;
  onSubmit: () => void;
  isExecuting: boolean;
  isValidating: boolean;
}

export function SqlEditor({ onRun, onSubmit, isExecuting, isValidating }: SqlEditorProps) {
  const { sql, setSql } = useEditorStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 border border-slate-300 rounded-t-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={sql}
          onChange={(value) => setSql(value || '')}
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
      <div className="flex gap-2 p-3 bg-slate-200 rounded-b-lg">
        <button
          onClick={onRun}
          disabled={isExecuting || isValidating || !sql.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExecuting ? 'Running...' : 'Run Query'}
        </button>
        <button
          onClick={onSubmit}
          disabled={isExecuting || isValidating || !sql.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? 'Validating...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
