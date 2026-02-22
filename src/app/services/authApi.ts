// ============================================================
// Axon — Auth API Service v4.4
//
// Login/signup/signout via Supabase Auth (client-side).
// After login, fetches memberships from the REAL backend.
//
// Auth flow:
//   1. supabase.auth.signInWithPassword() → gets JWT
//   2. GET /memberships (with JWT) → gets user's roles
//   3. Store JWT + memberships in localStorage
// ============================================================

import { supabase, realRequest, setRealToken, clearRealToken, getRealToken } from '@/app/services/apiConfig';

// ── Types ─────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  institution_id: string;
  role: 'owner' | 'admin' | 'professor' | 'student';
  plan_id: string | null;
  is_active: boolean;
  created_at: string;
  institution?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    is_active: boolean;
    settings?: Record<string, any>;
  } | null;
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

// ── Storage Keys ──────────────────────────────────────────

const TOKEN_KEY = 'axon_access_token';
const USER_KEY = 'axon_user';
const MEMBERSHIPS_KEY = 'axon_memberships';

// ── Token / User / Membership getters ─────────────────────

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
  setRealToken(token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
}

export function clearAuthData() {
  clearRealToken();
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MEMBERSHIPS_KEY);
}

// ── Fetch memberships from real backend ───────────────────

async function fetchMemberships(): Promise<Membership[]> {
  // STRATEGY: Use /institutions (returns user's role + institution data without
  // requiring institution_id param) instead of /memberships (which requires
  // institution_id and returns 400 without it).
  try {
    const raw = await realRequest<any>('/institutions');
    console.log('[authApi] /institutions raw response:', raw);

    // Normalize: could be an array directly, or { items: [...] }
    let items: any[];
    if (Array.isArray(raw)) {
      items = raw;
    } else if (raw && Array.isArray(raw.items)) {
      items = raw.items;
    } else {
      console.warn('[authApi] /institutions returned unexpected format:', typeof raw, raw);
      items = [];
    }

    // Map institution entries to Membership objects.
    // /institutions returns enriched objects with role + membership info.
    const memberships: Membership[] = items.map((inst: any) => ({
      // membership_id might come as membership_id, member_id, or we synthesize one
      id: inst.membership_id || inst.member_id || inst.pivot_id || `membership-${inst.id}`,
      user_id: inst.user_id || '',
      institution_id: inst.id || inst.institution_id || '',
      role: (inst.role || 'student') as Membership['role'],
      plan_id: inst.plan_id || null,
      is_active: inst.is_active !== false,
      created_at: inst.created_at || new Date().toISOString(),
      // Embed institution data for UI display
      institution: {
        id: inst.id || inst.institution_id || '',
        name: inst.name || 'Instituicao',
        slug: inst.slug || '',
        logo_url: inst.logo_url || null,
        is_active: inst.is_active !== false,
        settings: inst.settings || {},
      },
    }));

    console.log(`[authApi] Mapped ${memberships.length} memberships from /institutions:`,
      memberships.map(m => `${m.role}@${m.institution?.name} (inst:${m.institution_id})`));
    return memberships;
  } catch (err: any) {
    console.error('[authApi] FAILED to fetch /institutions for memberships:', err?.message, err?.status);

    // Fallback: try /memberships with known institution_id (if we have one cached)
    try {
      const cachedMemberships = getStoredMemberships();
      if (cachedMemberships.length > 0) {
        const instId = cachedMemberships[0].institution_id;
        console.log(`[authApi] Fallback: trying /memberships?institution_id=${instId}`);
        const raw = await realRequest<any>(`/memberships?institution_id=${instId}`);
        let items: any[];
        if (Array.isArray(raw)) items = raw;
        else if (raw && Array.isArray(raw.items)) items = raw.items;
        else items = [];
        if (items.length > 0) {
          console.log(`[authApi] Fallback /memberships returned ${items.length} items`);
          return items as Membership[];
        }
      }
    } catch (fallbackErr: any) {
      console.error('[authApi] Fallback /memberships also failed:', fallbackErr?.message);
    }

    // Re-throw original error
    throw err;
  }
}

// ── Map Supabase user to AuthUser ─────────────────────────

function mapUser(supaUser: any): AuthUser {
  return {
    id: supaUser.id,
    email: supaUser.email || '',
    name: supaUser.user_metadata?.name || supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || '',
    avatar_url: supaUser.user_metadata?.avatar_url || null,
    created_at: supaUser.created_at || new Date().toISOString(),
  };
}

// ── Sign In ───────────────────────────────────────────────

export interface AuthResult {
  success: boolean;
  data?: {
    user: AuthUser;
    access_token: string;
    memberships: Membership[];
  };
  error?: { code: string; message: string };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  console.log('[authApi] Signing in via supabase.auth...');

