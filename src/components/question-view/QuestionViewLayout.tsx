import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Question, QueryResult, ValidationResult } from '@/types';
import { QuestionDescription } from './QuestionDescription';
import { SqlEditor } from '@/components/editor/SqlEditor';
import { OutputPanel } from '@/components/editor/OutputPanel';

interface QuestionViewLayoutProps {
  question: Question;
  result: QueryResult | null;
  validationResult: ValidationResult | null;
  isExecuting: boolean;
  isValidating: boolean;
  onRun: () => void;
  onSubmit: () => void;
}

export function QuestionViewLayout({
  question,
  result,
  validationResult,
  isExecuting,
  isValidating,
  onRun,
  onSubmit,
}: QuestionViewLayoutProps) {
  return (
    <div className="flex-1 p-4">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={40} minSize={25}>
          <div className="h-full bg-white rounded-lg shadow-md overflow-hidden">
            <QuestionDescription question={question} />
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-slate-200 hover:bg-slate-400 transition-colors mx-1 rounded" />

        <Panel defaultSize={60} minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={30}>
              <SqlEditor
                onRun={onRun}
                onSubmit={onSubmit}
                isExecuting={isExecuting}
                isValidating={isValidating}
              />
            </Panel>

            <PanelResizeHandle className="h-2 bg-slate-200 hover:bg-slate-400 transition-colors my-1 rounded" />

            <Panel defaultSize={40} minSize={20}>
              <OutputPanel result={result} validationResult={validationResult} isLoading={isExecuting || isValidating} />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
