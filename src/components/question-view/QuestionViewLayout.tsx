import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Question, QueryResult, ValidationResult, getEditorLanguage } from '@/types';
import { QuestionDescription } from './QuestionDescription';
import { QuestionHeader } from './QuestionHeader';
import { QuestionTabs, QuestionTab } from './QuestionTabs';
import { HintsPanel } from './HintsPanel';
import { DiscussionPanel } from './DiscussionPanel';
import { SolutionsPanel } from './SolutionsPanel';
import { BugReportPopover } from './BugReportPopover';
import { TimerWidget } from './TimerWidget';
import { QuestionNavButtons } from './QuestionNavButtons';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { OutputPanel } from '@/components/editor/OutputPanel';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useAuthGate, useSubmissionGate } from '@/hooks/useAuthGate';

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
  prevUrl: string | null;
  nextUrl: string | null;
}

export function QuestionViewLayout({
  question,
  result,
  validationResult,
  isExecuting,
  isValidating,
  onRun,
  onSubmit,
  prevUrl,
  nextUrl,
}: QuestionViewLayoutProps) {
  const language = getEditorLanguage(question);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<QuestionTab>('description');
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { hasSubmitted } = useSubmissionGate(question.id);

  const hints = question.hints || [];
  const hasHints = hints.length > 0;

  // Reset tab when question changes
  useEffect(() => {
    setActiveTab('description');
  }, [question.id]);

  const handleTabChange = (tab: QuestionTab) => {
    if (tab === 'hints' || tab === 'discussion' || tab === 'solutions') {
      if (!requireAuth()) return;
    }
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return <QuestionDescription question={question} />;
      case 'hints':
        return (
          <div className="p-6">
            <HintsPanel hints={hints} />
          </div>
        );
      case 'discussion':
        return <DiscussionPanel questionId={question.id} hasSubmitted={hasSubmitted} />;
      case 'solutions':
        return <SolutionsPanel question={question} hasSubmitted={hasSubmitted} />;
    }
  };

  return (
    <div className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-start justify-between">
        <Breadcrumb
          items={[
            { label: skillNames[question.skill] || question.skill, href: `/${question.skill}` },
            { label: question.title },
          ]}
        />
        <QuestionNavButtons prevUrl={prevUrl} nextUrl={nextUrl} />
      </div>
      <PanelGroup direction={isMobile ? 'vertical' : 'horizontal'} className="flex-1 min-h-0">
        <Panel defaultSize={isMobile ? 30 : 40} minSize={20}>
          <div className="h-full bg-surface rounded-lg shadow-md overflow-hidden flex flex-col">
            <QuestionHeader question={question}>
              <TimerWidget />
              <BugReportPopover questionId={question.id} />
            </QuestionHeader>
            <QuestionTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              hasHints={hasHints}
              isAuthenticated={isAuthenticated}
              hasSubmitted={hasSubmitted}
            />
            <div className="flex-1 overflow-y-auto">
              {renderTabContent()}
            </div>
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
