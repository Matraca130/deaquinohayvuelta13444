// ============================================================
// Axon — FlashcardForm (create/edit modal)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Loader2, Check } from 'lucide-react';
import type { Flashcard, KeywordItem } from '@/app/services/flashcardApi';

interface FlashcardFormProps {
  editingCard: Flashcard | null;
  keywords: KeywordItem[];
  onSave: (data: {
    front: string;
    back: string;
    keyword_id: string | null;
    source: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function FlashcardForm({ editingCard, keywords, onSave, onClose }: FlashcardFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [keywordId, setKeywordId] = useState<string | null>(null);
  const [source, setSource] = useState('');
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingCard) {
      setFront(editingCard.front);
      setBack(editingCard.back);
      setKeywordId(editingCard.keyword_id);
      setSource(editingCard.source || '');
    } else {
      setFront('');
      setBack('');
      setKeywordId(null);
      setSource('');
    }
  }, [editingCard]);

  // A1 — Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // A1 — Focus trap: focus first input on mount
  useEffect(() => {
    const firstInput = dialogRef.current?.querySelector<HTMLElement>('textarea, input, select');
    firstInput?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!front.trim() || !back.trim()) return;
    setSaving(true);
    try {
      await onSave({
        front: front.trim(),
        back: back.trim(),
        keyword_id: keywordId,
        source: source.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        ref={dialogRef}
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-slate-950/50 w-full max-w-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flashcard-form-title"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 id="flashcard-form-title" className="text-lg font-bold text-gray-900 dark:text-white">
            {editingCard ? 'Editar Flashcard' : 'Nuevo Flashcard'}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Keyword selector */}
          {!editingCard && keywords.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Keyword (opcional)
              </label>
              <select
                value={keywordId || ''}
                onChange={e => setKeywordId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 dark:focus:border-purple-600"
              >
                <option value="">Sin keyword</option>
                {keywords.map(kw => (
                  <option key={kw.id} value={kw.id}>
                    {kw.term}{kw.definition ? ` — ${kw.definition.slice(0, 50)}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Front */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Frente (Pregunta)
            </label>
            <textarea
              value={front}
              onChange={e => setFront(e.target.value)}
              rows={3}
              placeholder="Escribe la pregunta o concepto..."
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 dark:focus:border-purple-600"
            />
          </div>

          {/* Back */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Reverso (Respuesta)
            </label>
            <textarea
              value={back}
              onChange={e => setBack(e.target.value)}
              rows={3}
              placeholder="Escribe la respuesta..."
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 dark:focus:border-purple-600"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Fuente (opcional)
            </label>
            <input
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="e.g. Guyton Cap. 3, Slide 15..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 dark:focus:border-purple-600"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!front.trim() || !back.trim() || saving}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {editingCard ? 'Guardar cambios' : 'Crear flashcard'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}