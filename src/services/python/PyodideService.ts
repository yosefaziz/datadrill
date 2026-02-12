import { loadPyodide, PyodideInterface } from 'pyodide';

class PyodideService {
  private pyodide: PyodideInterface | null = null;
  private initPromise: Promise<void> | null = null;

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
  }

  isInitialized(): boolean {
    return this.pyodide !== null;
  }

  async runPython(code: string): Promise<string> {
    if (!this.pyodide) throw new Error('PyodideService not initialized');
    return await this.pyodide.runPythonAsync(code);
  }

  async runInNamespace(code: string, namespace: Record<string, unknown>): Promise<string> {
    if (!this.pyodide) throw new Error('PyodideService not initialized');
    const ns = this.pyodide.globals.get('dict')();
    // Copy builtins into namespace
    const builtins = this.pyodide.globals.get('__builtins__');
    ns.set('__builtins__', builtins);
    // Copy any additional entries
    for (const [key, value] of Object.entries(namespace)) {
      ns.set(key, value);
    }
    try {
      return await this.pyodide.runPythonAsync(code, { globals: ns });
    } finally {
      ns.destroy();
    }
  }

  async createNamespace(): Promise<ReturnType<PyodideInterface['globals']['get']>> {
    if (!this.pyodide) throw new Error('PyodideService not initialized');
    const ns = this.pyodide.globals.get('dict')();
    // Copy all globals (including builtins) into the new namespace
    const keys = this.pyodide.globals.toJs();
    for (const [key, value] of keys) {
      ns.set(key, value);
    }
    return ns;
  }

  async installPackage(pkg: string): Promise<void> {
    if (!this.pyodide) throw new Error('PyodideService not initialized');
    await this.pyodide.loadPackage('micropip');
    const micropip = this.pyodide.pyimport('micropip');
    await micropip.install(pkg);
  }

  getPyodide(): PyodideInterface {
    if (!this.pyodide) throw new Error('PyodideService not initialized');
    return this.pyodide;
  }
}

export const pyodideService = new PyodideService();
