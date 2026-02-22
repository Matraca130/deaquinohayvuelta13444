// ============================================================
// Axon — Safe error message extraction
// Avoids `(err: any).message` which is undefined if err is a
// string or other non-Error value.
// ============================================================

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

// ── R3 — AbortController support ──────────────────────────

/**
 * Returns true if the error was caused by an AbortController signal.
 * Used to silently ignore cancelled requests on unmount.
 */
export function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException && err.name === 'AbortError'
  );
}