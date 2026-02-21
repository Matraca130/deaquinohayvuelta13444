import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { AIQuestion } from '@/app/data/keywords';

// ─── AI Question Item (FAQ Style) ───────────────────────────────────────────
//
// Accordion item para perguntas frequentes dentro do pop-up
// de keyword. Extraído de SummarySessionNew.tsx para reutilização.
// ─────────────────────────────────────────────────────────────────────────────

export function AIQuestionItem({ question }: { question: AIQuestion }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg border-gray-100 bg-gray-50/50 overflow-hidden transition-all hover:bg-gray-50 hover:border-blue-100 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 flex items-start gap-3"
      >
        <div className={clsx(
          "mt-0.5 p-0.5 rounded transition-colors duration-200 shrink-0",
          isOpen ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"
        )}>
          <ChevronRight
            size={14}
            className={clsx(
              "transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        </div>
        <span className={clsx(
          "text-sm font-medium transition-colors duration-200",
          isOpen ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
        )}>
          {question.question}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pl-[38px] text-sm text-gray-600 leading-relaxed">
              <div className="pt-2 border-t border-gray-100/50">
                {question.answer || 'Baseado na literatura, esta e uma questao que requer analise aprofundada do contexto anatomico e clinico. Consulte o material de referencia para uma resposta completa.'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
