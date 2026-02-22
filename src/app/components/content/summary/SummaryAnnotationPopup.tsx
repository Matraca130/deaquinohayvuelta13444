// ============================================================
// SummaryAnnotationPopup — Floating popup for text annotations
// (highlight / note / AI question) in the summary viewer.
// Extracted from SummarySessionNew.tsx for modularity.
// ============================================================
import React from 'react';
import { motion } from 'motion/react';
import {
  StickyNote, X, Highlighter, Edit3, Bot,
  Loader2, Send,
} from 'lucide-react';
import clsx from 'clsx';
import type { AnnotationColor, AnnotationType, PendingAnnotation } from '@/app/hooks/useTextAnnotations';

type AnnotationTab = AnnotationType;

interface SummaryAnnotationPopupProps {
  pending: PendingAnnotation;
  onClose: () => void;
  activeTab: AnnotationTab;
  setActiveTab: (t: AnnotationTab) => void;
  color: AnnotationColor;
  setColor: (c: AnnotationColor) => void;
  noteInput: string;
  setNoteInput: (v: string) => void;
  questionInput: string;
  setQuestionInput: (v: string) => void;
  botLoading: boolean;
  onCreate: (text: string, type: AnnotationType, note: string, color: AnnotationColor) => void;
}

const HIGHLIGHT_STYLES: Record<string, React.CSSProperties> = {
  yellow: { background: 'linear-gradient(to bottom, transparent 40%, #fde047 40%, #fde047 85%, transparent 85%)' },
  blue:   { background: 'linear-gradient(to bottom, transparent 40%, #93c5fd 40%, #93c5fd 85%, transparent 85%)' },
  green:  { background: 'linear-gradient(to bottom, transparent 40%, #6ee7b7 40%, #6ee7b7 85%, transparent 85%)' },
  pink:   { background: 'linear-gradient(to bottom, transparent 40%, #f9a8d4 40%, #f9a8d4 85%, transparent 85%)' },
};

const COLOR_OPTIONS = ['yellow', 'blue', 'green', 'pink'] as const;

export function SummaryAnnotationPopup({
  pending,
  onClose,
  activeTab,
  setActiveTab,
  color,
  setColor,
  noteInput,
  setNoteInput,
  questionInput,
  setQuestionInput,
  botLoading,
  onCreate,
}: SummaryAnnotationPopupProps) {
  const tabs: Array<{ key: AnnotationTab; icon: React.ReactNode; label: string }> = [
    { key: 'highlight', icon: <Highlighter size={14} />, label: 'Destacar' },
    { key: 'note',      icon: <Edit3 size={14} />,       label: 'Anotar' },
    { key: 'question',  icon: <Bot size={14} />,         label: 'Perguntar' },
  ];

  const previewText = pending.text.length > 60 ? pending.text.slice(0, 60) + '\u2026' : pending.text;
  const citedText = pending.text.length > 150 ? pending.text.slice(0, 150) + '\u2026' : pending.text;

  return (
    <div
      id="text-annotation-popup"
      className="fixed z-[9999]"
      style={{
        top: Math.min(pending.rect.bottom + 8, window.innerHeight - 420),
        left: Math.max(12, Math.min(pending.rect.left, window.innerWidth - 380)),
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <StickyNote size={16} className="text-blue-500" />
            <span className="font-bold text-sm text-gray-800">Anotar Trecho</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        </div>

        {/* Cited text */}
        <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/30">
          <p className="text-xs text-gray-500 mb-1 font-medium">Trecho selecionado:</p>
          <p className="text-sm text-gray-700 italic line-clamp-3 leading-relaxed">
            &ldquo;{citedText}&rdquo;
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all border-b-2",
                activeTab === tab.key
                  ? "text-blue-600 border-blue-500 bg-blue-50/50"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'highlight' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Escolha uma cor de marca-texto:</p>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map(c => {
                  const colorStyles: Record<string, string> = {
                    yellow: 'bg-yellow-300 ring-yellow-400',
                    blue: 'bg-blue-300 ring-blue-400',
                    green: 'bg-emerald-300 ring-emerald-400',
                    pink: 'bg-pink-300 ring-pink-400',
                  };
                  return (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={clsx(
                        "w-9 h-9 rounded-full transition-all border-2",
                        colorStyles[c],
                        color === c ? "ring-2 ring-offset-2 scale-110 border-gray-600" : "hover:scale-105 border-transparent"
                      )}
                    />
                  );
                })}
              </div>
              {/* Preview */}
              <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Preview</p>
                <span
                  className="text-sm text-gray-700"
                  style={{ ...HIGHLIGHT_STYLES[color], padding: '0 2px' }}
                >
                  {previewText}
                </span>
              </div>
              <button
                onClick={() => onCreate(pending.text, 'highlight', '', color)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Highlighter size={14} />
                Destacar Trecho
              </button>
            </div>
          )}

          {activeTab === 'note' && (
            <div className="space-y-3">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Escreva sua anotacao sobre este trecho..."
                className="w-full h-24 px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 placeholder:text-gray-400"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {COLOR_OPTIONS.map(c => {
                    const colorStyles: Record<string, string> = {
                      yellow: 'bg-yellow-300',
                      blue: 'bg-blue-300',
                      green: 'bg-emerald-300',
                      pink: 'bg-pink-300',
                    };
                    return (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={clsx(
                          "w-5 h-5 rounded-full transition-all",
                          colorStyles[c],
                          color === c ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "hover:scale-105"
                        )}
                      />
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    if (noteInput.trim()) {
                      onCreate(pending.text, 'note', noteInput.trim(), color);
                    }
                  }}
                  disabled={!noteInput.trim()}
                  className={clsx(
                    "ml-auto py-2 px-4 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2",
                    noteInput.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Edit3 size={14} />
                  Salvar Nota
                </button>
              </div>
            </div>
          )}

          {activeTab === 'question' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold text-gray-700">MedBot</span>
                <span className="text-[10px] text-gray-400">IA Assistente</span>
              </div>
              <textarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Pergunte algo sobre este trecho ao MedBot..."
                className="w-full h-20 px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-gray-50 placeholder:text-gray-400"
                autoFocus
              />
              <button
                onClick={() => {
                  const question = questionInput.trim() || 'Explique este trecho em detalhes';
                  onCreate(pending.text, 'question', question, 'blue');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              >
                {botLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Pensando...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Perguntar ao MedBot
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
