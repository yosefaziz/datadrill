import * as duckdb from '@duckdb/duckdb-wasm';
import { QueryResult } from '@/types';

class DuckDBService {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: 'text/javascript',
      })
    );

    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);

    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(worker_url);

    this.conn = await this.db.connect();
  }

  async createTable(name: string, csvData: string): Promise<void> {
    if (!this.conn) throw new Error('DuckDB not initialized');

    // Drop table if exists
    await this.conn.query(`DROP TABLE IF EXISTS ${name}`);

    // Register CSV data and create table from it
    if (!this.db) throw new Error('DuckDB not initialized');

    const encoder = new TextEncoder();
    const csvBuffer = encoder.encode(csvData);

    await this.db.registerFileBuffer(`${name}.csv`, csvBuffer);
    await this.conn.query(
      `CREATE TABLE ${name} AS SELECT * FROM read_csv_auto('${name}.csv')`
    );
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Query timed out after ${timeoutMs / 1000} seconds`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  async executeQuery(sql: string, limit?: number, timeoutMs = 30000): Promise<QueryResult> {
    if (!this.conn) throw new Error('DuckDB not initialized');

    try {
      // Strip trailing semicolons and whitespace for subquery wrapping
      const cleanedSql = sql.trim().replace(/;+$/, '');
      const finalSql = limit ? `SELECT * FROM (${cleanedSql}) LIMIT ${limit}` : cleanedSql;
      const result = await this.withTimeout(this.conn.query(finalSql), timeoutMs);

      const columns = result.schema.fields.map((f) => f.name);
      const rows: unknown[][] = [];

      for (let i = 0; i < result.numRows; i++) {
        const row: unknown[] = [];
        for (let j = 0; j < columns.length; j++) {
          row.push(result.getChildAt(j)?.get(i));
        }
        rows.push(row);
      }

      return { columns, rows };
    } catch (error) {
      return {
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async dropAllTables(): Promise<void> {
    if (!this.conn) return;

    const result = await this.conn.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'"
    );

    for (let i = 0; i < result.numRows; i++) {
      const tableName = result.getChildAt(0)?.get(i);
      if (tableName) {
        await this.conn.query(`DROP TABLE IF EXISTS "${tableName}"`);
      }
    }
  }

  isInitialized(): boolean {
    return this.db !== null && this.conn !== null;
  }
}

export const duckDBService = new DuckDBService();
