// ============================================================
// Axon — Professor Flashcards Page (composition)
// Browse hierarchy: Course → Semester → Section → Topic → Summary → Flashcards
// CRUD operations on flashcards
// ============================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Plus, ChevronRight, BookOpen, Layers,
  FolderOpen, FileText, Loader2, Search, X, AlertCircle,
  GraduationCap,
} from 'lucide-react';
import * as api from '@/app/services/flashcardApi';
import type { Flashcard } from '@/app/services/flashcardApi';
import { getErrorMessage } from '@/app/lib/errors';

import { useHierarchyNav, type BrowseLevel } from './useHierarchyNav';
import { ItemGrid } from './ItemGrid';
import { FlashcardForm } from './FlashcardForm';
import { FlashcardRow } from './FlashcardRow';

// ── Level → Icon mapping ──────────────────────────────────

const LEVEL_ICONS: Record<BrowseLevel, React.ReactNode> = {
  courses:    <BookOpen size={16} />,
  semesters:  <FolderOpen size={16} />,
  sections:   <Layers size={16} />,
  topics:     <FileText size={16} />,
  summaries:  <GraduationCap size={16} />,
  flashcards: <CreditCard size={16} />,
};

// ── Main Component ────────────────────────────────────────

export function ProfessorFlashcardsPage() {
  const nav = useHierarchyNav();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  // ── Flashcard CRUD ────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingCard(null);
    setShowForm(true);
  };

  const handleOpenEdit = (card: Flashcard) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleSave = async (data: { front: string; back: string; keyword_id: string | null; source: string }) => {
    if (!nav.selectedSummaryId && !editingCard) return;
    try {
      if (editingCard) {
        const updated = await api.updateFlashcard(editingCard.id, {
          front: data.front,
          back: data.back,
          source: data.source || undefined,
        });
        nav.setFlashcards(prev => prev.map(f => f.id === updated.id ? updated : f));
      } else {
        const created = await api.createFlashcard({
          summary_id: nav.selectedSummaryId!,
          keyword_id: data.keyword_id,
          front: data.front,
          back: data.back,
          source: data.source || undefined,
        });
        nav.setFlashcards(prev => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      nav.setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteFlashcard(id);
      nav.setFlashcards(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      nav.setError(getErrorMessage(err));
    }
  };

  const handleToggleActive = async (card: Flashcard) => {
    try {
      const updated = await api.updateFlashcard(card.id, { is_active: !card.is_active });
      nav.setFlashcards(prev => prev.map(f => f.id === updated.id ? updated : f));
    } catch (err) {
      nav.setError(getErrorMessage(err));
    }
  };

  // ── Filtered flashcards (C2 — memoized) ───────────────

  const filteredFlashcards = useMemo(() => {
    if (!nav.searchTerm) return nav.flashcards;
    const term = nav.searchTerm.toLowerCase();
    return nav.flashcards.filter(f =>
      f.front.toLowerCase().includes(term) || f.back.toLowerCase().includes(term)
    );
  }, [nav.flashcards, nav.searchTerm]);

  // P1 — keyword Map for O(1) lookup instead of O(n) .find() per row
  const keywordMap = useMemo(() => {
    const map = new Map<string, typeof nav.keywords[number]>();
    for (const kw of nav.keywords) {
      map.set(kw.id, kw);
    }
    return map;
  }, [nav.keywords]);

  // ── Render ────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
        {nav.breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="contents">
            {idx > 0 && <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            <button
              onClick={() => nav.navigateBack(crumb.level)}
              disabled={idx === nav.breadcrumbs.length - 1}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                idx === nav.breadcrumbs.length - 1
                  ? 'text-purple-700 dark:text-purple-400 font-semibold cursor-default'
                  : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
              }`}
            >
              {idx === 0 && LEVEL_ICONS[crumb.level]}
              <span className="truncate max-w-[200px]">{crumb.label}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Error message */}
      <div>
        <AnimatePresence>
          {nav.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-700 dark:text-red-400"
            >
              <AlertCircle size={16} />
              <span className="flex-1">{nav.error}</span>
              <button onClick={() => nav.setError(null)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading state */}
      {nav.loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-purple-500" />
          <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">Cargando...</span>
        </div>
      )}

      {/* ── Hierarchy Grids ── */}
      {!nav.loading && nav.level === 'courses' && (
        <ItemGrid items={nav.courses} icon={<BookOpen size={18} className="text-purple-600 dark:text-purple-400" />} emptyLabel="No hay cursos en esta institucion" getLabel={c => c.name} getSubLabel={c => c.code || c.description || ''} getColor={c => c.color || '#8b5cf6'} onSelect={nav.handleSelectCourse} />
      )}
      {!nav.loading && nav.level === 'semesters' && (
        <ItemGrid items={nav.semesters} icon={<FolderOpen size={18} className="text-purple-600 dark:text-purple-400" />} emptyLabel="No hay semestres en este curso" getLabel={s => s.name} onSelect={nav.handleSelectSemester} />
      )}
      {!nav.loading && nav.level === 'sections' && (
        <ItemGrid items={nav.sections} icon={<Layers size={18} className="text-purple-600 dark:text-purple-400" />} emptyLabel="No hay secciones en este semestre" getLabel={s => s.name} onSelect={nav.handleSelectSection} />
      )}
      {!nav.loading && nav.level === 'topics' && (
        <ItemGrid items={nav.topics} icon={<FileText size={18} className="text-purple-600 dark:text-purple-400" />} emptyLabel="No hay topicos en esta seccion" getLabel={t => t.name} onSelect={nav.handleSelectTopic} />
      )}
      {!nav.loading && nav.level === 'summaries' && (
        <ItemGrid items={nav.summaries} icon={<GraduationCap size={18} className="text-purple-600 dark:text-purple-400" />} emptyLabel="No hay resumenes en este topico" getLabel={s => s.title} getSubLabel={s => s.is_active ? 'Activo' : 'Inactivo'} onSelect={nav.handleSelectSummary} />
      )}

      {/* ── Flashcards Level ── */}
      {!nav.loading && nav.level === 'flashcards' && (
        <div>
          {/* Header + Actions */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Flashcards ({nav.flashcards.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {nav.keywords.length} keywords disponibles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={nav.searchTerm}
                  onChange={e => nav.setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 dark:focus:border-purple-600 w-48"
                />
              </div>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Nuevo Flashcard
              </button>
            </div>
          </div>

          {/* Flashcard List */}
          {filteredFlashcards.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <CreditCard size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium">
                {nav.searchTerm
                  ? 'No se encontraron flashcards'
                  : 'No hay flashcards aun. Crea la primera!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFlashcards.map((card, idx) => (
                <FlashcardRow
                  key={card.id}
                  card={card}
                  index={idx}
                  keyword={card.keyword_id ? keywordMap.get(card.keyword_id) : undefined}
                  onEdit={() => handleOpenEdit(card)}
                  onDelete={() => handleDelete(card.id)}
                  onToggleActive={() => handleToggleActive(card)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Create/Edit Form Modal ── */}
      <div>
        <AnimatePresence>
          {showForm && (
            <FlashcardForm
              editingCard={editingCard}
              keywords={nav.keywords}
              onSave={handleSave}
              onClose={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}