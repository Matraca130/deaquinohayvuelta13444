// ============================================================
// Axon — API Configuration (Single Source of Truth) v4.4
//
// TWO backends, SAME Supabase project (xdnciktarvxyhkrokbng):
//   REAL  → make-server-6569f786  (39 Postgres tables, auth, RLS)
//   FIGMA → make-server-9e5922ee  (KV store, AI prototyping)
//
// Auth pattern (REAL backend):
//   Authorization: Bearer ANON_KEY          ← Supabase gateway
//   X-Access-Token: <user JWT from auth>    ← identifies the user
//
// Response format (REAL backend):
//   Success: { data: ... }
//   Error:   { error: "message" }
//   Paginated: { data: { items: [...], total, limit, offset } }
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// ── Constants ─────────────────────────────────────────────

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY = publicAnonKey;

/** The real deployed backend — 39 Postgres tables, RBAC, auth */
export const REAL_BACKEND_URL = `${SUPABASE_URL}/functions/v1/make-server-6569f786`;

/** The Figma Make backend — KV store, AI prototyping only */
export const FIGMA_BACKEND_URL = `${SUPABASE_URL}/functions/v1/make-server-9e5922ee`;

// ── Supabase Client (singleton for client-side auth) ──────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Re-export for backward compat
export { publicAnonKey };

// ── Auth tokens ───────────────────────────────────────────

const TOKEN_KEY = 'axon_access_token';

/** Get the user JWT stored after login */
export function getRealToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Store the user JWT */
export function setRealToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Clear the stored token */
export function clearRealToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Error class ───────────────────────────────────────────

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// ── Real Backend Request ──────────────────────────────────
// Headers: Authorization=ANON_KEY (gateway) + X-Access-Token=JWT (user)
// Unwraps { data: ... } response format

export async function realRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${REAL_BACKEND_URL}${path}`;
  const token = getRealToken();

  console.log(`[API] ${options?.method || 'GET'} ${path}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  // Add user JWT if available
  if (token) {
    headers['X-Access-Token'] = token;
  }

  // Merge any extra headers from options
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({
    error: `Failed to parse response from ${path}`,
  }));

  if (!res.ok) {
    const msg = body?.error || `API error ${res.status} at ${path}`;
    console.error(`[API] Error ${res.status}: ${msg}`);
    throw new ApiError(msg, 'API_ERROR', res.status);
  }

  // Unwrap { data: ... } envelope
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }

  // Fallback: return raw body
  return body as T;
}

// ── Figma Make Backend Request ────────────────────────────
// Uses ANON_KEY only (no user auth needed)
// For AI/prototyping endpoints

export async function figmaRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${FIGMA_BACKEND_URL}${path}`;

  console.log(`[FigmaAPI] ${options?.method || 'GET'} ${path}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...((options?.headers as Record<string, string>) || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new ApiError(
      body?.error || `Figma API error ${res.status} at ${path}`,
      'FIGMA_ERROR',
      res.status
    );
  }

  return res.json() as Promise<T>;
}
