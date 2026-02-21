// ============================================================
// Axon — Auth API Service (Frontend -> Real Supabase)
// Connects directly to the deployed Edge Functions.
// Uses centralized config from apiConfig.ts.
// ============================================================

import { REAL_BACKEND_URL } from '@/app/services/apiConfig';

// The real Supabase Edge Function endpoint
const BASE_URL = REAL_BACKEND_URL;

// Re-export publicAnonKey for backward compatibility
import { publicAnonKey } from '/utils/supabase/info';

// ── Types ─────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  is_super_admin: boolean;
  platform_role?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  institution_id: string;
  role: 'owner' | 'admin' | 'professor' | 'student';
  plan_id: string | null;
  is_active?: boolean;
  created_at: string;
  institution: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    is_active: boolean;
    settings?: Record<string, any>;
  } | null;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    access_token: string;
    memberships: Membership[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface MeResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    memberships: Membership[];
  };
  error?: {
    code: string;
    message: string;
  };
}

// ── Storage Keys ──────────────────────────────────────────

const TOKEN_KEY = 'axon_access_token';
const USER_KEY = 'axon_user';
const MEMBERSHIPS_KEY = 'axon_memberships';

// ── Token Management ──────────────────────────────────────

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getStoredMemberships(): Membership[] {
  const raw = localStorage.getItem(MEMBERSHIPS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveAuthData(user: AuthUser, token: string, memberships: Membership[]) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MEMBERSHIPS_KEY);
}

// ── Helper ────────────────────────────────────────────────

async function authRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  console.log(`[authApi] ${options?.method || 'GET'} ${url}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getStoredToken() || publicAnonKey}`,
      ...(options?.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({ success: false, error: { code: 'PARSE_ERROR', message: 'Failed to parse response' } }));

  if (!res.ok) {
    console.error(`[authApi] Error ${res.status} at ${path}:`, body);
    throw new AuthApiError(
      body?.error?.message || `API error ${res.status}`,
      body?.error?.code || 'UNKNOWN',
      res.status
    );
  }

  return body as T;
}

export class AuthApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.status = status;
  }
}

// ── Sign In ───────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const res = await authRequest<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (res.success && res.data) {
    saveAuthData(res.data.user, res.data.access_token, res.data.memberships);
    console.log(`[authApi] Sign in success: ${res.data.user.email}, ${res.data.memberships.length} memberships`);
  }

  return res;
}

// ── Sign Up ───────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  name: string,
  institutionId?: string
): Promise<AuthResponse> {
  const res = await authRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      name,
      institution_id: institutionId,
    }),
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (res.success && res.data) {
    saveAuthData(res.data.user, res.data.access_token, res.data.memberships);
    console.log(`[authApi] Sign up success: ${res.data.user.email}`);
  }

  return res;
}

// ── Restore Session (GET /auth/me) ────────────────────────

export async function restoreSession(): Promise<MeResponse> {
  const token = getStoredToken();
  if (!token) {
    return { success: false, error: { code: 'NO_TOKEN', message: 'No stored token' } };
  }

  const res = await authRequest<MeResponse>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.success && res.data) {
    // Update stored user/memberships but keep existing token
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(res.data.memberships));
    console.log(`[authApi] Session restored: ${res.data.user.email}`);
  }

  return res;
}

// ── Sign Out ──────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await authRequest('/auth/signout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn('[authApi] Signout request failed (clearing local data anyway):', err);
    }
  }
  clearAuthData();
  console.log('[authApi] Signed out, local data cleared');
}