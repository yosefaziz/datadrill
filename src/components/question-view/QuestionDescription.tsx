import { Question, isDebugQuestion, isArchitectureQuestion, isModelingQuestion, isPythonCodingQuestion, isPySparkQuestion, isPandasQuestion } from '@/types';

interface QuestionDescriptionProps {
  question: Question;
}

export function QuestionDescription({ question }: QuestionDescriptionProps) {
  const isDebug = isDebugQuestion(question);
  const isCoding = isPythonCodingQuestion(question);
  const hasTables = !isArchitectureQuestion(question) && !isModelingQuestion(question) && !isCoding && 'tables' in question && question.tables.length > 0;

  const dataFrameLabel = isPySparkQuestion(question)
    ? 'DataFrames'
    : isPandasQuestion(question)
      ? 'DataFrames'
      : 'Tables';

  return (
    <div className="p-6">
      <div
        className="prose prose-slate max-w-none mb-6 prose-invert"
        dangerouslySetInnerHTML={{ __html: question.description }}
      />

      {/* Show hint for debug questions */}
      {isDebug && question.hint && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-warning text-lg">💡</span>
            <div>
              <h3 className="font-semibold text-warning mb-1">Hint</h3>
              <p className="text-text-secondary text-sm">{question.hint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Test cases for coding questions */}
      {isCoding && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-3">Test Cases</h2>
            <div className="space-y-3">
              {question.testCases.map((tc, i) => (
                <div key={i} className="rounded-lg ring-1 ring-white/10 overflow-hidden">
                  <div className="bg-bg-secondary px-3 py-2 text-sm font-semibold text-text-primary">
                    {tc.label || `Test ${i + 1}`}
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Input</span>
                      <pre className="mt-1 text-sm text-text-secondary font-mono whitespace-pre-wrap bg-bg-secondary/50 rounded p-2">{tc.call.trim()}</pre>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Expected</span>
                      <pre className="mt-1 text-sm text-text-secondary font-mono whitespace-pre-wrap bg-bg-secondary/50 rounded p-2">{tc.expected.trim()}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {question.hiddenTestCases.length > 0 && (
              <p className="mt-3 text-sm text-text-muted">
                + {question.hiddenTestCases.length} hidden test case{question.hiddenTestCases.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tables and Expected Output only for code-based questions with tables */}
      {hasTables && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {dataFrameLabel}
            </h2>
            {question.tables.map((table) => (
              <div key={table.name} className="mb-4">
                <h3 className="font-mono text-sm font-semibold text-text-primary mb-2">
                  {table.name}
                </h3>
                <div className="overflow-x-auto">
                  <Table csvData={table.visibleData} />
                </div>
              </div>
            ))}
          </div>

          {question.expectedOutput && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                Expected Output
              </h2>
              <div className="overflow-x-auto">
                <Table csvData={question.expectedOutput} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Table({ csvData }: { csvData: string }) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map((line) => line.split(','));

  return (
    <div className="rounded-lg overflow-hidden ring-1 ring-white/10">
      <table className="w-full text-sm">
        <thead className="bg-bg-secondary">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-semibold text-text-primary"
              >
                {header.trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-text-secondary">
                  {cell.trim()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
