import { QueryResult, ValidationResult } from '@/types';

interface OutputPanelProps {
  result: QueryResult | null;
  validationResult: ValidationResult | null;
  isLoading?: boolean;
}

export function OutputPanel({ result, validationResult, isLoading }: OutputPanelProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg border border-slate-300">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          <span>Executing query...</span>
        </div>
      </div>
    );
  }

  if (validationResult) {
    return (
      <div className="h-full overflow-auto bg-white rounded-lg border border-slate-300 p-4">
        <div
          className={`text-center p-6 rounded-lg ${
            validationResult.passed
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <div className="text-2xl font-bold mb-2">
            {validationResult.passed ? 'Correct!' : 'Incorrect'}
          </div>
          <div className="text-sm">
            Passed {validationResult.passedDatasets} of {validationResult.totalDatasets} test
            cases
          </div>
          {validationResult.error && (
            <div className="mt-3 text-sm bg-white bg-opacity-50 p-2 rounded">
              {validationResult.error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg border border-slate-300 text-slate-500">
        Run a query to see results
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="h-full overflow-auto bg-white rounded-lg border border-slate-300 p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <div className="font-semibold mb-2">Error</div>
          <pre className="text-sm whitespace-pre-wrap">{result.error}</pre>
        </div>
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg border border-slate-300 text-slate-500">
        Query returned no results
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white rounded-lg border border-slate-300">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 sticky top-0">
          <tr>
            {result.columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left font-semibold text-slate-700 border-b border-slate-300"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 border-b border-slate-200">
                  {cell === null ? (
                    <span className="text-slate-400 italic">NULL</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
