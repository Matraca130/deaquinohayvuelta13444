import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  BookOpen,
  MessageSquare,
  Sparkles,
  Pen,
  Plus,
  X,
  Trash2,
  Box,
  Send,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { useSmartPopupPosition } from '@/app/hooks/useSmartPopupPosition';
import {
  KeywordData,
  MasteryLevel,
  masteryConfig,
} from '@/app/data/keywords';
import { AIQuestionItem } from '@/app/components/shared/AIQuestionItem';

// ─── Editable Keyword (Pop-up de Palavra-chave) ─────────────────────────────
//
// Componente de keyword interativo no texto de resumo. Ao clicar, abre um
// pop-up portal com definição, FAQ, perguntas ao MedBot, e anotações
// pessoais. Extraído de SummarySessionNew.tsx para legibilidade.
// ─────────────────────────────────────────────────────────────────────────────

export interface EditableKeywordProps {
  keywordData: KeywordData;
  mastery: MasteryLevel;
  onMasteryChange: (term: string, level: MasteryLevel) => void;
  personalNotes: string[];
  onUpdateNotes: (term: string, notes: string[]) => void;
  onView3D?: () => void;
}

export function EditableKeyword({
  keywordData,
  mastery,
  onMasteryChange,
  personalNotes,
  onUpdateNotes,
  onView3D,
}: EditableKeywordProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [askingAI, setAskingAI] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    definition: true,
    faq: false,
    ask: false,
  });
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const config = masteryConfig[mastery];

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Smart positioning
  const position = useSmartPopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    gap: 12,
    margin: 8,
  });

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current && !popupRef.current.contains(event.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updated = [...personalNotes, newNote.trim()];
      onUpdateNotes(keywordData.term, updated);
      setNewNote('');
    }
  };

  const handleDeleteNote = (index: number) => {
    const updated = personalNotes.filter((_, i) => i !== index);
    onUpdateNotes(keywordData.term, updated);
  };

  // Mock AI answer for user questions
  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;
    setAskingAI(true);
    setAiAnswer(null);
    // Simulate AI response delay
    setTimeout(() => {
      setAiAnswer(`Com base na literatura medica, "${keywordData.term}" e um conceito fundamental. ${keywordData.definition} Para uma compreensao mais aprofundada, recomenda-se consultar o material de referencia e correlacionar com casos clinicos relevantes.`);
      setAskingAI(false);
    }, 1500);
  };

  // Arrow styles
  const getArrowStyles = () => {
    if (!position.placement) return {};
    const p = position.placement;
    if (p.startsWith('top')) {
      return {
        bottom: '-6px',
        left: position.arrowLeft ? `${position.arrowLeft}px` : '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        borderBottom: '1px solid #e5e7eb',
        borderRight: '1px solid #e5e7eb',
      };
    }
    if (p.startsWith('bottom')) {
      return {
        top: '-6px',
        left: position.arrowLeft ? `${position.arrowLeft}px` : '50%',
        transform: 'translateX(-50%) rotate(-135deg)',
        borderTop: '1px solid #e5e7eb',
        borderLeft: '1px solid #e5e7eb',
      };
    }
    if (p.startsWith('left')) {
      return {
        right: '-6px',
        top: position.arrowTop ? `${position.arrowTop}px` : '50%',
        transform: 'translateY(-50%) rotate(-45deg)',
        borderTop: '1px solid #e5e7eb',
        borderRight: '1px solid #e5e7eb',
      };
    }
    if (p.startsWith('right')) {
      return {
        left: '-6px',
        top: position.arrowTop ? `${position.arrowTop}px` : '50%',
        transform: 'translateY(-50%) rotate(135deg)',
        borderBottom: '1px solid #e5e7eb',
        borderLeft: '1px solid #e5e7eb',
      };
    }
    return {};
  };

  return (
    <span className="relative inline" ref={anchorRef}>
      {/* Keyword in text — colored by mastery */}
      <span
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "cursor-pointer underline underline-offset-[3px] decoration-2 transition-all duration-200",
          config.textColor,
          config.underlineClass,
          isOpen && `${config.bgLight} rounded px-0.5 -mx-0.5`
        )}
      >
        {keywordData.term}
      </span>

      {/* Pop-up via Portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              ref={popupRef}
              className="fixed w-[420px] flex flex-col max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
            >
              {/* ── Header ── */}
              <div className={clsx("px-5 pt-4 pb-3 border-b", config.borderColor, config.headerBg)}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={clsx("w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm", config.bgDot)} />
                    <h3 className="font-bold text-gray-900 uppercase tracking-wide text-base">
                      {keywordData.term}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {keywordData.has3DModel && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onView3D?.();
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar em 3D"
                      >
                        <Box size={13} />
                        <span>Modelo 3D</span>
                      </button>
                    )}
                    <div className={clsx(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium",
                      config.bgLight, config.textColor, config.borderColor, "border"
                    )}>
                      <span className={clsx("w-1.5 h-1.5 rounded-full", config.bgDot)} />
                      {mastery === 'green' ? 'Dominado' : mastery === 'yellow' ? 'Parcial' : 'Nao dominado'}
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Mastery Level Selector */}
                <div className="flex flex-col gap-2.5">

                  {/* Tab switcher: Axon vs Minhas Anotações + Mastery badge */}
                  <div className="flex items-center gap-1.5 pt-2.5 border-t border-black/5">
                    {/* Axon tab */}
                    <button
                      onClick={() => setShowNotes(false)}
                      className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                        !showNotes
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 border border-transparent"
                      )}
                    >
                      <Sparkles size={10} />
                      AXON
                    </button>

                    {/* Minhas Anotações tab */}
                    <button
                      onClick={() => setShowNotes(true)}
                      className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                        showNotes
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 border border-transparent"
                      )}
                    >
                      <Pen size={10} />
                      Minhas Anotacoes
                      {personalNotes.length > 0 && (
                        <span className={clsx(
                          "px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                          showNotes
                            ? "bg-emerald-200 text-emerald-800"
                            : "bg-gray-200 text-gray-500"
                        )}>
                          {personalNotes.length}
                        </span>
                      )}
                    </button>

                    {/* Mastery status badge - moved to header */}
                  </div>
                </div>
              </div>

              {/* ── Body (scrollable) ── */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2">
                {!showNotes ? (
                  <>
                    {/* ── Axon Tab Content — Accordion Sections ── */}

                    {/* ── 1. Definição ── */}
                    <div className="border rounded-lg border-gray-100 bg-gray-50/50 overflow-hidden transition-all hover:border-gray-200 group/sec">
                      <button
                        onClick={() => toggleSection('definition')}
                        className="w-full text-left px-3.5 py-3 flex items-center gap-3"
                      >
                        <div className={clsx(
                          "p-0.5 rounded transition-colors duration-200 shrink-0",
                          openSections.definition ? "bg-gray-200 text-gray-600" : "bg-gray-200 text-gray-400 group-hover/sec:bg-gray-300 group-hover/sec:text-gray-600"
                        )}>
                          <ChevronRight
                            size={14}
                            className={clsx(
                              "transition-transform duration-200",
                              openSections.definition && "rotate-90"
                            )}
                          />
                        </div>
                        <BookOpen size={13} className={clsx(
                          "shrink-0 transition-colors duration-200",
                          openSections.definition ? "text-gray-600" : "text-gray-400"
                        )} />
                        <span className={clsx(
                          "text-[11px] font-bold uppercase tracking-widest transition-colors duration-200",
                          openSections.definition ? "text-gray-700" : "text-gray-500 group-hover/sec:text-gray-700"
                        )}>
                          Definicao
                        </span>
                      </button>
                      <AnimatePresence>
                        {openSections.definition && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3.5 pb-3.5 pl-[42px]">
                              <div className="pt-2 border-t border-gray-100/50">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {keywordData.definition}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ── 2. Perguntas Mais Feitas ── */}
                    <div className="border rounded-lg border-blue-100/60 bg-blue-50/20 overflow-hidden transition-all hover:border-blue-200/80 group/sec">
                      <button
                        onClick={() => toggleSection('faq')}
                        className="w-full text-left px-3.5 py-3 flex items-center gap-3"
                      >
                        <div className={clsx(
                          "p-0.5 rounded transition-colors duration-200 shrink-0",
                          openSections.faq ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400 group-hover/sec:bg-blue-50 group-hover/sec:text-blue-500"
                        )}>
                          <ChevronRight
                            size={14}
                            className={clsx(
                              "transition-transform duration-200",
                              openSections.faq && "rotate-90"
                            )}
                          />
                        </div>
                        <MessageSquare size={13} className={clsx(
                          "shrink-0 transition-colors duration-200",
                          openSections.faq ? "text-blue-600" : "text-gray-400 group-hover/sec:text-blue-500"
                        )} />
                        <span className={clsx(
                          "text-[11px] font-bold uppercase tracking-widest transition-colors duration-200 flex-1",
                          openSections.faq ? "text-blue-700" : "text-gray-500 group-hover/sec:text-blue-600"
                        )}>
                          Perguntas Mais Feitas
                        </span>
                        <span className="text-[9px] text-blue-400 bg-blue-100/60 px-1.5 py-0.5 rounded-full font-medium">
                          {keywordData.aiQuestions.length}
                        </span>
                      </button>
                      <AnimatePresence>
                        {openSections.faq && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3.5 pb-3.5 pl-[42px]">
                              <div className="pt-2 border-t border-blue-100/30 space-y-2">
                                {keywordData.aiQuestions.map((q, i) => (
                                  <AIQuestionItem key={i} question={q} />
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ── 3. Fazer Pergunta ── */}
                    <div className="border rounded-lg border-violet-100/60 bg-violet-50/20 overflow-hidden transition-all hover:border-violet-200/80 group/sec">
                      <button
                        onClick={() => toggleSection('ask')}
                        className="w-full text-left px-3.5 py-3 flex items-center gap-3"
                      >
                        <div className={clsx(
                          "p-0.5 rounded transition-colors duration-200 shrink-0",
                          openSections.ask ? "bg-violet-100 text-violet-600" : "bg-gray-200 text-gray-400 group-hover/sec:bg-violet-50 group-hover/sec:text-violet-500"
                        )}>
                          <ChevronRight
                            size={14}
                            className={clsx(
                              "transition-transform duration-200",
                              openSections.ask && "rotate-90"
                            )}
                          />
                        </div>
                        <Sparkles size={13} className={clsx(
                          "shrink-0 transition-colors duration-200",
                          openSections.ask ? "text-violet-600" : "text-gray-400 group-hover/sec:text-violet-500"
                        )} />
                        <span className={clsx(
                          "text-[11px] font-bold uppercase tracking-widest transition-colors duration-200",
                          openSections.ask ? "text-violet-700" : "text-gray-500 group-hover/sec:text-violet-600"
                        )}>
                          Fazer Pergunta
                        </span>
                      </button>
                      <AnimatePresence>
                        {openSections.ask && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3.5 pb-3.5 pl-[42px]">
                              <div className="pt-2 border-t border-violet-100/30 space-y-2.5">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={userQuestion}
                                    onChange={(e) => setUserQuestion(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAskQuestion();
                                    }}
                                    placeholder={`Pergunte sobre ${keywordData.term}...`}
                                    disabled={askingAI}
                                    className="flex-1 pl-3 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all placeholder:text-gray-400 disabled:opacity-50"
                                  />
                                  <button
                                    onClick={handleAskQuestion}
                                    disabled={!userQuestion.trim() || askingAI}
                                    className={clsx(
                                      "flex items-center justify-center px-3 py-2 rounded-lg transition-all",
                                      !userQuestion.trim() || askingAI
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-violet-500 text-white hover:bg-violet-600 active:scale-95 shadow-sm"
                                    )}
                                  >
                                    {askingAI ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                  </button>
                                </div>

                                {/* AI Response */}
                                <AnimatePresence>
                                  {(askingAI || aiAnswer) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg">
                                        {askingAI ? (
                                          <div className="flex items-center gap-2 text-sm text-violet-600">
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>MedBot esta pensando...</span>
                                          </div>
                                        ) : aiAnswer ? (
                                          <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                              <Sparkles size={11} className="text-violet-500" />
                                              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">MedBot</span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{aiAnswer}</p>
                                            <button
                                              onClick={() => { setAiAnswer(null); setUserQuestion(''); }}
                                              className="mt-2 text-[10px] text-violet-500 hover:text-violet-700 transition-colors"
                                            >
                                              Limpar resposta
                                            </button>
                                          </div>
                                        ) : null}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 3D Button */}
                    {/* (moved to header) */}
                  </>
                ) : (
                  <>
                    {/* ── Minhas Anotações Tab Content ── */}
                    {/* Notes list */}
                    {personalNotes.length > 0 ? (
                      <div className="space-y-1.5">
                        {personalNotes.map((note, i) => (
                          <div key={i} className="flex items-start gap-2.5 py-2 px-2.5 rounded-lg group hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <p className="text-sm text-gray-700 flex-1 leading-snug">{note}</p>
                            <button
                              onClick={() => handleDeleteNote(i)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5 shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <Pen size={28} className="mb-2 opacity-40" />
                        <p className="text-sm">Nenhuma anotacao ainda.</p>
                        <p className="text-xs mt-1">Use o campo abaixo para adicionar.</p>
                      </div>
                    )}

                    {/* Add note input — always visible */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNote();
                        }}
                        placeholder="Escrever anotacao pessoal..."
                        className="flex-1 pl-3 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-gray-400"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className={clsx(
                          "flex items-center justify-center px-3 py-2.5 rounded-lg transition-all text-xs font-medium",
                          !newNote.trim()
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-sm"
                        )}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Arrow pointer */}
              <span
                className="absolute w-3 h-3 bg-white border-gray-200"
                style={getArrowStyles()}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
}
