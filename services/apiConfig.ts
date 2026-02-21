// ============================================================
// Axon — API Configuration (Single Source of Truth)
//
// ALL API services import their base URL and auth strategy
// from here. To switch between environments, change ONE file.
//
// Architecture:
//   authApi.ts      → REAL_BACKEND_URL  (JWT real)
//   platformApi.ts  → REAL_BACKEND_URL  (JWT real)
//   studentApi.ts   → REAL_BACKEND_URL  (JWT real)
//   aiApi (Figma)   → FIGMA_BACKEND_URL (publicAnonKey)
// ============================================================

import { projectId, publicAnonKey } from '/utils/supabase/info';

// ── Backend URLs ──────────────────────────────────────────

/** The real deployed Supabase Edge Function — SQL + KV, RBAC, auth */
export const REAL_BACKEND_URL = `https://${projectId}.supabase.co/functions/v1/server`;

/** The Figma Make Edge Function — KV only, no real auth */
export const FIGMA_BACKEND_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9e5922ee`;

// ── Auth tokens ───────────────────────────────────────────

const TOKEN_KEY = 'axon_access_token';

/** Get the real JWT token stored after login */
export function getRealToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** The Figma Make gateway anon key (for AI-only endpoints) */
export function getAnonKey(): string {
  return publicAnonKey;
}

// ── Request helpers ───────────────────────────────────────

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

/**
 * Generic request to the REAL backend.
 * - Uses real JWT for auth
 * - Unwraps { success, data } response format
 * - Throws ApiError on failure
 */
export async function realRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${REAL_BACKEND_URL}${path}`;
  const token = getRealToken();

  console.log(`[API] ${options?.method || 'GET'} ${path}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options?.headers as Record<string, string>) || {}),
    },
  });

  const body = await res.json().catch(() => ({
    success: false,
    error: { code: 'PARSE_ERROR', message: `Failed to parse response from ${path}` },
  }));

  if (!res.ok) {
    const msg = body?.error?.message || `API error ${res.status} at ${path}`;
    const code = body?.error?.code || 'UNKNOWN';
    console.error(`[API] Error ${res.status}: ${msg}`);
    throw new ApiError(msg, code, res.status);
  }

  // The real backend wraps responses in { success: true, data: ... }
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      throw new ApiError(
        body.error?.message || 'Unknown error',
        body.error?.code || 'UNKNOWN',
        res.status
      );
    }
    return body.data as T;
  }

  return body as T;
}

/**
 * Generic request to the FIGMA MAKE backend.
 * - Uses publicAnonKey for auth (gateway requirement)
 * - Returns raw response (no { success, data } wrapper)
 * - Used ONLY for AI endpoints not available in the real backend
 */
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
      Authorization: `Bearer ${publicAnonKey}`,
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