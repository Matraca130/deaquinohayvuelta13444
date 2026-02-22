// ============================================================
// Axon — Student Flashcard Study (FSRS-powered)
//
// Flow:
// 1. Student picks a course
// 2. System loads flashcards (parallelized hierarchy fetch)
// 3. Student studies: see front → reveal back → grade
// 4. FSRS calculates next review, persists to backend
// ============================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/app/context/AuthContext';
import {
  ChevronLeft, Eye, Trophy,
  Loader2, BookOpen, AlertCircle, Brain,
  ArrowRight, X, CreditCard, CloudOff,
} from 'lucide-react';
import * as api from '@/app/services/flashcardApi';
import type { CourseItem, Flashcard, FSRSStateRecord } from '@/app/services/flashcardApi';
import {
  scheduleReview, createNewFSRSCard,
  type FSRSCard,
} from '@/app/lib/fsrs';
import { getErrorMessage, isAbortError } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { withRetry } from '@/app/lib/retry';

// ── Grade buttons ─────────────────────────────────────────

const GRADES = [
  { value: 0, label: 'Nada', color: 'bg-gray-500 hover:bg-gray-600', desc: 'Blackout total' },
  { value: 1, label: 'Otra vez', color: 'bg-rose-500 hover:bg-rose-600', desc: 'No recorde nada' },
  { value: 2, label: 'Dificil', color: 'bg-orange-500 hover:bg-orange-600', desc: 'Recorde con mucha dificultad' },
  { value: 3, label: 'Bien', color: 'bg-amber-400 hover:bg-amber-500', desc: 'Recorde con esfuerzo' },
  { value: 4, label: 'Facil', color: 'bg-emerald-500 hover:bg-emerald-600', desc: 'Recorde sin dificultad' },
  { value: 5, label: 'Perfecto', color: 'bg-teal-500 hover:bg-teal-600', desc: 'Respuesta instantanea' },
] as const;

// ── Types ─────────────────────────────────────────────────

interface StudyCard {
  flashcard: Flashcard;
  fsrsState: FSRSCard;
}

type Phase = 'course-select' | 'loading-cards' | 'studying' | 'empty' | 'summary';

// ── Parallelized hierarchy fetcher ────────────────────────
// R1 — tracks fetch failures per level so the student knows if cards are missing

async function fetchAllFlashcardsForCourse(
  courseId: string,
  onProgress: (msg: string) => void,
): Promise<{ cards: Flashcard[]; warnings: string[] }> {
  const warnings: string[] = [];

  onProgress('Cargando semestres...');
  const semRes = await api.getSemesters(courseId);
  const semesters = semRes.items || [];
  if (semesters.length === 0) return { cards: [], warnings };

  onProgress(`Cargando secciones de ${semesters.length} semestre(s)...`);
  const sectionResults = await Promise.all(
    semesters.map(sem => api.getSections(sem.id).catch((err) => {
      logger.warn(`[Study] Failed to load sections for semester ${sem.id}:`, err);
      warnings.push(`Semestre "${sem.name}": secciones no cargadas`);
      return { items: [] } as { items: never[] };
    }))
  );
  const allSections = sectionResults.flatMap(r => r.items || []);
  if (allSections.length === 0) return { cards: [], warnings };

  onProgress(`Cargando topicos de ${allSections.length} seccion(es)...`);
  const topicResults = await Promise.all(
    allSections.map(sec => api.getTopics(sec.id).catch((err) => {
      logger.warn(`[Study] Failed to load topics for section ${sec.id}:`, err);
      warnings.push(`Seccion: topicos no cargados`);
      return { items: [] } as { items: never[] };
    }))
  );
  const allTopics = topicResults.flatMap(r => r.items || []);
  if (allTopics.length === 0) return { cards: [], warnings };

  onProgress(`Cargando resumenes de ${allTopics.length} topico(s)...`);
  const summaryResults = await Promise.all(
    allTopics.map(top => api.getSummaries(top.id).catch((err) => {
      logger.warn(`[Study] Failed to load summaries for topic ${top.id}:`, err);
      warnings.push(`Topico: resumenes no cargados`);
      return { items: [] } as { items: never[] };
    }))
  );
  const allSummaries = summaryResults.flatMap(r => r.items || []);
  if (allSummaries.length === 0) return { cards: [], warnings };

  onProgress(`Cargando flashcards de ${allSummaries.length} resumen(es)...`);
  const fcResults = await Promise.all(
    allSummaries.map(sum => api.getFlashcards(sum.id).catch((err) => {
      logger.warn(`[Study] Failed to load flashcards for summary ${sum.id}:`, err);
      warnings.push(`Resumen: flashcards no cargadas`);
      return { items: [] } as { items: never[] };
    }))
  );

  const seen = new Set<string>();
  const flashcards: Flashcard[] = [];
  for (const r of fcResults) {
    for (const fc of (r.items || [])) {
      if (fc.is_active && !seen.has(fc.id)) {
        seen.add(fc.id);
        flashcards.push(fc);
      }
    }
  }

  return { cards: flashcards, warnings };
}

