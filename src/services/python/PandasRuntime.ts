import { pyodideService } from './PyodideService';
import { QueryResult } from '@/types';

class PandasRuntime {
  private pandasInstalled = false;
  private initialized = false;

  async initialize(): Promise<void> {
    await pyodideService.initialize();

    if (!this.pandasInstalled) {
      await pyodideService.installPackage('pandas');
      await pyodideService.runPython(`
import pandas as pd
import numpy as np
`);
      this.pandasInstalled = true;
    }

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async createDataFrame(name: string, csvData: string): Promise<void> {
    if (!this.initialized) throw new Error('PandasRuntime not initialized');

    const escapedCsv = csvData.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    await pyodideService.runPython(`
import io
${name} = pd.read_csv(io.StringIO('${escapedCsv}'))
`);
  }

  async dropAllDataFrames(): Promise<void> {
    // No-op; each validation run creates fresh DataFrames that overwrite previous ones
  }

  async executeCode(code: string): Promise<QueryResult> {
    if (!this.initialized) throw new Error('PandasRuntime not initialized');

    try {
      const wrappedCode = `
import json

# Execute user code
${code}

# Try to find the result DataFrame
_result = None
for _var_name in list(locals().keys()):
    _var = locals()[_var_name]
    if isinstance(_var, pd.DataFrame) and _var_name.startswith('result'):
        _result = _var
        break

if _result is None:
    for _var_name in reversed(list(locals().keys())):
        _var = locals()[_var_name]
        if isinstance(_var, pd.DataFrame) and not _var_name.startswith('_'):
            _result = _var
            break

if _result is not None:
    _cols = list(_result.columns)
    _data = _result.values.tolist()
    json.dumps({"columns": _cols, "data": _data})
else:
    json.dumps({"columns": [], "data": [], "error": "No result DataFrame found. Assign your result to a variable named 'result'."})
`;
      const resultJson = await pyodideService.runPython(wrappedCode);
      const result = JSON.parse(resultJson);

      if (result.error) {
        return { columns: [], rows: [], error: result.error };
      }

      return { columns: result.columns, rows: result.data };
    } catch (error) {
      return {
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const pandasRuntime = new PandasRuntime();
