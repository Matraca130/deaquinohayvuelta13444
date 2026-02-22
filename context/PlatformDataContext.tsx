// ============================================================
// Axon — Platform Data Context (FOCUSED + BACKWARD COMPAT)
//
// Provides cached data for professor curriculum page.
// Reads activeMembership from AuthContext to know which
// institution to load data for.
//
// BACKWARD COMPAT: Also provides members, plans, subscription,
// dashboardStats, inviteMember, etc. for Owner/Admin pages.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/platformApi';
import type {
  Institution,
  Course,
  MemberListItem,
  InstitutionPlan,
  InstitutionSubscription,
  InstitutionDashboardStats,
  CreateMemberPayload,
  MembershipRole,
} from '@/types/platform';

// ── State shape ────────────────────────────────────────

interface PlatformDataContextType {
  // Core (Professor)
  institution: Institution | null;
  courses: Course[];
  loading: boolean;
  error: string | null;
  institutionId: string | null;
  refresh: () => Promise<void>;
  refreshInstitution: () => Promise<void>;
  refreshCourses: () => Promise<void>;

  // Backward compat (Owner/Admin)
  members: MemberListItem[];
  plans: InstitutionPlan[];
  subscription: InstitutionSubscription | null;
  dashboardStats: InstitutionDashboardStats | null;
  refreshMembers: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  refreshStats: () => Promise<void>;
  inviteMember: (data: CreateMemberPayload) => Promise<MemberListItem>;
  removeMember: (memberId: string) => Promise<void>;
  toggleMember: (memberId: string, active: boolean) => Promise<void>;
  changeRole: (memberId: string, role: MembershipRole) => Promise<void>;
}

const noop = async () => {};

const PlatformDataContext = createContext<PlatformDataContextType>({
  institution: null,
  courses: [],
  loading: true,
  error: null,
  institutionId: null,
  refresh: noop,
  refreshInstitution: noop,
  refreshCourses: noop,
  members: [],
  plans: [],
  subscription: null,
  dashboardStats: null,
  refreshMembers: noop,
  refreshPlans: noop,
  refreshStats: noop,
  inviteMember: async () => ({} as MemberListItem),
  removeMember: noop,
  toggleMember: noop,
  changeRole: noop,
});

// ── Provider ──────────────────────────────────────────

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const { activeMembership, status } = useAuth();
  const institutionId = activeMembership?.institution_id || null;
  const lastInstId = useRef<string | null>(null);

  // Core state
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Backward compat state
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [plans, setPlans] = useState<InstitutionPlan[]>([]);
  const [subscription, setSubscription] = useState<InstitutionSubscription | null>(null);
  const [dashboardStats, setDashboardStats] = useState<InstitutionDashboardStats | null>(null);

  // ── Core fetch ───────────────────────────────────────
  const fetchAll = useCallback(async (instId: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.getInstitution(instId),
        api.getCourses(instId),
        api.getMembers(instId),
        api.getInstitutionPlans(instId),
        api.getInstitutionSubscription(instId),
        api.getInstitutionDashboardStats(instId),
      ]);

      const [instR, coursesR, membersR, plansR, subR, statsR] = results;

      setInstitution(instR.status === 'fulfilled' ? instR.value : null);
      setCourses(coursesR.status === 'fulfilled' ? (coursesR.value as any)?.items || coursesR.value || [] : []);
      setMembers(membersR.status === 'fulfilled' ? (Array.isArray(membersR.value) ? membersR.value : []) : []);
      setPlans(plansR.status === 'fulfilled' ? (Array.isArray(plansR.value) ? plansR.value : []) : []);
      setSubscription(subR.status === 'fulfilled' ? subR.value : null);
      setDashboardStats(statsR.status === 'fulfilled' ? statsR.value : null);

      setLoading(false);
    } catch (err: any) {
      console.error('[PlatformDataContext] fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // ── Individual refreshes ─────────────────────────────
  const refreshInstitution = useCallback(async () => {
    if (!institutionId) return;
    try { setInstitution(await api.getInstitution(institutionId)); } catch (e: any) { console.error('[PlatformDataContext]', e); }
  }, [institutionId]);

  const refreshCourses = useCallback(async () => {
    if (!institutionId) return;
    try {
      const result = await api.getCourses(institutionId);
      setCourses((result as any)?.items || result || []);
    } catch (e: any) { console.error('[PlatformDataContext]', e); }
  }, [institutionId]);

  const refreshMembers = useCallback(async () => {
    if (!institutionId) return;
    try {
      const result = await api.getMembers(institutionId);
      setMembers(Array.isArray(result) ? result : []);
    } catch (e: any) { console.error('[PlatformDataContext]', e); }
  }, [institutionId]);

  const refreshPlans = useCallback(async () => {
    if (!institutionId) return;
    try {
      const result = await api.getInstitutionPlans(institutionId);
      setPlans(Array.isArray(result) ? result : []);
    } catch (e: any) { console.error('[PlatformDataContext]', e); }
  }, [institutionId]);

  const refreshStats = useCallback(async () => {
    if (!institutionId) return;
    try { setDashboardStats(await api.getInstitutionDashboardStats(institutionId)); } catch (e: any) { console.error('[PlatformDataContext]', e); }
  }, [institutionId]);

  // ── Mutation wrappers (backward compat for Owner pages) ──
  const inviteMember = useCallback(async (data: CreateMemberPayload): Promise<MemberListItem> => {
    const member = await api.createMember(data);
    await refreshMembers();
    return member;
  }, [refreshMembers]);

  const removeMember = useCallback(async (memberId: string) => {
    await api.deleteMember(memberId);
    await refreshMembers();
  }, [refreshMembers]);

  const toggleMember = useCallback(async (memberId: string, active: boolean) => {
    await api.toggleMemberActive(memberId, active);
    await refreshMembers();
  }, [refreshMembers]);

  const changeRole = useCallback(async (memberId: string, role: MembershipRole) => {
    await api.changeMemberRole(memberId, role);
    await refreshMembers();
  }, [refreshMembers]);

  // ── Auto-load when institution changes ──────────────────
  useEffect(() => {
    if (status === 'loading') return;
    if (!institutionId) { setLoading(false); return; }
    if (lastInstId.current !== institutionId) {
      setInstitution(null);
      setCourses([]);
      setMembers([]);
      setPlans([]);
      setSubscription(null);
      setDashboardStats(null);
      lastInstId.current = institutionId;
    }
    fetchAll(institutionId);
  }, [fetchAll, institutionId, status]);

  return (
    <PlatformDataContext.Provider
      value={{
        institution, courses, loading, error, institutionId,
        refresh: async () => { if (institutionId) await fetchAll(institutionId); },
        refreshInstitution, refreshCourses,
        members, plans, subscription, dashboardStats,
        refreshMembers, refreshPlans, refreshStats,
        inviteMember, removeMember, toggleMember, changeRole,
      }}
    >
      {children}
    </PlatformDataContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────

export function usePlatformData() {
  return useContext(PlatformDataContext);
}
