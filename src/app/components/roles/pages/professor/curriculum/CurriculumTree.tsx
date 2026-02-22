// ============================================================
// Axon — Curriculum Tree (Professor Area)
// Collapsible tree: Course → Semester → Section → Topic → Summaries
// PARALLEL-SAFE: independent component, does not touch student area.
// ============================================================
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight, ChevronDown, Calendar, Layers, FileText,
  Plus, Pencil, Trash2, MoreHorizontal, FolderOpen, Loader2, X, Check,
} from 'lucide-react';
import clsx from 'clsx';
import * as api from '@/app/services/platformApi';
import type { Course, Semester, Section, Topic, Summary, UUID } from '@/app/types/platform';
import { usePlatformData } from '@/app/context/PlatformDataContext';

// ── Types ────────────────────────────────────────────────

export interface TreeSelection {
  courseId?: UUID;
  semesterId?: UUID;
  sectionId?: UUID;
  topicId?: UUID;
  summaryId?: UUID;
  // Full objects for breadcrumb
  course?: Course;
  semester?: Semester;
  section?: Section;
  topic?: Topic;
  summary?: Summary;
}

interface CurriculumTreeProps {
  onSelectSummary: (selection: TreeSelection & { summary: Summary }) => void;
  onCreateSummary: (selection: TreeSelection & { topicId: UUID }) => void;
}

// ── Inline Edit Input ────────────────────────────────────

function InlineEdit({
  value,
  onConfirm,
  onCancel,
  placeholder,
}: {
  value: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value);

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && text.trim()) onConfirm(text.trim());
          if (e.key === 'Escape') onCancel();
        }}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-2 py-0.5 text-sm rounded border border-purple-300 bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
      />
      <button
        onClick={() => text.trim() && onConfirm(text.trim())}
        className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
      >
        <Check size={14} />
      </button>
      <button
        onClick={onCancel}
        className="p-0.5 text-gray-400 hover:bg-gray-100 rounded"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Action Menu ──────────────────────────────────────────

