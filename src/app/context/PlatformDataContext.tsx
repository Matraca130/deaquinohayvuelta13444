// ============================================================
// Axon — Platform Data Context (FOCUSED)
//
// Provides cached data for professor curriculum page.
// Reads activeMembership from AuthContext to know which
// institution to load data for.
//
// DATA SLICES: institution, courses
// REFRESH: refresh(), refreshInstitution(), refreshCourses()
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import * as api from '@/app/services/platformApi';
import type {
  Institution,
  Course,
} from '@/app/types/platform';

// ── State shape ───────────────────────────────────────────

interface PlatformDataState {
  institution: Institution | null;
  courses: Course[];
}

interface PlatformDataContextType extends PlatformDataState {
  loading: boolean;
  error: string | null;
  institutionId: string | null;

  refresh: () => Promise<void>;
  refreshInstitution: () => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const PlatformDataContext = createContext<PlatformDataContextType>({
  institution: null,
  courses: [],
  loading: true,
  error: null,
  institutionId: null,
  refresh: async () => {},
  refreshInstitution: async () => {},
  refreshCourses: async () => {},
});

// ── Provider ──────────────────────────────────────────────

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const { activeMembership, status } = useAuth();
  const institutionId = activeMembership?.institution_id || null;
  const lastInstId = useRef<string | null>(null);

  const [data, setData] = useState<PlatformDataState>({
    institution: null,
    courses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all platform data ─────────────────────────────
  const fetchAll = useCallback(async (instId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [institution, courses] =
        await Promise.allSettled([
          api.getInstitution(instId),
          api.getCourses(instId),
        ]);

      setData({
        institution: institution.status === 'fulfilled' ? institution.value : null,
        courses: courses.status === 'fulfilled' ? (courses.value as any)?.items || courses.value || [] : [],
      });
      setLoading(false);
    } catch (err: any) {
      console.error('[PlatformDataContext] fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // ── Individual refresh functions ────────────────────────
  const refreshInstitution = useCallback(async () => {
    if (!institutionId) return;
    try {
      const institution = await api.getInstitution(institutionId);
      setData(prev => ({ ...prev, institution }));
    } catch (err: any) {
      console.error('[PlatformDataContext] refreshInstitution error:', err);
    }
  }, [institutionId]);

  const refreshCourses = useCallback(async () => {
    if (!institutionId) return;
    try {
      const result = await api.getCourses(institutionId);
      const courses = (result as any)?.items || result || [];
      setData(prev => ({ ...prev, courses }));
    } catch (err: any) {
      console.error('[PlatformDataContext] refreshCourses error:', err);
    }
  }, [institutionId]);

  // ── Auto-load when institution changes ──────────────────
  useEffect(() => {
    if (status === 'loading') return;
    if (!institutionId) {
      setLoading(false);
      return;
    }

    // Reset if institution changed
    if (lastInstId.current !== institutionId) {
      setData({
        institution: null,
        courses: [],
      });
      lastInstId.current = institutionId;
    }

    fetchAll(institutionId);
  }, [fetchAll, institutionId, status]);

  return (
    <PlatformDataContext.Provider
      value={{
        ...data,
        loading,
        error,
        institutionId,
        refresh: async () => { if (institutionId) await fetchAll(institutionId); },
        refreshInstitution,
        refreshCourses,
      }}
    >
      {children}
    </PlatformDataContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function usePlatformData() {
  return useContext(PlatformDataContext);
}
