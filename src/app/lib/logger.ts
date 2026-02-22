// ============================================================
// Axon — Lightweight Logger (Q1 — replaces raw console.log)
//
// In production, only warnings and errors are emitted.
// In dev (Figma Make), all levels are emitted.
// ============================================================

const isDev = import.meta.env.DEV;

function noop() {}

export const logger = {
  /** Debug-only — stripped in production */
  debug: isDev ? console.log.bind(console) : noop,
  /** Always emitted */
  info: console.info.bind(console),
  /** Always emitted */
  warn: console.warn.bind(console),
  /** Always emitted */
  error: console.error.bind(console),
} as const;