  let data: any;
  let error: any;

  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    data = result.data;
    error = result.error;
  } catch (err: any) {
    // Network-level failure (project paused, CORS, offline, etc.)
    console.error('[authApi] signInWithPassword threw exception:', err?.message, err);
    const isParseError = err?.message?.toLowerCase().includes('parse')
      || err?.message?.toLowerCase().includes('json')
      || err?.message?.toLowerCase().includes('unexpected');
    const friendlyMsg = isParseError
      ? 'El servidor de autenticación no respondió correctamente. Es posible que el proyecto Supabase esté pausado. Verifica en supabase.com/dashboard que el proyecto esté activo.'
      : `Error de conexión con el servidor de autenticación: ${err?.message || 'Unknown error'}`;
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: friendlyMsg },
    };
  }

  if (error || !data?.session) {
    console.error('[authApi] Sign in failed:', error?.message, 'status:', error?.status);
    // Translate common Supabase auth errors to PT-BR friendly messages
    let friendlyMsg = error?.message || 'Falha no login';
    if (error?.message?.toLowerCase().includes('invalid login credentials')) {
      friendlyMsg = 'Email ou senha incorretos. Verifique suas credenciais.';
    } else if (error?.message?.toLowerCase().includes('email not confirmed')) {
      friendlyMsg = 'Email ainda não confirmado. Verifique sua caixa de entrada.';
    } else if (error?.message?.toLowerCase().includes('parse') || error?.message?.toLowerCase().includes('json')) {
      friendlyMsg = 'O servidor de autenticação retornou uma resposta inválida. Verifique se o projeto Supabase está ativo em supabase.com/dashboard.';
    } else if (error?.message?.toLowerCase().includes('fetch') || error?.message?.toLowerCase().includes('network')) {
      friendlyMsg = 'Erro de rede ao conectar com o servidor. Verifique sua conexão.';
    }
    return {
      success: false,
      error: {
        code: error?.status?.toString() || 'AUTH_ERROR',
        message: friendlyMsg,
      },
    };
  }

  const user = mapUser(data.user);
  const token = data.session.access_token;

  // Store token so realRequest can use it for /memberships call
  setRealToken(token);

  // Fetch memberships from the real backend
  let memberships: Membership[] = [];
  try {
    memberships = await fetchMemberships();
  } catch (err: any) {
    console.error('[authApi] ⚠️ Login OK but memberships fetch FAILED:', err?.message);
    // Auth succeeded but memberships failed — save what we have
    // User will see a warning and can retry
  }

  // Persist everything
  saveAuthData(user, token, memberships);

  console.log(`[authApi] Sign in success: ${user.email}, ${memberships.length} memberships`,
    memberships.length === 0 ? '⚠️ WARNING: 0 memberships — routing may fallback to student!' : '');

  return {
    success: true,
    data: { user, access_token: token, memberships },
  };
}

// ── Sign Up ───────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  name: string,
  institutionId?: string
): Promise<AuthResult> {
  console.log('[authApi] Signing up via supabase.auth...');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, full_name: name },
    },
  });

  if (error || !data.session) {
    console.error('[authApi] Sign up failed:', error?.message);
    return {
      success: false,
      error: {
        code: error?.status?.toString() || 'AUTH_ERROR',
        message: error?.message || 'Sign up failed. Email confirmation may be required.',
      },
    };
  }

  const user = mapUser(data.user);
  const token = data.session.access_token;

  // Store token for subsequent API calls
  setRealToken(token);

  // If institution specified, try to create membership via backend /signup
  if (institutionId) {
    try {
      await realRequest('/signup', {
        method: 'POST',
        body: JSON.stringify({ institution_id: institutionId }),
      });
    } catch (err) {
      console.warn('[authApi] Post-signup institution join failed:', err);
    }
  }

  const memberships = await fetchMemberships();
  saveAuthData(user, token, memberships);

  console.log(`[authApi] Sign up success: ${user.email}`);

  return {
    success: true,
    data: { user, access_token: token, memberships },
  };
}

// ── Restore Session ───────────────────────────────────────

export async function restoreSession(): Promise<AuthResult> {
  console.log('[authApi] Restoring session via supabase.auth.getSession()...');

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    console.log('[authApi] No active session found');
    clearAuthData();
    return {
      success: false,
      error: { code: 'NO_SESSION', message: 'No active session' },
    };
  }

  const user = mapUser(data.session.user);
  const token = data.session.access_token;

  // Update stored token (might have been refreshed)
  setRealToken(token);

  // Refresh memberships
  let memberships: Membership[] = [];
  try {
    memberships = await fetchMemberships();
  } catch (err: any) {
    console.error('[authApi] ⚠️ Session restore: memberships fetch FAILED:', err?.message);
    // Use cached memberships from localStorage if available
    memberships = getStoredMemberships();
    console.log(`[authApi] Using ${memberships.length} cached memberships from localStorage`);
  }
  saveAuthData(user, token, memberships);

  console.log(`[authApi] Session restored: ${user.email}, ${memberships.length} memberships`);

  return {
    success: true,
    data: { user, access_token: token, memberships },
  };
}

// ── Sign Out ──────────────────────────────────────────────

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[authApi] Supabase signout error:', err);
  }
  clearAuthData();
  console.log('[authApi] Signed out, local data cleared');
}