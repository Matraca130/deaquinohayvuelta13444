import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Course, Topic, courses as staticCourses } from '@/app/data/courses';
import { useStudentCurriculum } from '@/app/context/StudentCurriculumContext';

// @refresh reset

// ── View ↔ Route mapping ─────────────────────────────────────
// The single source of truth for how viewType strings map to URL slugs.
// Views call `setActiveView('flashcards')` → navigate('/student/flashcards').
// The URL path `/student/flashcards` → activeView resolves to 'flashcards'.
//
// To ADD a new view:
//   1. Add the slug to ViewType
//   2. Add an entry here (only if slug !== viewType)
//   3. Add the route in routes.tsx

export type ViewType =
  | 'home'
  | 'study-hub'
  | 'study'
  | 'flashcards'
  | 'progress';

export type ThemeType = 'dark' | 'light';

/** viewType → URL slug (only entries that differ from the viewType itself) */
const VIEW_TO_SLUG: Partial<Record<string, string>> = {
  home: '',                       // index route
};

/** URL slug → viewType (only entries that differ from the slug itself) */
const SLUG_TO_VIEW: Record<string, ViewType> = {
  '': 'home',                    // index route
};

function viewToPath(view: string): string {
  const slug = VIEW_TO_SLUG[view] ?? view;
  return slug ? `/student/${slug}` : '/student';
}

function pathToView(pathname: string): ViewType {
  // Extract the slug after /student/
  const match = pathname.match(/^\/student\/?(.*)$/);
  const slug = match?.[1]?.split('/')[0] ?? '';
  return (SLUG_TO_VIEW[slug] ?? (slug || 'home')) as ViewType;
}

// ── Types ────────────────────────────────────────────────────

export interface StudyPlanTask {
  id: string;
  date: Date;
  title: string;
  subject: string;
  subjectColor: string;
  method: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  name: string;
  subjects: { id: string; name: string; color: string }[];
  methods: string[];
  selectedTopics: { courseId: string; courseName: string; sectionTitle: string; topicTitle: string; topicId: string }[];
  completionDate: Date;
  weeklyHours: number[]; // [mon, tue, wed, thu, fri, sat, sun]
  tasks: StudyPlanTask[];
  createdAt: Date;
  totalEstimatedHours: number;
}

interface AppContextType {
  currentCourse: Course;
  setCurrentCourse: (course: Course) => void;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic) => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  isStudySessionActive: boolean;
  setStudySessionActive: (active: boolean) => void;
  studyPlans: StudyPlan[];
  addStudyPlan: (plan: StudyPlan) => void;
  toggleTaskComplete: (planId: string, taskId: string) => void;
  quizAutoStart: boolean;
  setQuizAutoStart: (v: boolean) => void;
  flashcardAutoStart: boolean;
  setFlashcardAutoStart: (v: boolean) => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  /** Expose available courses for CourseSwitcher and other consumers */
  availableCourses: Course[];
  curriculumLoading: boolean;
}

const noop = () => {};

const defaultContextValue: AppContextType = {
  currentCourse: staticCourses[0],
  setCurrentCourse: noop,
  currentTopic: staticCourses[0].semesters[0].sections[0].topics[0],
  setCurrentTopic: noop,
  activeView: 'home',
  setActiveView: noop,
  isSidebarOpen: true,
  setSidebarOpen: noop,
  isStudySessionActive: false,
  setStudySessionActive: noop,
  studyPlans: [],
  addStudyPlan: noop,
  toggleTaskComplete: noop,
  quizAutoStart: false,
  setQuizAutoStart: noop,
  flashcardAutoStart: false,
  setFlashcardAutoStart: noop,
  theme: 'light',
  setTheme: noop,
  availableCourses: staticCourses,
  curriculumLoading: false,
};

const AppContext = createContext<AppContextType>(defaultContextValue);

