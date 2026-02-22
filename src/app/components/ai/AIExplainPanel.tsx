// ============================================================
// AIExplainPanel — Deep explanation view for Axon AI
// Extracted from AxonAIAssistant.tsx
// ============================================================
import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Loader2, ArrowLeft, RotateCcw, Copy, Check } from 'lucide-react';
import { AIMarkdown } from './AIMarkdown';

interface AIExplainPanelProps {
  concept: string;
  setConcept: (v: string) => void;
  explanation: string;
  isLoading: boolean;
  onExplain: () => void;
  onReset: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}

const SUGGESTIONS = [
  'Sistema Renina-Angiotensina-Aldosterona',
  'Ciclo de Krebs e fosforilacao oxidativa',
  'Mecanismo de Frank-Starling',
];

export function AIExplainPanel({
  concept,
  setConcept,
  explanation,
  isLoading,
  onExplain,
  onReset,
  onCopy,
  copiedId,
}: AIExplainPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar-light px-4 py-4 space-y-4">
      {!explanation ? (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-200/60 mb-3">
              <BookOpen size={24} className="text-emerald-500" />
            </div>
            <h3 className="font-bold text-gray-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Explicacao Profunda
            </h3>
            <p className="text-gray-400 text-xs mt-1">IA explica qualquer conceito medico em detalhes</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200/60 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Conceito</label>
              <textarea
                value={concept}
                onChange={e => setConcept(e.target.value)}
                placeholder="Ex: Potencial de acao no neuronio"
                rows={3}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
              />
            </div>
            <button
              onClick={onExplain}
              disabled={!concept.trim() || isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-sm shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
              {isLoading ? 'Analisando...' : 'Explicar Conceito'}
            </button>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sugestoes</span>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setConcept(s)}
                className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200/60 text-sm text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={onReset} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft size={14} /> Voltar
            </button>
            <button
              onClick={() => onCopy(explanation, 'explanation')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-500"
            >
              {copiedId === 'explanation' ? <Check size={12} /> : <Copy size={12} />}
              Copiar
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <BookOpen size={14} className="text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">{concept}</h4>
                <p className="text-[10px] text-gray-400">Explicacao gerada por Axon AI</p>
              </div>
            </div>
            <div className="prose prose-sm prose-gray max-w-none text-sm leading-relaxed text-gray-700">
              <AIMarkdown text={explanation} />
            </div>
          </motion.div>

          <button
            onClick={onReset}
            className="w-full py-2.5 border-2 border-dashed border-emerald-300/60 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} /> Novo Conceito
          </button>
        </div>
      )}
    </div>
  );
}