function NodeActions({
  onRename,
  onDelete,
  onAdd,
  addLabel,
}: {
  onRename: () => void;
  onDelete: () => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1 rounded hover:bg-gray-200/80 text-gray-400 hover:text-gray-600 opacity-0 group-hover/node:opacity-100 transition-opacity"
      >
        <MoreHorizontal size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px]"
            >
              {onAdd && addLabel && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAdd(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                >
                  <Plus size={12} />
                  {addLabel}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onRename(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={12} />
                Renomear
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 size={12} />
                Excluir
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Summary List Item ────────────────────────────────────

function SummaryItem({
  summary,
  isSelected,
  onClick,
  onDelete,
}: {
  summary: Summary;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const statusColors: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-700',
    published: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className={clsx(
        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all group/summary cursor-pointer',
        isSelected
          ? 'bg-purple-50 border border-purple-200 text-purple-900'
          : 'hover:bg-gray-50 text-gray-700'
      )}
    >
      <FileText size={13} className={isSelected ? 'text-purple-500' : 'text-gray-400'} />
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate">{summary.title || 'Resumo sem titulo'}</p>
        <p className="text-[10px] text-gray-400">
          v{summary.version || 1} · {new Date(summary.updated_at).toLocaleDateString('pt-BR')}
        </p>
      </div>
      <span className={clsx('text-[9px] px-1.5 py-0.5 rounded-full font-medium', statusColors[summary.status] || statusColors.draft)}>
        {summary.status === 'draft' ? 'Rascunho' : summary.status === 'published' ? 'Publicado' : 'Rejeitado'}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/summary:opacity-100 transition-opacity"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

// ── Main Tree Component ──────────────────────────────────

export function CurriculumTree({ onSelectSummary, onCreateSummary }: CurriculumTreeProps) {
  const { courses, institutionId, refreshCourses } = usePlatformData();

  // Expanded state per level
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Loaded children
  const [semesters, setSemesters] = useState<Record<string, Semester[]>>({});
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});
  const [summaries, setSummaries] = useState<Record<string, Summary[]>>({});

  // Loading
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Inline editing / adding
  const [addingAt, setAddingAt] = useState<{ level: string; parentId: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  // Selection tracking
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);

  // ── Load children on expand ────────────────────────────

  const toggleCourse = useCallback(async (courseId: string) => {
    const next = new Set(expandedCourses);
    if (next.has(courseId)) {
      next.delete(courseId);
    } else {
      next.add(courseId);
      if (!semesters[courseId]) {
        setLoading(l => ({ ...l, [courseId]: true }));
        try {
          const result = await api.getSemesters(courseId);
          const data = (result as any)?.items || result || [];
          setSemesters(s => ({ ...s, [courseId]: data }));
        } catch (err) {
          console.error('Error loading semesters:', err);
        }
        setLoading(l => ({ ...l, [courseId]: false }));
      }
    }
    setExpandedCourses(next);
  }, [expandedCourses, semesters]);

  const toggleSemester = useCallback(async (semId: string) => {
    const next = new Set(expandedSemesters);
    if (next.has(semId)) {
      next.delete(semId);
    } else {
      next.add(semId);
      if (!sections[semId]) {
        setLoading(l => ({ ...l, [semId]: true }));
        try {
          const result = await api.getSections(semId);
          const data = (result as any)?.items || result || [];
          setSections(s => ({ ...s, [semId]: data }));
        } catch (err) {
          console.error('Error loading sections:', err);
        }
        setLoading(l => ({ ...l, [semId]: false }));
      }
    }
    setExpandedSemesters(next);
  }, [expandedSemesters, sections]);

  const toggleSection = useCallback(async (secId: string) => {
    const next = new Set(expandedSections);
    if (next.has(secId)) {
      next.delete(secId);
    } else {
      next.add(secId);
      if (!topics[secId]) {
        setLoading(l => ({ ...l, [secId]: true }));
        try {
          const result = await api.getTopics(secId);
          const data = (result as any)?.items || result || [];
          setTopics(t => ({ ...t, [secId]: data }));
        } catch (err) {
          console.error('Error loading topics:', err);
        }
        setLoading(l => ({ ...l, [secId]: false }));
      }
    }
    setExpandedSections(next);
  }, [expandedSections, topics]);

  const toggleTopic = useCallback(async (topicId: string) => {
    const next = new Set(expandedTopics);
    if (next.has(topicId)) {
      next.delete(topicId);
    } else {
      next.add(topicId);
      if (!summaries[topicId]) {
        setLoading(l => ({ ...l, [topicId]: true }));
        try {
          const data = await api.getTopicSummaries(topicId);
          setSummaries(s => ({ ...s, [topicId]: data }));
        } catch (err) {
          console.error('Error loading summaries:', err);
        }
        setLoading(l => ({ ...l, [topicId]: false }));
      }
    }
    setExpandedTopics(next);
  }, [expandedTopics, summaries]);

  // ── CRUD operations ────────────────────────────────────

  const handleAddCourse = async (name: string) => {
    if (!institutionId) return;
    try {
      await api.createCourse({ name, institution_id: institutionId });
      await refreshCourses();
      setAddingAt(null);
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  const handleAddSemester = async (courseId: string, name: string) => {
    try {
      const sem = await api.createSemester({ course_id: courseId, name });
      setSemesters(s => ({ ...s, [courseId]: [...(s[courseId] || []), sem] }));
      setAddingAt(null);
    } catch (err) {
      console.error('Error creating semester:', err);
    }
  };

  const handleAddSection = async (semId: string, name: string) => {
    try {
      const sec = await api.createSection({ semester_id: semId, name });
      setSections(s => ({ ...s, [semId]: [...(s[semId] || []), sec] }));
      setAddingAt(null);
    } catch (err) {
      console.error('Error creating section:', err);
    }
  };

  const handleAddTopic = async (secId: string, name: string) => {
    try {
      const top = await api.createTopic({ section_id: secId, name });
      setTopics(t => ({ ...t, [secId]: [...(t[secId] || []), top] }));
      setAddingAt(null);
    } catch (err) {
      console.error('Error creating topic:', err);
    }
  };

  const handleRenameCourse = async (courseId: string, name: string) => {
    try {
      await api.updateCourse(courseId, { name });
      await refreshCourses();
      setRenamingId(null);
    } catch (err) {
      console.error('Error renaming course:', err);
    }
  };

  const handleRenameSemester = async (semId: string, courseId: string, name: string) => {
    try {
      await api.updateSemester(semId, { name });
      setSemesters(s => ({
        ...s,
        [courseId]: (s[courseId] || []).map(sem => sem.id === semId ? { ...sem, name } : sem),
      }));
      setRenamingId(null);
    } catch (err) {
      console.error('Error renaming semester:', err);
    }
  };

  const handleRenameSec = async (secId: string, semId: string, name: string) => {
    try {
      await api.updateSection(secId, { name });
      setSections(s => ({
        ...s,
        [semId]: (s[semId] || []).map(sec => sec.id === secId ? { ...sec, name } : sec),
      }));
      setRenamingId(null);
    } catch (err) {
      console.error('Error renaming section:', err);
    }
  };

  const handleRenameTopic = async (topId: string, secId: string, name: string) => {
    try {
      await api.updateTopic(topId, { name });
      setTopics(t => ({
        ...t,
        [secId]: (t[secId] || []).map(top => top.id === topId ? { ...top, name } : top),
      }));
      setRenamingId(null);
    } catch (err) {
      console.error('Error renaming topic:', err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Excluir este curso e todo seu conteudo?')) return;
    try {
      await api.deleteCourse(courseId);
      await refreshCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const handleDeleteSemester = async (semId: string, courseId: string) => {
    if (!confirm('Excluir este semestre?')) return;
    try {
      await api.deleteSemester(semId);
      setSemesters(s => ({
        ...s,
        [courseId]: (s[courseId] || []).filter(sem => sem.id !== semId),
      }));
    } catch (err) {
      console.error('Error deleting semester:', err);
    }
  };

  const handleDeleteSection = async (secId: string, semId: string) => {
    if (!confirm('Excluir esta secao?')) return;
    try {
      await api.deleteSection(secId);
      setSections(s => ({
        ...s,
        [semId]: (s[semId] || []).filter(sec => sec.id !== secId),
      }));
    } catch (err) {
      console.error('Error deleting section:', err);
    }
  };

  const handleDeleteTopic = async (topId: string, secId: string) => {
    if (!confirm('Excluir este topico?')) return;
    try {
      await api.deleteTopic(topId);
      setTopics(t => ({
        ...t,
        [secId]: (t[secId] || []).filter(top => top.id !== topId),
      }));
    } catch (err) {
      console.error('Error deleting topic:', err);
    }
  };

  const handleDeleteSummary = async (summaryId: string, topicId: string) => {
    if (!confirm('Excluir este resumo?')) return;
    try {
      await api.deleteSummary(summaryId);
      setSummaries(s => ({
        ...s,
        [topicId]: (s[topicId] || []).filter(su => su.id !== summaryId),
      }));
    } catch (err) {
      console.error('Error deleting summary:', err);
    }
  };

  // ── Build breadcrumb for selection ─────────────────────

  const buildSelection = (courseId: string, semId?: string, secId?: string, topId?: string): TreeSelection => {
    const course = courses.find(c => c.id === courseId);
    const semester = semId ? (semesters[courseId] || []).find(s => s.id === semId) : undefined;
    const section = semId && secId ? (sections[semId] || []).find(s => s.id === secId) : undefined;
    const topic = secId && topId ? (topics[secId] || []).find(t => t.id === topId) : undefined;
    return { courseId, semesterId: semId, sectionId: secId, topicId: topId, course, semester, section, topic };
  };

  // ── Render ─────────────────────────────────────────────

  const indent = (level: number) => ({ paddingLeft: `${level * 16 + 8}px` });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Curriculum</h3>
        <button
          onClick={() => setAddingAt({ level: 'course', parentId: '' })}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
        >
          <Plus size={12} />
          Curso
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {courses.length === 0 && !addingAt && (
          <div className="px-4 py-8 text-center">
            <FolderOpen size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Nenhum curso criado</p>
            <button
              onClick={() => setAddingAt({ level: 'course', parentId: '' })}
              className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              + Criar primeiro curso
            </button>
          </div>
        )}

        {/* Courses */}
        {courses.map(course => (
          <div key={course.id}>
            {/* Course node */}
            <div
              className="group/node flex items-center gap-1 py-1.5 pr-2 hover:bg-gray-50 cursor-pointer transition-colors"
              style={indent(0)}
              onClick={() => toggleCourse(course.id)}
            >
              <span className="text-gray-400 shrink-0">
                {expandedCourses.has(course.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: course.color || '#8b5cf6' }}
              />
              {renamingId === course.id ? (
                <InlineEdit
                  value={course.name}
                  onConfirm={(name) => handleRenameCourse(course.id, name)}
                  onCancel={() => setRenamingId(null)}
                />
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{course.name}</span>
                  <NodeActions
                    onRename={() => setRenamingId(course.id)}
                    onDelete={() => handleDeleteCourse(course.id)}
                    onAdd={() => {
                      if (!expandedCourses.has(course.id)) toggleCourse(course.id);
                      setAddingAt({ level: 'semester', parentId: course.id });
                    }}
                    addLabel="Semestre"
                  />
                </>
              )}
            </div>

            {/* Semesters */}
            <AnimatePresence>
              {expandedCourses.has(course.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  {loading[course.id] ? (
                    <div className="flex items-center gap-2 py-2" style={indent(1)}>
                      <Loader2 size={12} className="animate-spin text-gray-400" />
                      <span className="text-xs text-gray-400">Carregando...</span>
                    </div>
                  ) : (
                    <>
                      {(semesters[course.id] || []).map(sem => (
                        <div key={sem.id}>
                          <div
                            className="group/node flex items-center gap-1 py-1.5 pr-2 hover:bg-gray-50 cursor-pointer transition-colors"
                            style={indent(1)}
                            onClick={() => toggleSemester(sem.id)}
                          >
                            <span className="text-gray-400 shrink-0">
                              {expandedSemesters.has(sem.id) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                            </span>
                            <Calendar size={13} className="text-purple-400 shrink-0" />
                            {renamingId === sem.id ? (
                              <InlineEdit
                                value={sem.name}
                                onConfirm={(name) => handleRenameSemester(sem.id, course.id, name)}
                                onCancel={() => setRenamingId(null)}
                              />
                            ) : (
                              <>
                                <span className="flex-1 text-[13px] text-gray-700 truncate">{sem.name}</span>
                                <NodeActions
                                  onRename={() => setRenamingId(sem.id)}
                                  onDelete={() => handleDeleteSemester(sem.id, course.id)}
                                  onAdd={() => {
                                    if (!expandedSemesters.has(sem.id)) toggleSemester(sem.id);
                                    setAddingAt({ level: 'section', parentId: sem.id });
                                  }}
                                  addLabel="Secao"
                                />
                              </>
                            )}
                          </div>

                          {/* Sections */}
                          <AnimatePresence>
                            {expandedSemesters.has(sem.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                {loading[sem.id] ? (
                                  <div className="flex items-center gap-2 py-2" style={indent(2)}>
                                    <Loader2 size={12} className="animate-spin text-gray-400" />
                                    <span className="text-xs text-gray-400">Carregando...</span>
                                  </div>
                                ) : (
                                  <>
                                    {(sections[sem.id] || []).map(sec => (
                                      <div key={sec.id}>
                                        <div
                                          className="group/node flex items-center gap-1 py-1.5 pr-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                          style={indent(2)}
                                          onClick={() => toggleSection(sec.id)}
                                        >
                                          <span className="text-gray-400 shrink-0">
                                            {expandedSections.has(sec.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                          </span>
                                          <Layers size={12} className="text-blue-400 shrink-0" />
                                          {renamingId === sec.id ? (
                                            <InlineEdit
                                              value={sec.name}
                                              onConfirm={(name) => handleRenameSec(sec.id, sem.id, name)}
                                              onCancel={() => setRenamingId(null)}
                                            />
                                          ) : (
                                            <>
                                              <span className="flex-1 text-[13px] text-gray-600 truncate">{sec.name}</span>
                                              <NodeActions
                                                onRename={() => setRenamingId(sec.id)}
                                                onDelete={() => handleDeleteSection(sec.id, sem.id)}
                                                onAdd={() => {
                                                  if (!expandedSections.has(sec.id)) toggleSection(sec.id);
                                                  setAddingAt({ level: 'topic', parentId: sec.id });
                                                }}
                                                addLabel="Topico"
                                              />
                                            </>
                                          )}
                                        </div>

                                        {/* Topics */}
                                        <AnimatePresence>
                                          {expandedSections.has(sec.id) && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                            >
                                              {loading[sec.id] ? (
                                                <div className="flex items-center gap-2 py-2" style={indent(3)}>
                                                  <Loader2 size={12} className="animate-spin text-gray-400" />
                                                  <span className="text-xs text-gray-400">Carregando...</span>
                                                </div>
                                              ) : (
                                                <>
                                                  {(topics[sec.id] || []).map(top => (
                                                    <div key={top.id}>
                                                      <div
                                                        className="group/node flex items-center gap-1 py-1.5 pr-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                                        style={indent(3)}
                                                        onClick={() => toggleTopic(top.id)}
                                                      >
                                                        <span className="text-gray-400 shrink-0">
                                                          {expandedTopics.has(top.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                        </span>
                                                        <FileText size={12} className="text-teal-500 shrink-0" />
                                                        {renamingId === top.id ? (
                                                          <InlineEdit
                                                            value={top.name}
                                                            onConfirm={(name) => handleRenameTopic(top.id, sec.id, name)}
                                                            onCancel={() => setRenamingId(null)}
                                                          />
                                                        ) : (
                                                          <>
                                                            <span className="flex-1 text-[13px] text-gray-600 truncate">{top.name}</span>
                                                            <NodeActions
                                                              onRename={() => setRenamingId(top.id)}
                                                              onDelete={() => handleDeleteTopic(top.id, sec.id)}
                                                            />
                                                          </>
                                                        )}
                                                      </div>

                                                      {/* Summaries */}
                                                      <AnimatePresence>
                                                        {expandedTopics.has(top.id) && (
                                                          <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="overflow-hidden"
                                                          >
                                                            {loading[top.id] ? (
                                                              <div className="flex items-center gap-2 py-2" style={indent(4)}>
                                                                <Loader2 size={12} className="animate-spin text-gray-400" />
                                                              </div>
                                                            ) : (
                                                              <div className="py-1 space-y-0.5" style={indent(4)}>
                                                                {(summaries[top.id] || []).map(sum => (
                                                                  <SummaryItem
                                                                    key={sum.id}
                                                                    summary={sum}
                                                                    isSelected={selectedSummaryId === sum.id}
                                                                    onClick={() => {
                                                                      setSelectedSummaryId(sum.id);
                                                                      const sel = buildSelection(course.id, sem.id, sec.id, top.id);
                                                                      onSelectSummary({ ...sel, summary: sum, summaryId: sum.id });
                                                                    }}
                                                                    onDelete={() => handleDeleteSummary(sum.id, top.id)}
                                                                  />
                                                                ))}
                                                                <button
                                                                  onClick={() => {
                                                                    const sel = buildSelection(course.id, sem.id, sec.id, top.id);
                                                                    onCreateSummary({ ...sel, topicId: top.id });
                                                                  }}
                                                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                                                                >
                                                                  <Plus size={11} />
                                                                  Novo Resumo
                                                                </button>
                                                              </div>
                                                            )}
                                                          </motion.div>
                                                        )}
                                                      </AnimatePresence>
                                                    </div>
                                                  ))}

                                                  {/* Add topic */}
                                                  {addingAt?.level === 'topic' && addingAt.parentId === sec.id && (
                                                    <div className="py-1" style={indent(3)}>
                                                      <InlineEdit
                                                        value=""
                                                        onConfirm={(name) => handleAddTopic(sec.id, name)}
                                                        onCancel={() => setAddingAt(null)}
                                                        placeholder="Nome do topico..."
                                                      />
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    ))}

                                    {/* Add section */}
                                    {addingAt?.level === 'section' && addingAt.parentId === sem.id && (
                                      <div className="py-1" style={indent(2)}>
                                        <InlineEdit
                                          value=""
                                          onConfirm={(name) => handleAddSection(sem.id, name)}
                                          onCancel={() => setAddingAt(null)}
                                          placeholder="Nome da secao..."
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                      {/* Add semester */}
                      {addingAt?.level === 'semester' && addingAt.parentId === course.id && (
                        <div className="py-1" style={indent(1)}>
                          <InlineEdit
                            value=""
                            onConfirm={(name) => handleAddSemester(course.id, name)}
                            onCancel={() => setAddingAt(null)}
                            placeholder="Nome do semestre..."
                          />
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Add course */}
        {addingAt?.level === 'course' && (
          <div className="py-1 px-2">
            <InlineEdit
              value=""
              onConfirm={handleAddCourse}
              onCancel={() => setAddingAt(null)}
              placeholder="Nome do curso..."
            />
          </div>
        )}
      </div>
    </div>
  );
}