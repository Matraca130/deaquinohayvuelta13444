import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  Highlighter,
  Edit3,
  Bot,
  StickyNote,
  Trash2,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Text Annotations Panel ──────────────────────────────────────────────────
//
// Panel lateral/inferior para anotações de texto (destaques, notas, perguntas
// ao MedBot). Extraído de SummarySessionNew.tsx para legibilidade.
// ─────────────────────────────────────────────────────────────────────────────

export interface TextAnnotationEntry {
  id: string;
  originalText: string;
  displayText: string;
  color: 'yellow' | 'blue' | 'green' | 'pink';
  note: string;
  type: 'highlight' | 'note' | 'question';
  botReply?: string;
  timestamp: number;
}

interface TextAnnotationsPanelProps {
  annotations: TextAnnotationEntry[];
  onDelete: (id: string) => void;
  botLoading: boolean;
}

export function TextAnnotationsPanel({ annotations, onDelete, botLoading }: TextAnnotationsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const colorBg: Record<string, string> = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-emerald-50 border-emerald-200',
    pink: 'bg-pink-50 border-pink-200',
  };
  const colorAccent: Record<string, string> = {
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-400',
    green: 'bg-emerald-400',
    pink: 'bg-pink-400',
  };
  const typeIcons: Record<string, React.ReactNode> = {
    highlight: <Highlighter size={12} />,
    note: <Edit3 size={12} />,
    question: <Bot size={12} />,
  };
  const typeLabels: Record<string, string> = {
    highlight: 'Destaque',
    note: 'Anotacao',
    question: 'Pergunta ao MedBot',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-80"
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white rounded-t-xl border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <StickyNote size={16} className="text-blue-500" />
          <span className="font-bold text-sm text-gray-800">Minhas Anotacoes</span>
          <span className="text-[10px] font-bold text-white bg-blue-500 px-1.5 py-0.5 rounded-full">{annotations.length}</span>
        </div>
        <ChevronRight size={14} className={clsx("text-gray-400 transition-transform", isExpanded && "rotate-90")} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-lg max-h-80 overflow-y-auto custom-scrollbar">
              {[...annotations].reverse().map((ann) => (
                <div key={ann.id} className={clsx("p-3 border-b border-gray-100 last:border-0 relative group", colorBg[ann.color])}>
                  {/* Color indicator bar */}
                  <div className={clsx("absolute left-0 top-0 bottom-0 w-1 rounded-l", colorAccent[ann.color])} />

                  <div className="pl-2">
                    {/* Type badge + delete */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {typeIcons[ann.type]}
                        {typeLabels[ann.type]}
                      </span>
                      <button
                        onClick={() => onDelete(ann.id)}
                        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Cited text */}
                    <p className="text-xs text-gray-600 italic line-clamp-2 mb-1.5 leading-relaxed">
                      "{ann.displayText}"
                    </p>

                    {/* Note content */}
                    {ann.type === 'note' && ann.note && (
                      <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-gray-100 mt-1">
                        <p className="text-xs text-gray-700">{ann.note}</p>
                      </div>
                    )}

                    {/* Question + bot reply */}
                    {ann.type === 'question' && (
                      <div className="space-y-1.5 mt-1">
                        <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-gray-100">
                          <p className="text-xs text-gray-700 font-medium">{ann.note}</p>
                        </div>
                        {ann.botReply ? (
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg px-2.5 py-2 border border-blue-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Bot size={8} className="text-white" />
                              </div>
                              <span className="text-[10px] font-bold text-blue-600">MedBot</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">{ann.botReply}</p>
                          </div>
                        ) : botLoading ? (
                          <div className="flex items-center gap-2 text-xs text-blue-500 py-2">
                            <Loader2 size={12} className="animate-spin" />
                            <span>MedBot esta pensando...</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
