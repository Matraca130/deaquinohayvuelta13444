// ============================================================
// Axon — useHierarchyNav hook
// Manages navigation state + data loading for the
// Course → Semester → Section → Topic → Summary → Flashcards
// hierarchy used in the professor flashcards page.
//
// Engineering fixes applied:
//   C3 — cache Map for back-navigation (avoids redundant fetches)
//   R1 — request counter to ignore stale responses (race protection)
//   D7 — safe error extraction via getErrorMessage
//   C2 — wrap fetchLevel in useCallback for stable deps
//   R3 — AbortController to cancel in-flight requests on unmount
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getErrorMessage, isAbortError } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import * as api from '@/app/services/flashcardApi';
import type {
  CourseItem, SemesterItem, SectionItem, TopicItem, SummaryItem,
  Flashcard, KeywordItem,
} from '@/app/services/flashcardApi';

// ── Types ─────────────────────────────────────────────────

export type BrowseLevel = 'courses' | 'semesters' | 'sections' | 'topics' | 'summaries' | 'flashcards';

export interface BreadcrumbItem {
  label: string;
  level: BrowseLevel;
  id?: string;
}

// ── Hook ──────────────────────────────────────────────────

export function useHierarchyNav() {
  const { activeMembership, accessToken } = useAuth();
  const institutionId = activeMembership?.institution_id;

  // Navigation
  const [level, setLevel] = useState<BrowseLevel>('courses');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'Cursos', level: 'courses' },
  ]);

  // Selected IDs
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);

  // Data
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // R1 — request counter: only apply results if counter matches
  const requestIdRef = useRef(0);

  // C3 — cache for back-navigation (read-only hierarchy levels only)
  const cacheRef = useRef(new Map<string, unknown>());

  // R3 — AbortController ref for cancelling in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  // ── C2 fix — Generic level fetcher with race-protection + cache ──
  // Wrapped in useCallback with stable deps (refs + state setters are stable)

  const fetchLevel = useCallback(async function <T>(
    cacheKey: string,
    fetcher: (signal: AbortSignal) => Promise<{ items: T[] }>,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    useCache: boolean = false,
  ) {
    // C3 — serve from cache if available
    if (useCache) {
      const cached = cacheRef.current.get(cacheKey) as T[] | undefined;
      if (cached) {
        setter(cached);
        return;
      }
    }

    // R3 — abort previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const id = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await fetcher(controller.signal);
      if (id !== requestIdRef.current) return; // R1 — stale, discard
      const items = res.items || [];
      cacheRef.current.set(cacheKey, items); // C3 — populate cache
      setter(items);
    } catch (err) {
      if (isAbortError(err)) return; // R3 — request cancelled, ignore
      if (id !== requestIdRef.current) return;
      setError(getErrorMessage(err));
      logger.error('Error fetching level:', err);
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, []);

  // ── Specialized loader for flashcards level (parallel fetch) ──

  const fetchFlashcardsLevel = useCallback(async (summaryId: string) => {
    // No cache for flashcards level — subject to CRUD mutations
    // R3 — abort previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const id = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const [flashRes, kwRes] = await Promise.all([
        api.getFlashcards(summaryId, undefined, { signal: controller.signal }),
        api.getKeywords(summaryId, { signal: controller.signal }),
      ]);
      if (id !== requestIdRef.current) return;
      setFlashcards(flashRes.items || []);
      setKeywords(kwRes.items || []);
    } catch (err) {
      if (isAbortError(err)) return; // R3 — request cancelled, ignore
      if (id !== requestIdRef.current) return;
      setError(getErrorMessage(err));
      logger.error('Error fetching flashcards:', err);
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, []);

  // ── Convenience loaders ─────────────────────────────────

  const loadCourses = useCallback((useCache = false) => {
    fetchLevel(`courses:${institutionId}`, (signal) => api.getCourses(institutionId, { signal }), setCourses, useCache);
  }, [institutionId, fetchLevel]);

  const loadSemesters = useCallback((courseId: string, useCache = false) => {
    fetchLevel(`semesters:${courseId}`, (signal) => api.getSemesters(courseId, { signal }), setSemesters, useCache);
  }, [fetchLevel]);

  const loadSections = useCallback((semesterId: string, useCache = false) => {
    fetchLevel(`sections:${semesterId}`, (signal) => api.getSections(semesterId, { signal }), setSections, useCache);
  }, [fetchLevel]);

  const loadTopics = useCallback((sectionId: string, useCache = false) => {
    fetchLevel(`topics:${sectionId}`, (signal) => api.getTopics(sectionId, { signal }), setTopics, useCache);
  }, [fetchLevel]);

  const loadSummaries = useCallback((topicId: string, useCache = false) => {
    fetchLevel(`summaries:${topicId}`, (signal) => api.getSummaries(topicId, { signal }), setSummaries, useCache);
  }, [fetchLevel]);

  const loadFlashcards = useCallback((summaryId: string) => {
    fetchFlashcardsLevel(summaryId);
  }, [fetchFlashcardsLevel]);

  // Initial load
  useEffect(() => {
    if (!accessToken) return;
    loadCourses();
    // R3 — abort in-flight request on unmount
    return () => { abortRef.current?.abort(); };
  }, [loadCourses, accessToken]);

  // ── Navigation ──────────────────────────────────────────

  const navigateTo = (newLevel: BrowseLevel, label: string, id?: string) => {
    setLevel(newLevel);
    setBreadcrumbs(prev => [...prev, { label, level: newLevel, id }]);
    setSearchTerm('');
  };

  const navigateBack = (targetLevel: BrowseLevel) => {
    const idx = breadcrumbs.findIndex(b => b.level === targetLevel);
    if (idx >= 0) {
      setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
      setLevel(targetLevel);
      setSearchTerm('');

      // C3 — re-load with cache (instant if previously visited)
      if (targetLevel === 'courses') loadCourses(true);
      else if (targetLevel === 'semesters' && selectedCourseId) loadSemesters(selectedCourseId, true);
      else if (targetLevel === 'sections' && selectedSemesterId) loadSections(selectedSemesterId, true);
      else if (targetLevel === 'topics' && selectedSectionId) loadTopics(selectedSectionId, true);
      else if (targetLevel === 'summaries' && selectedTopicId) loadSummaries(selectedTopicId, true);
      else if (targetLevel === 'flashcards' && selectedSummaryId) loadFlashcards(selectedSummaryId);
    }
  };

  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourseId(course.id);
    navigateTo('semesters', course.name, course.id);
    loadSemesters(course.id);
  };

  const handleSelectSemester = (sem: SemesterItem) => {
    setSelectedSemesterId(sem.id);
    navigateTo('sections', sem.name, sem.id);
    loadSections(sem.id);
  };

  const handleSelectSection = (sec: SectionItem) => {
    setSelectedSectionId(sec.id);
    navigateTo('topics', sec.name, sec.id);
    loadTopics(sec.id);
  };

  const handleSelectTopic = (topic: TopicItem) => {
    setSelectedTopicId(topic.id);
    navigateTo('summaries', topic.name, topic.id);
    loadSummaries(topic.id);
  };

  const handleSelectSummary = (summary: SummaryItem) => {
    setSelectedSummaryId(summary.id);
    navigateTo('flashcards', summary.title, summary.id);
    loadFlashcards(summary.id);
  };

  return {
    // Navigation
    level,
    breadcrumbs,
    navigateBack,

    // Data
    courses,
    semesters,
    sections,
    topics,
    summaries,
    flashcards,
    keywords,
    selectedSummaryId,

    // Flashcard state mutators (for CRUD updates)
    setFlashcards,

    // UI
    loading,
    error,
    setError,
    searchTerm,
    setSearchTerm,

    // Selection handlers
    handleSelectCourse,
    handleSelectSemester,
    handleSelectSection,
    handleSelectTopic,
    handleSelectSummary,
  };
}