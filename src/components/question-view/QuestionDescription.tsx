import { Question, isDebugQuestion, isArchitectureQuestion, isModelingQuestion } from '@/types';

interface QuestionDescriptionProps {
  question: Question;
}

const difficultyColors = {
  Easy: 'bg-success/20 text-success',
  Medium: 'bg-warning/20 text-warning',
  Hard: 'bg-error/20 text-error',
};

const skillBadges = {
  sql: { bg: 'bg-info/20', text: 'text-info', label: 'SQL' },
  pyspark: { bg: 'bg-warning/20', text: 'text-warning', label: 'PySpark' },
  debug: { bg: 'bg-accent/20', text: 'text-accent', label: 'Debug' },
  architecture: { bg: 'bg-primary/20', text: 'text-primary', label: 'Architecture' },
  modeling: { bg: 'bg-success/20', text: 'text-success', label: 'Modeling' },
};

export function QuestionDescription({ question }: QuestionDescriptionProps) {
  const isDebug = isDebugQuestion(question);
  const skillBadge = skillBadges[question.skill];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-text-primary">{question.title}</h1>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${skillBadge.bg} ${skillBadge.text}`}
          >
            {skillBadge.label}
            {isDebug && ` (${question.language.toUpperCase()})`}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              difficultyColors[question.difficulty]
            }`}
          >
            {question.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-bg-secondary text-text-secondary rounded text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

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
              {question.skill === 'pyspark' ? 'DataFrames' : 'Tables'}
            </h2>
            {question.tables.map((table) => (
              <div key={table.name} className="mb-4">
                <h3 className="font-mono text-sm font-semibold text-slate-700 mb-2">
                  {table.name}
                </h3>
                <div className="overflow-x-auto">
                  <Table csvData={table.visibleData} />
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              Expected Output
            </h2>
            <div
              className="prose prose-slate max-w-none prose-invert"
              dangerouslySetInnerHTML={{ __html: question.expectedOutput }}
            />
          </div>
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
    <table className="w-full text-sm border border-border rounded">
      <thead className="bg-bg-secondary">
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-3 py-2 text-left font-semibold text-text-primary border-b border-border"
            >
              {header.trim()}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="px-3 py-2 text-text-secondary border-b border-border">
                {cell.trim()}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
