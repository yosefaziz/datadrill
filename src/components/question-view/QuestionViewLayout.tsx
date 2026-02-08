import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Question, QueryResult, ValidationResult, getEditorLanguage } from '@/types';
import { QuestionDescription } from './QuestionDescription';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { OutputPanel } from '@/components/editor/OutputPanel';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

const skillNames: Record<string, string> = {
  sql: 'SQL',
  python: 'Python',
  debug: 'Debug',
  architecture: 'Architecture',
  modeling: 'Modeling',
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

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
  const language = getEditorLanguage(question);
  const isMobile = useIsMobile();

  return (
    <div className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      <Breadcrumb
        items={[
          { label: skillNames[question.skill] || question.skill, href: `/${question.skill}` },
          { label: question.title },
        ]}
      />
      <PanelGroup direction={isMobile ? 'vertical' : 'horizontal'} className="flex-1 min-h-0">
        <Panel defaultSize={isMobile ? 30 : 40} minSize={20}>
          <div className="h-full bg-surface rounded-lg shadow-md overflow-hidden">
            <QuestionDescription question={question} />
          </div>
        </Panel>

        <PanelResizeHandle
          className={
            isMobile
              ? 'h-2 bg-border hover:bg-border-focus transition-colors my-1 rounded'
              : 'w-2 bg-border hover:bg-border-focus transition-colors mx-1 rounded'
          }
        />

        <Panel defaultSize={isMobile ? 70 : 60} minSize={30}>
          <PanelGroup direction="vertical" className="h-full">
            <Panel defaultSize={60} minSize={30}>
              <CodeEditor
                language={language}
                onRun={onRun}
                onSubmit={onSubmit}
                isExecuting={isExecuting}
                isValidating={isValidating}
              />
            </Panel>

            <PanelResizeHandle className="h-2 bg-border hover:bg-border-focus transition-colors my-1 rounded" />

            <Panel defaultSize={40} minSize={20}>
              <div className="h-full">
                <OutputPanel result={result} validationResult={validationResult} isLoading={isExecuting || isValidating} />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
