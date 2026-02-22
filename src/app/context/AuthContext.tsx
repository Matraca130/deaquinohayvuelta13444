// ============================================================
// Axon — Auth Context v4.4
//
// Uses Supabase Auth (client-side) + real backend for memberships.
// Provides user, memberships, active membership, and auth actions.
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthUser,
  Membership,
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  restoreSession,
  getStoredUser,
  getStoredMemberships,
  clearAuthData,
  AuthApiError,
  getStoredToken,
} from '@/app/services/authApi';

// ── Types ─────────────────────────────────────────────────

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  status: AuthStatus;
  user: AuthUser | null;
  memberships: Membership[];
  activeMembership: Membership | null;
  setActiveMembership: (m: Membership) => void;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, institutionId?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  status: 'loading',
  user: null,
  memberships: [],
  activeMembership: null,
  setActiveMembership: () => {},
  accessToken: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
});

// ── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeMembership, setActiveMembershipState] = useState<Membership | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // ── Restore active membership from localStorage ─────────
  const restoreActiveMembership = useCallback((membershipList: Membership[]) => {
    if (membershipList.length === 0) {
      setActiveMembershipState(null);
      return;
    }

    // Try to restore previously selected membership
    try {
      const stored = localStorage.getItem('axon_active_membership');
      if (stored) {
        const parsed = JSON.parse(stored);
        const found = membershipList.find(m => m.id === parsed.id);
        if (found) {
          setActiveMembershipState(found);
          return;
        }
      }
    } catch { /* ignore */ }

    // Default to first membership
    setActiveMembershipState(membershipList[0]);
  }, []);

  // ── Restore session on mount ────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      // Optimistic: show stored data immediately
      const storedUser = getStoredUser();
      const storedMemberships = getStoredMemberships();
      const storedToken = getStoredToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
        setMemberships(storedMemberships);
        setAccessToken(storedToken);
        restoreActiveMembership(storedMemberships);
      }

      try {
        const res = await restoreSession();
        if (cancelled) return;

        if (res.success && res.data) {
          setUser(res.data.user);
          setMemberships(res.data.memberships);
          setAccessToken(res.data.access_token);
          restoreActiveMembership(res.data.memberships);
          setStatus('authenticated');
          console.log('[AuthContext] Session restored from Supabase Auth');
        } else {
          // No valid session
          clearAuthData();
          setUser(null);
          setMemberships([]);
          setAccessToken(null);
          setActiveMembershipState(null);
          setStatus('unauthenticated');
          console.log('[AuthContext] No active session');
        }
      } catch (err) {
        if (cancelled) return;
        // If server unreachable but we have stored data, use it
        if (storedUser && storedToken) {
          setStatus('authenticated');
          console.warn('[AuthContext] Server unreachable, using cached session');
        } else {
          clearAuthData();
          setStatus('unauthenticated');
          console.error('[AuthContext] Session restore error:', err);
        }
      }
    }

    restore();
    return () => { cancelled = true; };
  }, [restoreActiveMembership]);

  // ── Sign In ─────────────────────────────────────────────
  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiSignIn(email, password);
      if (res.success && res.data) {
        console.log(`[AuthContext] Sign in OK: ${res.data.user.email}, ` +
          `${res.data.memberships.length} memberships, ` +
          `roles: [${res.data.memberships.map(m => m.role).join(', ')}]`);
        setUser(res.data.user);
        setMemberships(res.data.memberships);
        setAccessToken(res.data.access_token);
        restoreActiveMembership(res.data.memberships);
        setStatus('authenticated');
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Sign in failed' };
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : 'Connection error';
      console.error('[AuthContext] Sign in error:', err);
      return { success: false, error: msg };
    }
  }, [restoreActiveMembership]);

  // ── Sign Up ─────────────────────────────────────────────
  const handleSignUp = useCallback(async (email: string, password: string, name: string, institutionId?: string) => {
    try {
      const res = await apiSignUp(email, password, name, institutionId);
      if (res.success && res.data) {
        setUser(res.data.user);
        setMemberships(res.data.memberships);
        setAccessToken(res.data.access_token);
        restoreActiveMembership(res.data.memberships);
        setStatus('authenticated');
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Sign up failed' };
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : 'Connection error';
      console.error('[AuthContext] Sign up error:', err);
      return { success: false, error: msg };
    }
  }, [restoreActiveMembership]);

  // ── Sign Out ────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
    setMemberships([]);
    setAccessToken(null);
    setActiveMembershipState(null);
    setStatus('unauthenticated');
  }, []);

  // ── Set Active Membership ───────────────────────────────
  const setActiveMembership = useCallback((m: Membership) => {
    setActiveMembershipState(m);
    localStorage.setItem('axon_active_membership', JSON.stringify(m));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        memberships,
        activeMembership,
        setActiveMembership,
        accessToken,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}