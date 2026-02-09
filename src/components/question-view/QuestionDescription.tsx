import { Question, isDebugQuestion, isArchitectureQuestion, isModelingQuestion } from '@/types';

interface QuestionDescriptionProps {
  question: Question;
}

export function QuestionDescription({ question }: QuestionDescriptionProps) {
  const isDebug = isDebugQuestion(question);

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

      {/* Tables and Expected Output only for code-based questions */}
      {!isArchitectureQuestion(question) && !isModelingQuestion(question) && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {question.skill === 'python' ? 'DataFrames' : 'Tables'}
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
