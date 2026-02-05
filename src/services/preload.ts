import { duckDBService } from './duckdb/DuckDBService';

/**
 * Preload DuckDB WASM during browser idle time.
 * This allows SQL questions to start faster since the WASM module
 * will already be loaded when the user navigates to a question.
 */
export function preloadDuckDB(): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(
      () => {
        duckDBService.initialize().catch(() => {
          // Silently ignore errors - DuckDB will retry on first use
        });
      },
      { timeout: 3000 }
    );
  } else {
    // Fallback for browsers without requestIdleCallback (Safari)
    setTimeout(() => {
      duckDBService.initialize().catch(() => {
        // Silently ignore errors - DuckDB will retry on first use
      });
    }, 1000);
  }
}
