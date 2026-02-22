// ============================================================
// Axon — Professor: Quiz Question Manager
// Full CRUD for quiz questions, connected to real backend.
//
// Uses shared hooks (useCourseTree) and components
// (ContentTreeGrid, CourseToolbar, QuestionDialog, QuestionBadges).
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import * as quizApi from '@/app/services/quizApi';
import type { QuizQuestion, Summary } from '@/app/services/quizApi';
import type { ContentTreeTopic } from '@/app/services/contentTreeBuilder';
import { useCourseTree } from '@/app/hooks/useCourseTree';
import { ContentTreeGrid } from '@/app/components/shared/ContentTreeGrid';
import { CourseToolbar } from '@/app/components/shared/CourseToolbar';
import { LoadingState, EmptyState, ErrorState } from '@/app/components/shared/FeedbackStates';
import { getTypeMeta, getDifficultyMeta, QUESTION_TYPES, DIFFICULTIES } from '@/app/components/shared/QuestionBadges';
import { QuestionDialog } from '@/app/components/content/quiz/QuestionDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import {
  Plus, Pencil, Trash2, Loader2,
  ClipboardList, CheckCircle2, ListFilter,
  BookOpen, ChevronLeft,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════
// ── Main Page ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════

export function ProfessorQuizzesPage() {
  const { activeMembership } = useAuth();
  const institutionId = activeMembership?.institution_id || '';

  const {
    courses, selectedCourse, setSelectedCourse,
    coursesLoading, tree, treeLoading, totalTopics,
  } = useCourseTree(institutionId);

  // Selected topic → shows summaries + questions
  const [activeTopic, setActiveTopic] = useState<ContentTreeTopic | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<string>('');
  const [summariesLoading, setSummariesLoading] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [saving, setSaving] = useState(false);

  // Inline feedback (replaces blocking alert/confirm)
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reset active topic when course changes
  const handleCourseChange = useCallback((course: typeof selectedCourse) => {
    setSelectedCourse(course);
    setActiveTopic(null);
  }, [setSelectedCourse]);

  // ── Load summaries when topic selected ──────────────
  useEffect(() => {
    setSummaries([]); setSelectedSummary(''); setQuestions([]);
    if (!activeTopic) return;
    let cancelled = false;
    setSummariesLoading(true);

    quizApi.getSummaries(activeTopic.id)
      .then(res => {
        if (cancelled) return;
        const items = res.items || [];
        setSummaries(items);
        if (items.length > 0) setSelectedSummary(items[0].id);
      })
      .catch(err => {
        if (!cancelled && import.meta.env.DEV) console.error('[Prof] Load summaries:', err);
      })
      .finally(() => { if (!cancelled) setSummariesLoading(false); });

    return () => { cancelled = true; };
  }, [activeTopic]);

  // ── Load questions when summary selected ────────────
  // Track request freshness to avoid race conditions from rapid filter changes
  const loadQuestionsRef = useRef(0);

  const loadQuestions = useCallback(async () => {
    if (!selectedSummary) { setQuestions([]); return; }
    const requestId = ++loadQuestionsRef.current;
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const filters: quizApi.QuizQuestionFilters = { summary_id: selectedSummary };
      if (filterType !== 'all') filters.question_type = filterType;
      if (filterDifficulty !== 'all') filters.difficulty = filterDifficulty;
      const res = await quizApi.getQuizQuestions(filters);
      // Only update if this is still the latest request
      if (requestId === loadQuestionsRef.current) {
        setQuestions(res.items || []);
      }
    } catch (err: unknown) {
      if (requestId === loadQuestionsRef.current) {
        const msg = err instanceof Error ? err.message : 'Error cargando preguntas';
        setQuestionsError(msg);
      }
    } finally {
      if (requestId === loadQuestionsRef.current) {
        setQuestionsLoading(false);
      }
    }
  }, [selectedSummary, filterType, filterDifficulty]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  // ── CRUD handlers ───────────────────────────────────
  const handleSave = useCallback(async (formData: quizApi.CreateQuizQuestionPayload) => {
    setSaving(true);
    setActionError(null);
    try {
      if (editingQuestion) {
        await quizApi.updateQuizQuestion(editingQuestion.id, formData);
      } else {
        await quizApi.createQuizQuestion({ ...formData, summary_id: selectedSummary });
      }
      setDialogOpen(false);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setActionError(msg);
    } finally {
      setSaving(false);
    }
  }, [editingQuestion, selectedSummary, loadQuestions]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await quizApi.deleteQuizQuestion(deleteTarget);
      setDeleteTarget(null);
      await loadQuestions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      setActionError(msg);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, loadQuestions]);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  return (
    <div className="h-full bg-zinc-950 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <ClipboardList size={20} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl text-white">Preguntas de Quiz</h1>
              <p className="text-sm text-zinc-500">Crea y administra preguntas para tus estudiantes</p>
            </div>
          </div>
          <CourseToolbar
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseChange={handleCourseChange}
            treeLoading={treeLoading}
            totalTopics={totalTopics}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* ── PHASE 1: Card grid (no topic selected) ── */}
          {!activeTopic ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
              {(coursesLoading || treeLoading) && (
                <LoadingState message={coursesLoading ? 'Cargando cursos...' : 'Cargando contenido...'} />
              )}

              {!coursesLoading && courses.length === 0 && (
                <EmptyState icon={BookOpen} message="No hay cursos disponibles" />
              )}

              {tree && (
                <ContentTreeGrid tree={tree} onTopicClick={setActiveTopic} />
              )}
            </motion.div>
          ) : (

          /* ── PHASE 2: Topic detail ── */
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Back + Topic header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setActiveTopic(null)}
                  className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm">Volver</span>
                </button>
                <div className="w-px h-5 bg-zinc-800" />
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <BookOpen size={14} className="text-violet-400" />
                </div>
                <span className="text-white text-sm">{activeTopic.name}</span>
              </div>

              {/* Summary selector */}
              <SummaryToolbar
                summaries={summaries}
                summariesLoading={summariesLoading}
                selectedSummary={selectedSummary}
                onSummaryChange={setSelectedSummary}
                onNewQuestion={() => { setEditingQuestion(null); setDialogOpen(true); }}
              />

              {/* Filters */}
              {selectedSummary && (
                <QuestionFilters
                  filterType={filterType}
                  filterDifficulty={filterDifficulty}
                  onFilterTypeChange={setFilterType}
                  onFilterDifficultyChange={setFilterDifficulty}
                  questionCount={questions.length}
                />
              )}

              {/* Questions list */}
              {selectedSummary && (
                <QuestionList
                  questions={questions}
                  loading={questionsLoading}
                  error={questionsError}
                  onEdit={q => { setEditingQuestion(q); setDialogOpen(true); }}
                  onDelete={handleDeleteRequest}
                  onCreateFirst={() => { setEditingQuestion(null); setDialogOpen(true); }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QuestionDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingQuestion(null); }}
        editingQuestion={editingQuestion}
        summaryId={selectedSummary}
        onSave={handleSave}
        saving={saving}
      />

      {/* Inline feedback */}
      {actionError && (
        <AlertDialog open={!!actionError} onOpenChange={() => setActionError(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>Error</AlertDialogHeader>
            <AlertDialogDescription className="text-sm text-zinc-500">
              {actionError}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction>Entendido</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>Confirmar eliminación</AlertDialogHeader>
            <AlertDialogDescription className="text-sm text-zinc-500">
              ¿Estás seguro de que quieres eliminar esta pregunta?
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-500 hover:bg-rose-600 text-white"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ── Sub-components ───────────────────────────────────────
// ══════════════════════════════════════════════════════════

function SummaryToolbar({
  summaries, summariesLoading, selectedSummary, onSummaryChange, onNewQuestion,
}: {
  summaries: Summary[];
  summariesLoading: boolean;
  selectedSummary: string;
  onSummaryChange: (id: string) => void;
  onNewQuestion: () => void;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label className="text-zinc-400 text-xs">Resumen:</Label>
          {summariesLoading ? (
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Cargando...</span>
          ) : summaries.length === 0 ? (
            <span className="text-xs text-zinc-600">Sin resumenes para este topico</span>
          ) : (
            <Select value={selectedSummary} onValueChange={onSummaryChange}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-sm w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {summaries.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-white text-sm">
                    {s.title || `Resumen ${s.id.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {selectedSummary && (
          <Button onClick={onNewQuestion} className="bg-violet-600 hover:bg-violet-700 text-white gap-2" size="sm">
            <Plus size={14} /> Nueva Pregunta
          </Button>
        )}
      </div>
    </div>
  );
}

function QuestionFilters({
  filterType, filterDifficulty, onFilterTypeChange, onFilterDifficultyChange, questionCount,
}: {
  filterType: string;
  filterDifficulty: string;
  onFilterTypeChange: (v: string) => void;
  onFilterDifficultyChange: (v: string) => void;
  questionCount: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <ListFilter size={12} /> Filtrar:
      </div>
      <Select value={filterType} onValueChange={onFilterTypeChange}>
        <SelectTrigger className="w-[160px] bg-zinc-900 border-zinc-800 text-white text-xs h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          <SelectItem value="all" className="text-white text-xs">Todos los tipos</SelectItem>
          {QUESTION_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-white text-xs">{t.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filterDifficulty} onValueChange={onFilterDifficultyChange}>
        <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-white text-xs h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          <SelectItem value="all" className="text-white text-xs">Toda dificultad</SelectItem>
          {DIFFICULTIES.map(d => <SelectItem key={d.value} value={d.value} className="text-white text-xs">{d.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="ml-auto text-xs text-zinc-500">
        {questionCount} pregunta{questionCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

function QuestionList({
  questions, loading, error, onEdit, onDelete, onCreateFirst,
}: {
  questions: QuizQuestion[];
  loading: boolean;
  error: string | null;
  onEdit: (q: QuizQuestion) => void;
  onDelete: (id: string) => void;
  onCreateFirst: () => void;
}) {
  if (loading) return <LoadingState message="Cargando preguntas..." className="py-16" />;
  if (error) return <ErrorState message={error} />;
  if (questions.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        message="No hay preguntas en este resumen"
        className="py-16"
        action={
          <Button onClick={onCreateFirst} variant="ghost" className="text-violet-400 hover:text-violet-300">
            <Plus size={14} /> Crear primera pregunta
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {questions.map((q, idx) => {
        const typeMeta = getTypeMeta(q.question_type);
        const diffMeta = getDifficultyMeta(q.difficulty);
        return (
          <div key={q.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-start gap-4">
              <span className="text-zinc-600 text-sm shrink-0 mt-0.5 w-6 text-right">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-relaxed mb-3">{q.question}</p>

                {q.question_type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                    {q.options.map((opt, i) => (
                      <div key={`${q.id}-opt-${i}`} className={`text-xs px-3 py-1.5 rounded-lg border ${
                        opt === q.correct_answer
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-800 bg-zinc-800/50 text-zinc-400'
                      }`}>
                        {String.fromCharCode(65 + i)}. {opt}
                        {opt === q.correct_answer && <CheckCircle2 size={10} className="inline ml-1.5" />}
                      </div>
                    ))}
                  </div>
                )}

                {q.question_type !== 'multiple_choice' && (
                  <div className="text-xs text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={10} /> Respuesta: {q.correct_answer}
                  </div>
                )}

                {q.explanation && <p className="text-xs text-zinc-500 italic mb-3">Explicacion: {q.explanation}</p>}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeMeta.color}`}>{typeMeta.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${diffMeta.color}`}>{diffMeta.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => onEdit(q)}>
                  <Pencil size={14} />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-rose-400" onClick={() => onDelete(q.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}