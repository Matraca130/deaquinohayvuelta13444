// ============================================================
// AIFlashcardsPanel — Flashcard generation view for Axon AI
// Extracted from AxonAIAssistant.tsx
// ============================================================
import React from 'react';
import { motion } from 'motion/react';
import { Layers, Sparkles, Loader2, ArrowLeft, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import type { GeneratedFlashcard } from '@/app/services/aiService';

interface AIFlashcardsPanelProps {
  topic: string;
  setTopic: (v: string) => void;
  count: number;
  setCount: (n: number) => void;
  cards: GeneratedFlashcard[];
  flippedCards: Set<number>;
  setFlippedCards: (s: Set<number>) => void;
  isLoading: boolean;
  onGenerate: () => void;
  onReset: () => void;
  currentTopicTitle?: string;
}

export function AIFlashcardsPanel({
  topic,
  setTopic,
  count,
  setCount,
  cards,
  flippedCards,
  setFlippedCards,
  isLoading,
  onGenerate,
  onReset,
  currentTopicTitle,
}: AIFlashcardsPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar-light px-4 py-4 space-y-4">
      {cards.length === 0 ? (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200/60 mb-3">
              <Layers size={24} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Gerar Flashcards com IA
            </h3>
            <p className="text-gray-400 text-xs mt-1">Crie flashcards de alta qualidade para qualquer t\u00f3pico</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200/60 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">T\u00f3pico</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={currentTopicTitle || "Ex: Fisiologia Renal"}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Quantidade</label>
              <div className="flex gap-2">
                {[3, 5, 8, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={clsx(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      count === n
                        ? "bg-violet-100 text-violet-700 border border-violet-300"
                        : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isLoading ? 'Gerando...' : 'Gerar Flashcards'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={onReset} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft size={14} /> Voltar
            </button>
            <span className="text-xs text-gray-400">{cards.length} flashcards gerados</span>
          </div>

          {cards.map((card, i) => {
            const isFlipped = flippedCards.has(i);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  const next = new Set(flippedCards);
                  isFlipped ? next.delete(i) : next.add(i);
                  setFlippedCards(next);
                }}
                className="cursor-pointer"
              >
                <div className={clsx(
                  "rounded-xl p-4 border transition-all min-h-[100px] flex flex-col justify-center",
                  isFlipped
                    ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                    : "bg-white border-gray-200/60 hover:border-violet-300 hover:shadow-sm"
                )}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={clsx(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      isFlipped ? "bg-emerald-100 text-emerald-600" : "bg-violet-100 text-violet-600"
                    )}>
                      {isFlipped ? 'Resposta' : `Pergunta ${i + 1}`}
                    </span>
                    <RotateCcw size={12} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {isFlipped ? card.back : card.front}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <button
            onClick={onGenerate}
            className="w-full py-2.5 border-2 border-dashed border-violet-300/60 text-violet-600 rounded-xl text-sm font-medium hover:bg-violet-50 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} /> Gerar Novos
          </button>
        </div>
      )}
    </div>
  );
}
