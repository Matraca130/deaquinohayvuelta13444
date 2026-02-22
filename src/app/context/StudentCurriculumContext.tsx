// ============================================================
// Axon — Student Curriculum Context
//
// Fetches the REAL curriculum tree from the backend and maps it
// into the same nested shape that courses.ts provides, so that
// StudyHubView, TopicSidebar, CourseSwitcher, etc. work without
// changes.
//
// Data flow:
//   1. GET /courses?institution_id=xxx        → flat course list
//   2. GET /semesters?course_id=xxx           → per-course
//   3. GET /sections?semester_id=xxx          → per-semester
//   4. GET /topics?section_id=xxx             → per-section
//   5. Assemble nested Course[] tree
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import * as api from '@/app/services/platformApi';
import type {
  Course as RealCourse,
  Semester as RealSemester,
  Section as RealSection,
  Topic as RealTopic,
} from '@/app/types/platform';

import type {
  Course as UICourse,
  Semester as UISemester,
  Section as UISection,
  Topic as UITopic,
} from '@/app/data/courses';

// ── Constants ─────────────────────────────────────────────

const COURSE_COLORS = [
  { color: 'bg-teal-500',    accentColor: 'text-teal-500' },
  { color: 'bg-rose-400',    accentColor: 'text-rose-400' },
  { color: 'bg-indigo-500',  accentColor: 'text-indigo-500' },
  { color: 'bg-amber-500',   accentColor: 'text-amber-500' },
  { color: 'bg-emerald-500', accentColor: 'text-emerald-500' },
  { color: 'bg-purple-500',  accentColor: 'text-purple-500' },
  { color: 'bg-sky-500',     accentColor: 'text-sky-500' },
  { color: 'bg-orange-500',  accentColor: 'text-orange-500' },
];

// ── Pure helpers (outside component — no re-creation) ─────

function unwrapItems<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  return [];
}

function filterAndSort<T extends { is_active?: boolean; order_index?: number }>(items: T[]): T[] {
  return items
    .filter(x => x.is_active !== false)
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
}

function mapTopic(t: RealTopic): UITopic {
  return { id: t.id, title: t.name, summary: '' };
}

function mapSection(s: RealSection, topics: RealTopic[]): UISection {
  return { id: s.id, title: s.name, topics: filterAndSort(topics).map(mapTopic) };
}

function mapSemester(sem: RealSemester, sections: UISection[]): UISemester {
  return { id: sem.id, title: sem.name, sections };
}

function mapCourse(c: RealCourse, index: number, semesters: UISemester[] = []): UICourse {
  const palette = COURSE_COLORS[index % COURSE_COLORS.length];
  return { id: c.id, name: c.name, color: palette.color, accentColor: palette.accentColor, semesters };
}

// ── Single tree-fetching logic (no duplicates) ────────────

async function fetchCourseTree(courseId: string): Promise<{
  semesters: UISemester[];
  stats: { semesters: number; sections: number; topics: number };
}> {
  // 1. Semesters
  const semRaw = await api.getSemesters(courseId, { limit: 100 });
  const semesters = filterAndSort(unwrapItems<RealSemester>(semRaw));

  // 2. Sections (parallel per semester)
  const sectionsBySemester = await Promise.all(
    semesters.map(async (sem) => ({
      semesterId: sem.id,
      sections: filterAndSort(unwrapItems<RealSection>(
        await api.getSections(sem.id, { limit: 100 })
      )),
    }))
  );

  // 3. Topics (parallel per section)
  const allSections = sectionsBySemester.flatMap(s => s.sections);
  const topicsBySection = await Promise.all(
    allSections.map(async (sec) => ({
      sectionId: sec.id,
      topics: filterAndSort(unwrapItems<RealTopic>(
        await api.getTopics(sec.id, { limit: 100 })
      )),
    }))
  );

  // 4. Assemble
  const topicMap = new Map(topicsBySection.map(t => [t.sectionId, t.topics]));
  const sectionMap = new Map(sectionsBySemester.map(s => [s.semesterId, s.sections]));

  const uiSemesters: UISemester[] = semesters.map(sem => {
    const rawSections = sectionMap.get(sem.id) || [];
    const uiSections = rawSections.map(sec => mapSection(sec, topicMap.get(sec.id) || []));
    return mapSemester(sem, uiSections);
  });

  const totalSections = sectionsBySemester.reduce((sum, s) => sum + s.sections.length, 0);
  const totalTopics = topicsBySection.reduce((sum, t) => sum + t.topics.length, 0);

  return {
    semesters: uiSemesters,
    stats: { semesters: semesters.length, sections: totalSections, topics: totalTopics },
  };
}

