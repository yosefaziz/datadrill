import { Question, isDebugQuestion } from '@/types';

interface QuestionDescriptionProps {
  question: Question;
}

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

const skillBadges = {
  sql: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'SQL' },
  pyspark: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'PySpark' },
  debug: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Debug' },
};

export function QuestionDescription({ question }: QuestionDescriptionProps) {
  const isDebug = isDebugQuestion(question);
  const skillBadge = skillBadges[question.skill];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-800">{question.title}</h1>
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
            className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <div
        className="prose prose-slate max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: question.description }}
      />

      {/* Show hint for debug questions */}
      {isDebug && question.hint && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-lg">💡</span>
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Hint</h3>
              <p className="text-amber-700 text-sm">{question.hint}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
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
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Expected Output
          </h2>
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: question.expectedOutput }}
          />
        </div>
      </div>
    </div>
  );
}

function Table({ csvData }: { csvData: string }) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map((line) => line.split(','));

  return (
    <table className="w-full text-sm border border-slate-300 rounded">
      <thead className="bg-slate-100">
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-3 py-2 text-left font-semibold text-slate-700 border-b border-slate-300"
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
              <td key={j} className="px-3 py-2 border-b border-slate-200">
                {cell.trim()}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
