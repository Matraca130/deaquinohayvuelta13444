// ============================================================
// Axon — Environment Config (dual-mode: Figma Make + Production)
// ============================================================
//
// In FIGMA MAKE (DEV=true): uses auto-generated utils/supabase/info.tsx
// In PRODUCTION (DEV=false): reads from VITE_SUPABASE_* env vars.
// ============================================================

import { projectId as fmProjectId, publicAnonKey as fmAnonKey } from '/utils/supabase/info';

function ensureHttps(url: string): string {
  let u = url.trim();
  if (u.startsWith('https://')) { /* ok */ }
  else if (u.startsWith('http://')) { u = u.replace('http://', 'https://'); }
  else if (u.startsWith('//')) { u = `https:${u}`; }
  else { u = `https://${u}`; }
  return u.replace(/\/+$/, '');
}

const isDev = import.meta.env.DEV;
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const envApiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

const isProduction = !isDev && !!(envUrl && envKey);

export const supabaseUrl: string = isProduction
  ? ensureHttps(envUrl!)
  : `https://${fmProjectId}.supabase.co`;

export const supabaseAnonKey: string = isProduction
  ? envKey!
  : fmAnonKey;

// API base URL for the real Hono backend
const FM_FUNCTION_NAME = 'make-server-6569f786';
const PROD_FUNCTION_NAME = 'server';

export const apiBaseUrl: string = isProduction
  ? ensureHttps(envApiBase || `${supabaseUrl}/functions/v1/${PROD_FUNCTION_NAME}`)
  : `https://${fmProjectId}.supabase.co/functions/v1/${FM_FUNCTION_NAME}`;

export const environment = isProduction ? 'PRODUCTION' : 'FIGMA_MAKE';

// Q1 — only log config in dev (avoids leaking URLs in production console)
if (import.meta.env.DEV) {
  console.log('[Config] Mode:', environment, `(DEV=${isDev})`);
  console.log('[Config] Supabase URL:', supabaseUrl);
  console.log('[Config] API Base URL:', apiBaseUrl);
}