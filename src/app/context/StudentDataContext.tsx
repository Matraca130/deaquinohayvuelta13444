// ============================================================
// Axon — Student Data Context
// Provides student data from Supabase to all views.
// NOW connected to AuthContext — uses real user.id + token.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import * as api from '@/app/services/studentApi';
import { useAuth } from '@/app/context/AuthContext';
import type {
  StudentProfile,
  StudentStats,
  CourseProgress,
  DailyActivity,
  StudySession,
  FlashcardReview,
} from '@/app/types/student';

// @refresh reset

export interface StudentDataState {
  profile: StudentProfile | null;
  stats: StudentStats | null;
  courseProgress: CourseProgress[];
  dailyActivity: DailyActivity[];
  sessions: StudySession[];
  reviews: FlashcardReview[];
}

interface StudentDataContextType extends StudentDataState {
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  /** The resolved student ID being used (real user or fallback) */
  studentId: string | null;
  refresh: () => Promise<void>;
  seedAndLoad: () => Promise<void>;
  updateProfile: (data: Partial<StudentProfile>) => Promise<void>;
  updateStats: (data: Partial<StudentStats>) => Promise<void>;
  logSession: (data: Omit<StudySession, 'studentId'>) => Promise<void>;
  saveReviews: (reviews: FlashcardReview[]) => Promise<void>;
}

const StudentDataContext = createContext<StudentDataContextType>({
  profile: null,
  stats: null,
  courseProgress: [],
  dailyActivity: [],
  sessions: [],
  reviews: [],
  loading: true,
  error: null,
  isConnected: false,
  studentId: null,
  refresh: async () => {},
  seedAndLoad: async () => {},
  updateProfile: async () => {},
  updateStats: async () => {},
  logSession: async () => {},
  saveReviews: async () => {},
});

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  // Resolve: use authenticated user ID, or undefined (studentApi will fallback)
  const userId = user?.id || undefined;

  const [data, setData] = useState<StudentDataState>({
    profile: null,
    stats: null,
    courseProgress: [],
    dailyActivity: [],
    sessions: [],
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [didAutoSeed, setDidAutoSeed] = useState(false);
  // Track which userId we last loaded for, to reset on user change
  const lastLoadedUserId = useRef<string | undefined>(undefined);

  const fetchAll = useCallback(async (sid?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const [profile, stats, courseProgress, dailyActivity, sessions, reviews] =
        await Promise.allSettled([
          api.getProfile(sid),
          api.getStats(sid),
          api.getAllCourseProgress(sid),
          api.getDailyActivity(sid),
          api.getSessions(sid),
          api.getReviews(sid),
        ]);

      const profileVal = profile.status === 'fulfilled' ? profile.value : null;

      setData({
        profile: profileVal,
        stats: stats.status === 'fulfilled' ? stats.value : null,
        courseProgress: courseProgress.status === 'fulfilled' ? courseProgress.value : [],
        dailyActivity: dailyActivity.status === 'fulfilled' ? dailyActivity.value : [],
        sessions: sessions.status === 'fulfilled' ? sessions.value : [],
        reviews: reviews.status === 'fulfilled' ? reviews.value : [],
      });

      setLoading(false);
      return !!profileVal; // true if data exists
    } catch (err: any) {
      console.error('[StudentDataContext] fetch error:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, []);

  const seedAndLoad = useCallback(async () => {
    setLoading(true);
    try {
      await api.seedDemoData(userId);
      await fetchAll(userId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [fetchAll, userId]);

  const updateProfileFn = useCallback(async (updates: Partial<StudentProfile>) => {
    try {
      const updated = await api.updateProfile(updates, userId);
      setData(prev => ({ ...prev, profile: { ...prev.profile!, ...updated } }));
    } catch (err: any) {
      console.error('[StudentDataContext] updateProfile error:', err);
    }
  }, [userId]);

  const updateStatsFn = useCallback(async (updates: Partial<StudentStats>) => {
    try {
      const updated = await api.updateStats(updates, userId);
      setData(prev => ({ ...prev, stats: { ...prev.stats!, ...updated } }));
    } catch (err: any) {
      console.error('[StudentDataContext] updateStats error:', err);
    }
  }, [userId]);

  const logSessionFn = useCallback(async (session: Omit<StudySession, 'studentId'>) => {
    try {
      const created = await api.logSession(session, userId);
      setData(prev => ({ ...prev, sessions: [created, ...prev.sessions] }));
    } catch (err: any) {
      console.error('[StudentDataContext] logSession error:', err);
    }
  }, [userId]);

  const saveReviewsFn = useCallback(async (reviews: FlashcardReview[]) => {
    try {
      await api.saveReviews(reviews, userId);
      setData(prev => ({
        ...prev,
        reviews: [
          ...reviews,
          ...prev.reviews.filter(r =>
            !reviews.some(nr => nr.cardId === r.cardId && nr.topicId === r.topicId && nr.courseId === r.courseId)
          ),
        ],
      }));
    } catch (err: any) {
      console.error('[StudentDataContext] saveReviews error:', err);
    }
  }, [userId]);

  // Auto-load when authenticated user changes (or on mount)
  useEffect(() => {
    // Don't fetch until auth is resolved
    if (status === 'loading') return;

    let cancelled = false;

    // If user changed, reset state and seed flag
    if (lastLoadedUserId.current !== userId) {
      setData({
        profile: null,
        stats: null,
        courseProgress: [],
        dailyActivity: [],
        sessions: [],
        reviews: [],
      });
      setDidAutoSeed(false);
      lastLoadedUserId.current = userId;
    }

    async function init() {
      console.log(`[StudentDataContext] Loading data for user: ${userId || 'anonymous (fallback)'}`);
      const hasData = await fetchAll(userId);
      if (!hasData && !cancelled && !didAutoSeed) {
        // No student data in DB — auto-seed demo data
        setDidAutoSeed(true);
        try {
          console.log(`[StudentDataContext] No data found, auto-seeding for: ${userId || 'demo'}`);
          await api.seedDemoData(userId);
          await fetchAll(userId);
        } catch (err: any) {
          console.warn('[StudentDataContext] auto-seed failed (backend may not be ready yet):', err.message);
          // Don't treat seed failure as a fatal error — the app works fine
          // with empty state. The user can manually retry via seedAndLoad().
          setLoading(false);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, [fetchAll, didAutoSeed, userId, status]);

  const isConnected = !!data.profile;

  return (
    <StudentDataContext.Provider
      value={{
        ...data,
        loading,
        error,
        isConnected,
        studentId: userId || null,
        refresh: async () => { await fetchAll(userId); },
        seedAndLoad,
        updateProfile: updateProfileFn,
        updateStats: updateStatsFn,
        logSession: logSessionFn,
        saveReviews: saveReviewsFn,
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentDataContext() {
  return useContext(StudentDataContext);
}