// ── Context type ──────────────────────────────────────────

interface StudentCurriculumContextType {
  realCourses: UICourse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadCourseTree: (courseId: string) => Promise<UICourse | null>;
  courseTreeCache: Record<string, UICourse>;
}

const StudentCurriculumContext = createContext<StudentCurriculumContextType>({
  realCourses: [],
  loading: true,
  error: null,
  refresh: async () => {},
  loadCourseTree: async () => null,
  courseTreeCache: {},
});

// ── Provider ──────────────────────────────────────────────

export function StudentCurriculumProvider({ children }: { children: ReactNode }) {
  const { activeMembership, status } = useAuth();
  const institutionId = activeMembership?.institution_id || null;

  const [realCourses, setRealCourses] = useState<UICourse[]>([]);
  const [courseTreeCache, setCourseTreeCache] = useState<Record<string, UICourse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastInstId = useRef<string | null>(null);

  // ── Build a full UICourse from a base course + fetched tree ──

  const buildFullCourse = useCallback(
    (courseId: string, semesters: UISemester[], courseList: UICourse[]): UICourse => {
      const base = courseList.find(c => c.id === courseId);
      return {
        id: courseId,
        name: base?.name || 'Curso',
        color: base?.color || COURSE_COLORS[0].color,
        accentColor: base?.accentColor || COURSE_COLORS[0].accentColor,
        semesters,
      };
    },
    []
  );

  // ── Load course list (flat, no children) ────────────────

  const loadCourseList = useCallback(async (instId: string): Promise<UICourse[]> => {
    console.log(`[StudentCurriculum] Loading courses for institution ${instId}`);
    const raw = await api.getCourses(instId, { limit: 50 });
    const items = filterAndSort(unwrapItems<RealCourse>(raw));
    console.log(`[StudentCurriculum] Found ${items.length} courses`);
    return items.map((c, i) => mapCourse(c, i));
  }, []);

  // ── Load full tree for one course (with cache) ──────────

  const loadCourseTree = useCallback(async (courseId: string): Promise<UICourse | null> => {
    if (courseTreeCache[courseId]) {
      return courseTreeCache[courseId];
    }

    console.log(`[StudentCurriculum] Loading tree for course ${courseId}`);
    try {
      const { semesters, stats } = await fetchCourseTree(courseId);
      console.log(`[StudentCurriculum]   ${stats.semesters} sem / ${stats.sections} sec / ${stats.topics} topics`);

      const fullCourse = buildFullCourse(courseId, semesters, realCourses);
      setCourseTreeCache(prev => ({ ...prev, [courseId]: fullCourse }));
      return fullCourse;
    } catch (err: any) {
      console.error(`[StudentCurriculum] Tree load failed for ${courseId}:`, err?.message);
      return null;
    }
  }, [courseTreeCache, realCourses, buildFullCourse]);

  // ── Initial load + auto-load first course tree ──────────

  const refresh = useCallback(async () => {
    if (!institutionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const courses = await loadCourseList(institutionId);
      setRealCourses(courses);

      // Auto-load tree for first course
      if (courses.length > 0) {
        const { semesters, stats } = await fetchCourseTree(courses[0].id);
        console.log(`[StudentCurriculum] First course tree: ${stats.semesters} sem / ${stats.sections} sec / ${stats.topics} topics`);

        const fullFirst = buildFullCourse(courses[0].id, semesters, courses);
        setCourseTreeCache(prev => ({ ...prev, [courses[0].id]: fullFirst }));

        // Replace the shell course with the full one
        setRealCourses(prev => prev.map(c => c.id === fullFirst.id ? fullFirst : c));
      }

      setLoading(false);
    } catch (err: any) {
      console.error('[StudentCurriculum] Initial load failed:', err?.message);
      setError(err?.message || 'Falha ao carregar curriculum');
      setLoading(false);
    }
  }, [institutionId, loadCourseList, buildFullCourse]);

  // ── Trigger on institution change ───────────────────────

  useEffect(() => {
    if (status === 'loading') return;
    if (!institutionId) { setLoading(false); return; }
    if (lastInstId.current === institutionId) return;
    lastInstId.current = institutionId;
    setCourseTreeCache({});
    refresh();
  }, [institutionId, status, refresh]);

  return (
    <StudentCurriculumContext.Provider
      value={{ realCourses, loading, error, refresh, loadCourseTree, courseTreeCache }}
    >
      {children}
    </StudentCurriculumContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useStudentCurriculum() {
  return useContext(StudentCurriculumContext);
}
