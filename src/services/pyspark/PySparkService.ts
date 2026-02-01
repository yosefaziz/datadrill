import { loadPyodide, PyodideInterface } from 'pyodide';
import { QueryResult } from '@/types';
import mockPySparkCode from './mockPySpark.py?raw';

class PySparkService {
  private pyodide: PyodideInterface | null = null;
  private initPromise: Promise<void> | null = null;
  private dataframes: Map<string, string> = new Map();

  async initialize(): Promise<void> {
    if (this.pyodide) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
    });

    // Install the mock PySpark module
    // Functions (col, lit, count, sum, avg, max, min) are defined in mockPySparkCode
    // and will be available in the global namespace for user code
    await this.pyodide.runPythonAsync(mockPySparkCode);
  }

  async createDataFrame(name: string, csvData: string): Promise<void> {
    if (!this.pyodide) throw new Error('PySparkService not initialized');

    // Parse CSV to create DataFrame
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        const value = values[idx];
        // Try to parse as number
        const num = Number(value);
        row[header] = isNaN(num) ? value : num;
      });
      rows.push(row);
    }

    // Store the DataFrame definition
    const dataJson = JSON.stringify(rows);
    const headersJson = JSON.stringify(headers);

    await this.pyodide.runPythonAsync(`
import json
${name} = DataFrame(json.loads('${dataJson.replace(/'/g, "\\'")}'), json.loads('${headersJson.replace(/'/g, "\\'")}'))
`);

    this.dataframes.set(name, csvData);
  }

  async dropAllDataFrames(): Promise<void> {
    if (!this.pyodide) return;

    for (const name of this.dataframes.keys()) {
      try {
        await this.pyodide.runPythonAsync(`del ${name}`);
      } catch {
        // Ignore if variable doesn't exist
      }
    }
    this.dataframes.clear();
  }

  async executeCode(code: string): Promise<QueryResult> {
    if (!this.pyodide) throw new Error('PySparkService not initialized');

    try {
      // Execute the user code and capture the result
      const wrappedCode = `
import json

# Execute user code
${code}

# Try to find the result DataFrame
_result = None
for _var_name in list(locals().keys()):
    _var = locals()[_var_name]
    if isinstance(_var, DataFrame) and _var_name.startswith('result'):
        _result = _var
        break

# If no 'result' variable, look for the last DataFrame
if _result is None:
    for _var_name in reversed(list(locals().keys())):
        _var = locals()[_var_name]
        if isinstance(_var, DataFrame) and not _var_name.startswith('_'):
            _result = _var
            break

# Output the result
_result.toJSON() if _result is not None else json.dumps({"columns": [], "data": [], "error": "No result DataFrame found. Assign your result to a variable named 'result'."})
`;

      const resultJson = await this.pyodide.runPythonAsync(wrappedCode);
      const result = JSON.parse(resultJson);

      if (result.error) {
        return {
          columns: [],
          rows: [],
          error: result.error,
        };
      }

      // Convert data to rows array format
      const columns = result.columns;
      const rows = result.data.map((row: Record<string, unknown>) =>
        columns.map((col: string) => row[col])
      );

      return { columns, rows };
    } catch (error) {
      return {
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  isInitialized(): boolean {
    return this.pyodide !== null;
  }
}

export const pySparkService = new PySparkService();