// ── Provider ─────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Real curriculum from backend (provided by StudentCurriculumProvider above us) ──
  const { realCourses, loading: curriculumLoading, loadCourseTree, courseTreeCache } = useStudentCurriculum();

  // Decide which course list to use: real data if available, otherwise static fallback
  const availableCourses = realCourses.length > 0 ? realCourses : staticCourses;

  // activeView is DERIVED from the URL — single source of truth
  const activeView = useMemo(() => pathToView(location.pathname), [location.pathname]);

  // setActiveView is a BRIDGE: old views call it, we translate to navigate()
  const setActiveView = useCallback((view: ViewType) => {
    const target = viewToPath(view as string);
    navigate(target);
  }, [navigate]);

  const [currentCourse, setCurrentCourseState] = useState<Course>(staticCourses[0]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(
    staticCourses[0]?.semesters?.[0]?.sections?.[0]?.topics?.[0] || null
  );
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isStudySessionActive, setStudySessionActive] = useState(false);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [quizAutoStart, setQuizAutoStart] = useState(false);
  const [flashcardAutoStart, setFlashcardAutoStart] = useState(false);
  const [theme, setTheme] = useState<ThemeType>('light');
  const [hasInitFromReal, setHasInitFromReal] = useState(false);

  // ── When real courses arrive, switch to the first real course ──
  useEffect(() => {
    if (realCourses.length > 0 && !hasInitFromReal) {
      const first = realCourses[0];
      console.log(`[AppContext] Real courses available (${realCourses.length}). Switching to: "${first.name}"`);
      setCurrentCourseState(first);
      setHasInitFromReal(true);

      // Select first topic if tree is loaded
      const firstTopic = first.semesters?.[0]?.sections?.[0]?.topics?.[0];
      if (firstTopic) {
        setCurrentTopic(firstTopic);
      } else {
        setCurrentTopic(null);
      }
    }
  }, [realCourses, hasInitFromReal]);

  // ── When a cached tree gets updated, sync currentCourse ──
  useEffect(() => {
    const cached = courseTreeCache[currentCourse.id];
    if (cached && cached.semesters.length > 0 && currentCourse.semesters.length === 0) {
      console.log(`[AppContext] Tree loaded for "${cached.name}", updating currentCourse`);
      setCurrentCourseState(cached);
      // Select first topic
      const firstTopic = cached.semesters?.[0]?.sections?.[0]?.topics?.[0];
      if (firstTopic && !currentTopic) {
        setCurrentTopic(firstTopic);
      }
    }
  }, [courseTreeCache, currentCourse.id]);

  // ── setCurrentCourse: trigger tree load if needed ──
  const setCurrentCourse = useCallback((course: Course) => {
    setCurrentCourseState(course);
    setCurrentTopic(null);

    // If this course's tree isn't loaded yet, load it
    if (course.semesters.length === 0) {
      loadCourseTree(course.id).then(fullCourse => {
        if (fullCourse) {
          setCurrentCourseState(fullCourse);
          const firstTopic = fullCourse.semesters?.[0]?.sections?.[0]?.topics?.[0];
          if (firstTopic) {
            setCurrentTopic(firstTopic);
          }
        }
      });
    } else {
      const firstTopic = course.semesters?.[0]?.sections?.[0]?.topics?.[0];
      if (firstTopic) {
        setCurrentTopic(firstTopic);
      }
    }
  }, [loadCourseTree]);

  const addStudyPlan = useCallback((plan: StudyPlan) => {
    setStudyPlans(prev => [...prev, plan]);
  }, []);

  const toggleTaskComplete = useCallback((planId: string, taskId: string) => {
    setStudyPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        tasks: plan.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      };
    }));
  }, []);

  const value = useMemo<AppContextType>(() => ({
    currentCourse,
    setCurrentCourse,
    currentTopic,
    setCurrentTopic,
    activeView,
    setActiveView,
    isSidebarOpen,
    setSidebarOpen,
    isStudySessionActive,
    setStudySessionActive,
    studyPlans,
    addStudyPlan,
    toggleTaskComplete,
    quizAutoStart,
    setQuizAutoStart,
    flashcardAutoStart,
    setFlashcardAutoStart,
    theme,
    setTheme,
    /** Expose available courses for CourseSwitcher and other consumers */
    availableCourses,
    curriculumLoading,
  }), [
    currentCourse, setCurrentCourse, currentTopic, activeView, setActiveView,
    isSidebarOpen, isStudySessionActive, studyPlans, addStudyPlan,
    toggleTaskComplete, quizAutoStart, flashcardAutoStart, theme,
    availableCourses, curriculumLoading,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}