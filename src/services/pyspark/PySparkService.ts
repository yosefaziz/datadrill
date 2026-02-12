import { pyodideService } from '@/services/python/PyodideService';
import { QueryResult } from '@/types';
import mockPySparkCode from './mockPySpark.py?raw';

class PySparkService {
  private mockLoaded = false;
  private dataframes: Map<string, string> = new Map();

  async initialize(): Promise<void> {
    await pyodideService.initialize();

    if (!this.mockLoaded) {
      await pyodideService.runPython(mockPySparkCode);
      this.mockLoaded = true;
    }
  }

  async createDataFrame(name: string, csvData: string): Promise<void> {
    if (!pyodideService.isInitialized()) throw new Error('PySparkService not initialized');

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

    await pyodideService.runPython(`
import json
${name} = DataFrame(json.loads('${dataJson.replace(/'/g, "\\'")}'), json.loads('${headersJson.replace(/'/g, "\\'")}'))
`);

    this.dataframes.set(name, csvData);
  }

  async dropAllDataFrames(): Promise<void> {
    if (!pyodideService.isInitialized()) return;

    for (const name of this.dataframes.keys()) {
      try {
        await pyodideService.runPython(`del ${name}`);
      } catch {
        // Ignore if variable doesn't exist
      }
    }
    this.dataframes.clear();
  }

  async executeCode(code: string): Promise<QueryResult> {
    if (!pyodideService.isInitialized()) throw new Error('PySparkService not initialized');

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

      const resultJson = await pyodideService.runPython(wrappedCode);
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
    return pyodideService.isInitialized() && this.mockLoaded;
  }
}

export const pySparkService = new PySparkService();