// ── R2 — Paginated FSRS state loader ─────────────────────

async function loadAllFSRSStates(): Promise<FSRSStateRecord[]> {
  const PAGE_SIZE = 500;
  const all: FSRSStateRecord[] = [];
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await api.getFSRSStates({ limit: PAGE_SIZE, offset });
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

// ── Main Component ────────────────────────────────────────

export function FlashcardStudy() {
  const { activeMembership, accessToken } = useAuth();
  const institutionId = activeMembership?.institution_id;

  const [phase, setPhase] = useState<Phase>('course-select');
  const [progressMsg, setProgressMsg] = useState('');

  // Course selection
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // Study session
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [grades, setGrades] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // A3 — Sync tracking for fire-and-forget review persistence
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const pendingSyncsRef = useRef(0);
  const failedSyncsRef = useRef(0);

  // ── Load courses ────────────────────────────────────────

  useEffect(() => {
    if (!accessToken) return; // wait for auth
    // R3 — AbortController to cancel in-flight request on unmount/dep change
    const controller = new AbortController();
    (async () => {
      setLoadingCourses(true);
      try {
        const res = await api.getCourses(institutionId, { signal: controller.signal });
        setCourses(res.items || []);
      } catch (err) {
        if (!isAbortError(err)) setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoadingCourses(false);
      }
    })();
    return () => { controller.abort(); };
  }, [institutionId, accessToken]);

  // ── Load study cards for a course ─────────────────────────

  const loadStudyCards = useCallback(async (course: CourseItem) => {
    setPhase('loading-cards');
    setError(null);
    setProgressMsg('Iniciando...');

    try {
      // 1. Fetch all flashcards (parallelized)
      const { cards: allFlashcards, warnings } = await fetchAllFlashcardsForCourse(
        course.id,
        setProgressMsg,
      );

      // R1 — surface warnings about partially failed hierarchy fetches
      if (warnings.length > 0) {
        setError(`${warnings.length} nivel(es) no cargaron completamente. Algunas cards pueden faltar.`);
        logger.warn('[Study] Hierarchy fetch warnings:', warnings);
      }

      if (allFlashcards.length === 0) {
        setPhase('empty');
        return;
      }

      // 2. Load existing FSRS states
      setProgressMsg('Cargando estados FSRS...');
      let existingStates: FSRSStateRecord[] = [];
      try {
        existingStates = await loadAllFSRSStates();
      } catch {
        // No states yet — all cards are new
      }

      const stateMap = new Map<string, FSRSStateRecord>();
      for (const s of existingStates) {
        stateMap.set(s.flashcard_id, s);
      }

      // 3. Build study cards with FSRS state
      const now = new Date();
      const cards: StudyCard[] = allFlashcards.map(fc => {
        const existing = stateMap.get(fc.id);
        const fsrsState: FSRSCard = existing
          ? {
              flashcard_id: existing.flashcard_id,
              stability: existing.stability,
              difficulty: existing.difficulty,
              due_at: existing.due_at,
              last_review_at: existing.last_review_at,
              reps: existing.reps,
              lapses: existing.lapses,
              state: existing.state,
            }
          : createNewFSRSCard(fc.id);
        return { flashcard: fc, fsrsState };
      });

      // 4. Filter: due cards + new cards (limit new to 20)
      const dueCards = cards.filter(c =>
        c.fsrsState.state !== 'new' && new Date(c.fsrsState.due_at) <= now
      );
      const newCards = cards.filter(c => c.fsrsState.state === 'new').slice(0, 20);
      const sessionCards = [...dueCards, ...newCards];

      if (sessionCards.length === 0) {
        setPhase('empty');
        return;
      }

      // Sort by FSRS priority
      sessionCards.sort((a, b) => {
        if (a.fsrsState.state === 'new' && b.fsrsState.state !== 'new') return 1;
        if (a.fsrsState.state !== 'new' && b.fsrsState.state === 'new') return -1;
        return new Date(a.fsrsState.due_at).getTime() - new Date(b.fsrsState.due_at).getTime();
      });

      // 5. Create study session
      setProgressMsg('Creando sesion...');
      let sid: string | null = null;
      try {
        const session = await api.createStudySession({
          session_type: 'flashcard',
          course_id: course.id,
        });
        sid = session.id;
      } catch {
        // Continue without session tracking
      }

      setStudyCards(sessionCards);
      setCurrentIdx(0);
      setIsRevealed(false);
      setGrades([]);
      setSessionId(sid);
      setSessionStartTime(new Date());
      setPhase('studying');
    } catch (err) {
      setError(getErrorMessage(err) || 'Error al cargar flashcards');
      setPhase('course-select');
    }
  }, []);

  // ── Handle grade ──────────────────────────────────────────

  const handleGrade = useCallback(async (grade: number) => {
    const card = studyCards[currentIdx];
    if (!card) return;

    // Calculate new FSRS params
    const result = scheduleReview(card.fsrsState, grade);

    // Save review + FSRS state (fire-and-forget with A3 sync tracking + R2 retry)
    const sid = sessionId;
    const fcId = card.flashcard.id;
    pendingSyncsRef.current += 1;
    setSyncStatus('syncing');
    (async () => {
      try {
        if (sid) {
          await withRetry(
            () => api.createReview({
              session_id: sid,
              item_id: fcId,
              instrument_type: 'flashcard',
              grade,
            }),
            { maxRetries: 2, label: `review:${fcId}` },
          );
        }
        await withRetry(
          () => api.upsertFSRSState({
            flashcard_id: fcId,
            stability: result.stability,
            difficulty: result.difficulty,
            due_at: result.due_at,
            last_review_at: result.last_review_at,
            reps: result.reps,
            lapses: result.lapses,
            state: result.state,
          }),
          { maxRetries: 2, label: `fsrs:${fcId}` },
        );
      } catch (err) {
        if (!isAbortError(err)) {
          logger.warn('[FlashcardStudy] Failed to persist review:', err);
          failedSyncsRef.current += 1;
        }
      } finally {
        pendingSyncsRef.current -= 1;
        if (pendingSyncsRef.current === 0) {
          setSyncStatus(failedSyncsRef.current > 0 ? 'error' : 'idle');
        }
      }
    })();

    const newGrades = [...grades, grade];
    setGrades(newGrades);
    setIsRevealed(false);

    const isLast = currentIdx >= studyCards.length - 1;

    if (isLast) {
      // Finish session
      if (sid && sessionStartTime) {
        const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 1000);
        const correctCount = newGrades.filter(g => g >= 3).length;
        api.updateStudySession(sid, {
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
          total_reviews: newGrades.length,
          correct_reviews: correctCount,
        }).catch((err) => logger.warn('[FlashcardStudy] Failed to finalize session:', err));
      }
      setPhase('summary');
    } else {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 150);
    }
  }, [studyCards, currentIdx, sessionId, sessionStartTime, grades]);

  // A2 — Keyboard shortcuts: Space/Enter = reveal, 0-5 = grade
  useEffect(() => {
    if (phase !== 'studying') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!isRevealed && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setIsRevealed(true);
      } else if (isRevealed && e.key >= '0' && e.key <= '5') {
        e.preventDefault();
        handleGrade(parseInt(e.key, 10));
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [phase, isRevealed, handleGrade]);

  // ── Navigation ────────────────────────────────────────────

  const handleRestart = () => {
    if (selectedCourse) loadStudyCards(selectedCourse);
  };

  const handleBackToCourses = () => {
    setPhase('course-select');
    setSelectedCourse(null);
    setStudyCards([]);
    setGrades([]);
    setError(null);
  };

  // ── Computed stats ────────────────────────────────────────

  const sessionStats = useMemo(() => {
    if (grades.length === 0) return { avg: 0, pct: 0, correct: 0, total: 0 };
    const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
    return {
      avg,
      pct: (avg / 5) * 100,
      correct: grades.filter(g => g >= 3).length,
      total: grades.length,
    };
  }, [grades]);

  const currentCard = studyCards[currentIdx];

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 relative">
      {/* Error toast */}
      <div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl shadow-lg text-sm text-red-700 dark:text-red-400 max-w-lg"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="shrink-0"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PHASE: Course Selection ── */}
      {phase === 'course-select' && (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Brain size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudiar Flashcards</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Elige un curso para iniciar la sesion FSRS</p>
                </div>
              </div>
            </div>

            {loadingCourses ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-teal-500" />
                <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">Cargando cursos...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                <BookOpen size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium">No hay cursos disponibles</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Los cursos deben ser creados por un profesor</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course, idx) => (
                  <motion.button
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedCourse(course);
                      loadStudyCards(course);
                    }}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 text-left hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${course.color || '#14b8a6'}15`,
                          color: course.color || '#14b8a6',
                        }}
                      >
                        <BookOpen size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {course.name}
                        </p>
                        {course.code && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{course.code}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">Click para estudiar</span>
                      <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-teal-500 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PHASE: Loading Cards ── */}
      {phase === 'loading-cards' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-teal-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Preparando sesion de estudio...</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{progressMsg}</p>
          </div>
        </div>
      )}

      {/* ── PHASE: Empty (no cards to study) ── */}
      {phase === 'empty' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay cards pendientes!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Todas tus revisiones estan al dia, o aun no hay flashcards creados en este curso.
            </p>
            <button
              onClick={handleBackToCourses}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Volver a cursos
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE: Studying ── */}
      {phase === 'studying' && currentCard && (
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleBackToCourses}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ChevronLeft size={16} />
              Salir
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {currentIdx + 1} / {studyCards.length}
                </span>
                <div className="w-32 h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-teal-500 rounded-full"
                    initial={false}
                    animate={{ width: `${((currentIdx + 1) / studyCards.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <StateBadge state={currentCard.fsrsState.state} />
              {/* A3 — Sync status indicator */}
              <SyncIndicator status={syncStatus} />
            </div>
          </div>

          {/* Card area */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`card-${currentIdx}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-slate-950/50 border border-gray-100 dark:border-slate-800 overflow-hidden"
                >
                  {/* Front */}
                  <div className="px-8 py-10 text-center min-h-[200px] flex flex-col items-center justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-4">
                      Pregunta
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed max-w-lg">
                      {currentCard.flashcard.front}
                    </p>
                  </div>

                  {/* Reveal / Answer */}
                  {!isRevealed ? (
                    <div className="px-8 pb-8">
                      <button
                        onClick={() => setIsRevealed(true)}
                        className="w-full py-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 border-2 border-dashed border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={18} />
                        Mostrar Respuesta
                        <kbd className="ml-2 px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/50 rounded text-[10px] font-mono text-teal-500 dark:text-teal-400">Space</kbd>
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-gray-100 dark:border-slate-800 px-8 py-8 bg-gray-50/50 dark:bg-slate-800/50 text-center min-h-[150px] flex flex-col items-center justify-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                          Respuesta
                        </p>
                        <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed max-w-lg">
                          {currentCard.flashcard.back}
                        </p>
                      </div>

                      <div className="px-6 pb-6 bg-gray-50/50 dark:bg-slate-800/50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center mb-3">
                          Como fue?
                        </p>
                        <div className="flex gap-2">
                          {GRADES.map(g => (
                            <button
                              key={g.value}
                              onClick={() => handleGrade(g.value)}
                              className={`flex-1 py-3 rounded-xl text-white font-semibold text-sm ${g.color} transition-all hover:scale-[1.02] active:scale-95 shadow-sm`}
                              title={`${g.desc} (tecla ${g.value})`}
                            >
                              <span className="block">{g.label}</span>
                              <kbd className="block text-[9px] font-mono opacity-60 mt-0.5">{g.value}</kbd>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE: Summary ── */}
      {phase === 'summary' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/25">
              <Trophy size={40} className="text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sesion Completada!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Revisaste {sessionStats.total} flashcards</p>

            {/* Stats ring */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="72" stroke="currentColor" className="text-gray-200 dark:text-slate-800" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="80" cy="80" r="72"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  className="text-teal-500"
                  strokeDasharray={2 * Math.PI * 72}
                  initial={{ strokeDashoffset: 2 * Math.PI * 72 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 72 * (1 - sessionStats.pct / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(sessionStats.pct)}%
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Desempeno</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessionStats.total}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revisados</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-3">
                <p className="text-2xl font-bold text-emerald-600">{sessionStats.correct}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Correctos</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-3">
                <p className="text-2xl font-bold text-rose-500">{sessionStats.total - sessionStats.correct}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Por revisar</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBackToCourses}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg shadow-teal-500/20 transition-all"
              >
                Estudiar de Nuevo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── State Badge ───────────────────────────────────────────

function StateBadge({ state }: { state: string }) {
  const config: Record<string, { label: string; className: string }> = {
    new: { label: 'Nuevo', className: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' },
    learning: { label: 'Aprendiendo', className: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' },
    review: { label: 'Revision', className: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' },
    relearning: { label: 'Reaprendiendo', className: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' },
  };
  const c = config[state] || config.new;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${c.className}`}>
      {c.label}
    </span>
  );
}

// ── Sync Indicator (A3) ───────────────────────────────────
// C1 fix — AnimatePresence wraps the conditional child so exit animations fire

function SyncIndicator({ status }: { status: 'idle' | 'syncing' | 'error' }) {
  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.span
          key={status}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full border ${
            status === 'syncing'
              ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-500 dark:text-teal-400 border-teal-200 dark:border-teal-900/50'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
          }`}
          title={status === 'error' ? 'Algunas revisiones no se guardaron' : 'Guardando progreso...'}
        >
          {status === 'syncing' ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <CloudOff size={10} />
          )}
          {status === 'syncing' ? 'Sync' : 'Sync parcial'}
        </motion.span>
      )}
    </AnimatePresence>
  );
}