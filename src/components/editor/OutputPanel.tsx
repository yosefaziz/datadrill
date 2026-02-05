import { QueryResult, ValidationResult } from '@/types';

interface OutputPanelProps {
  result: QueryResult | null;
  validationResult: ValidationResult | null;
  isLoading?: boolean;
}

export function OutputPanel({ result, validationResult, isLoading }: OutputPanelProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-surface rounded-lg" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" aria-hidden="true" />
          <span className="text-sm">Executing query...</span>
        </div>
      </div>
    );
  }

  if (validationResult) {
    return (
      <div className="h-full overflow-auto bg-surface rounded-lg p-4" role="status" aria-live="polite">
        <div
          className={`text-center p-6 rounded-lg ${
            validationResult.passed
              ? 'bg-success/20 text-success'
              : 'bg-error/20 text-error'
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
            <div className="mt-3 text-sm bg-bg-secondary bg-opacity-50 p-2 rounded">
              {validationResult.error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-surface rounded-lg text-text-muted">
        Run a query to see results
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="h-full overflow-auto bg-surface rounded-lg p-4">
        <div className="bg-error/20 text-error p-4 rounded-lg">
          <div className="font-semibold mb-2">Error</div>
          <pre className="text-sm whitespace-pre-wrap">{result.error}</pre>
        </div>
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-surface rounded-lg text-text-muted">
        Query returned no results
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-surface rounded-lg">
      <table className="w-full text-sm" aria-label="Query results">
        <thead className="bg-bg-secondary sticky top-0">
          <tr>
            {result.columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-2 text-left font-semibold text-text-primary border-b border-border"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="hover:bg-bg-secondary">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 border-b border-border text-text-secondary">
                  {cell === null ? (
                    <span className="text-text-muted italic">NULL</span>
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
