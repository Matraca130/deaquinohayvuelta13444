// ============================================================
// Axon — FlashcardRow (single flashcard display with actions)
// ============================================================

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Pencil, Trash2, Eye, EyeOff, Sparkles, Check, X } from 'lucide-react';
import type { Flashcard, KeywordItem } from '@/app/services/flashcardApi';

interface FlashcardRowProps {
  card: Flashcard;
  index: number;
  keyword?: KeywordItem;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  onToggleActive: () => void | Promise<void>;
}

export function FlashcardRow({
  card,
  index,
  keyword,
  onEdit,
  onDelete,
  onToggleActive,
}: FlashcardRowProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  // U1 — prevent double-click on async operations
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onDelete();
    } finally {
      setBusy(false);
      setShowConfirmDelete(false);
    }
  };

  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onToggleActive();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-white dark:bg-slate-900 rounded-xl border p-4 transition-all ${
        card.is_active
          ? 'border-gray-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800'
          : 'border-gray-100 dark:border-slate-800/50 opacity-60'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Number badge */}
        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Frente</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{card.front}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Reverso</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{card.back}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {keyword && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-full border border-purple-100 dark:border-purple-900/50">
                <Sparkles size={10} />
                {keyword.term}
              </span>
            )}
            {card.source && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                Fuente: {card.source}
              </span>
            )}
            {!card.is_active && (
              <span className="text-[10px] text-orange-500 font-medium">Inactivo</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            title={card.is_active ? 'Desactivar' : 'Activar'}
          >
            {card.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          {showConfirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Confirmar eliminar"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                title="Cancelar"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}