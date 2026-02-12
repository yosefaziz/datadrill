import { pyodideService } from './PyodideService';
import { QueryResult, TestCase } from '@/types';

export interface TestCaseResult {
  label: string;
  passed: boolean;
  actual: string;
  expected: string;
  error?: string;
}

class CodingRuntime {
  private initialized = false;

  async initialize(): Promise<void> {
    await pyodideService.initialize();
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async execute(code: string): Promise<QueryResult> {
    if (!this.initialized) throw new Error('CodingRuntime not initialized');

    try {
      const wrappedCode = `
import sys, io as _io
_stdout = _io.StringIO()
sys.stdout = _stdout
try:
${code.split('\n').map((line) => '    ' + line).join('\n')}
finally:
    sys.stdout = sys.__stdout__
_stdout.getvalue()
`;
      const result = await pyodideService.runPython(wrappedCode);
      const output = String(result || '');

      return {
        columns: ['Output'],
        rows: output ? [[output]] : [['(no output)']],
      };
    } catch (error) {
      return {
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async runTestCases(userCode: string, testCases: TestCase[]): Promise<TestCaseResult[]> {
    if (!this.initialized) throw new Error('CodingRuntime not initialized');

    const results: TestCaseResult[] = [];

    for (const tc of testCases) {
      try {
        // Run user code + test in an isolated namespace via a single script
        const testScript = `
import json as _json

# User code
${userCode}

# Test case
_actual = ${tc.call}
_expected = ${tc.expected}

def _deep_eq(a, b):
    if type(a) != type(b):
        return False
    if isinstance(a, float):
        return abs(a - b) < 1e-9
    if isinstance(a, dict):
        if set(a.keys()) != set(b.keys()):
            return False
        return all(_deep_eq(a[k], b[k]) for k in a)
    if isinstance(a, (list, tuple)):
        if len(a) != len(b):
            return False
        return all(_deep_eq(x, y) for x, y in zip(a, b))
    return a == b

_passed = _deep_eq(_actual, _expected)
_json.dumps({"passed": _passed, "actual": repr(_actual), "expected": repr(_expected)})
`;
        const resultJson = await pyodideService.runPython(testScript);
        const parsed = JSON.parse(resultJson);

        results.push({
          label: tc.label || tc.call.trim().slice(0, 50),
          passed: parsed.passed,
          actual: parsed.actual,
          expected: parsed.expected,
        });
      } catch (error) {
        results.push({
          label: tc.label || tc.call.trim().slice(0, 50),
          passed: false,
          actual: '',
          expected: '',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}

export const codingRuntime = new CodingRuntime();
