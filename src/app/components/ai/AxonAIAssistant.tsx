// ============================================================
// Axon AI Assistant — Floating panel with chat, flashcard gen,
// quiz gen, and concept explanations powered by Gemini
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/app/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Send, Sparkles, Layers, GraduationCap, BookOpen,
  Loader2, ChevronRight, Copy, Check, AlertCircle, Lightbulb,
  Brain, Zap,
} from 'lucide-react';
import clsx from 'clsx';
import * as ai from '@/app/services/aiService';
import type { ChatMessage } from '@/app/services/aiService';

// ── Extracted sub-components ──
import { AIMarkdown } from './AIMarkdown';
import { AIFlashcardsPanel } from './AIFlashcardsPanel';
import { AIQuizPanel } from './AIQuizPanel';
import { AIExplainPanel } from './AIExplainPanel';

// ── Types ─────────────────────────────────────────────────

type AssistantMode = 'chat' | 'flashcards' | 'quiz' | 'explain';

interface DisplayMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Explique o ciclo de Krebs', color: 'text-amber-500' },
  { icon: Brain, label: 'Mecanismo de ação dos betabloqueadores', color: 'text-blue-500' },
  { icon: Zap, label: 'Diferença entre artérias e veias', color: 'text-rose-500' },
];

// ── Main Component ────────────────────────────────────────

export function AxonAIAssistant({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { currentCourse, currentTopic } = useApp();

  // Chat state
  const [mode, setMode] = useState<AssistantMode>('chat');
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Flashcard mode state
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [flashcardCount, setFlashcardCount] = useState(5);
  const [generatedCards, setGeneratedCards] = useState<ai.GeneratedFlashcard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // Quiz mode state
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [generatedQuiz, setGeneratedQuiz] = useState<ai.GeneratedQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(new Map());
  const [showExplanations, setShowExplanations] = useState<Set<number>>(new Set());

  // Explain mode state
  const [explainConcept, setExplainConcept] = useState('');
  const [explanation, setExplanation] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && mode === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, mode]);

  const context: ai.ChatContext = {
    courseName: currentCourse?.name,
    topicTitle: currentTopic?.title,
  };

  // ── Chat ──

  const addMessage = (role: DisplayMessage['role'], content: string, isError = false) => {
    setMessages(prev => [
      ...prev,
      { id: `msg-${Date.now()}-${Math.random()}`, role, content, timestamp: new Date(), isError },
    ]);
  };

  const sendChat = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput('');
    addMessage('user', msg);
    setIsLoading(true);
    try {
      const history: ChatMessage[] = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role as 'user' | 'model', content: m.content }));
      history.push({ role: 'user', content: msg });
      const reply = await ai.chat(history, context);
      addMessage('model', reply);
    } catch (err: any) {
      addMessage('system', `Erro: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
  };

  // ── Flashcards ──

  const generateFlashcardsFn = async () => {
    const topic = flashcardTopic.trim() || currentTopic?.title || currentCourse?.name;
    if (!topic) return;
    setIsLoading(true);
    setGeneratedCards([]);
    setFlippedCards(new Set());
    try {
      const cards = await ai.generateFlashcards(topic, flashcardCount);
      setGeneratedCards(cards);
    } catch (err: any) {
      addMessage('system', `Erro ao gerar flashcards: ${err.message}`, true);
      setMode('chat');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Quiz ──

  const generateQuizFn = async () => {
    const topic = quizTopic.trim() || currentTopic?.title || currentCourse?.name;
    if (!topic) return;
    setIsLoading(true);
    setGeneratedQuiz([]);
    setSelectedAnswers(new Map());
    setShowExplanations(new Set());
    try {
      const questions = await ai.generateQuiz(topic, 3, quizDifficulty);
      setGeneratedQuiz(questions);
    } catch (err: any) {
      addMessage('system', `Erro ao gerar quiz: ${err.message}`, true);
      setMode('chat');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Explain ──

  const explainFn = async () => {
    const concept = explainConcept.trim();
    if (!concept) return;
    setIsLoading(true);
    setExplanation('');
    try {
      const result = await ai.explainConcept(concept, currentCourse?.name);
      setExplanation(result);
    } catch (err: any) {
      addMessage('system', `Erro ao explicar: ${err.message}`, true);
      setMode('chat');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Copy ──

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Mode reset ──

  const resetMode = (newMode: AssistantMode) => {
    setMode(newMode);
    if (newMode === 'flashcards') { setGeneratedCards([]); setFlashcardTopic(currentTopic?.title || ''); }
    if (newMode === 'quiz') { setGeneratedQuiz([]); setQuizTopic(currentTopic?.title || ''); }
    if (newMode === 'explain') { setExplanation(''); setExplainConcept(''); }
  };

  // ── Render ──

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-[#f5f6fa] shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 py-4 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Axon AI</h2>
                  <p className="text-white/60 text-xs">Powered by Gemini</p>
                </div>
              </div>
              <button onClick={onClose} className="relative w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="shrink-0 px-3 py-2 bg-white border-b border-gray-200/60 flex gap-1">
              {([
                { id: 'chat', icon: Sparkles, label: 'Chat' },
                { id: 'flashcards', icon: Layers, label: 'Flashcards' },
                { id: 'quiz', icon: GraduationCap, label: 'Quiz' },
                { id: 'explain', icon: BookOpen, label: 'Explicar' },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => resetMode(tab.id)}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
                    mode === tab.id
                      ? "bg-violet-50 text-violet-700 shadow-sm border border-violet-200/60"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {mode === 'chat' && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar-light px-4 py-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8 space-y-6">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center border border-violet-200/60">
                          <Sparkles size={28} className="text-violet-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Como posso ajudar?</h3>
                          <p className="text-gray-400 text-sm mt-1">Pergunte sobre qualquer tópico de medicina</p>
                        </div>
                        <div className="space-y-2 max-w-sm mx-auto">
                          {QUICK_PROMPTS.map((prompt, i) => (
                            <button key={i} onClick={() => sendChat(prompt.label)} className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200/60 hover:border-violet-300 hover:shadow-sm transition-all text-left group">
                              <prompt.icon size={16} className={prompt.color} />
                              <span className="text-sm text-gray-600 group-hover:text-gray-800 flex-1">{prompt.label}</span>
                              <ChevronRight size={14} className="text-gray-300 group-hover:text-violet-400 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map(msg => (
                      <div key={msg.id} className={clsx("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {msg.role !== 'user' && (
                          <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", msg.isError ? "bg-red-100" : "bg-gradient-to-br from-violet-500 to-purple-600")}>
                            {msg.isError ? <AlertCircle size={14} className="text-red-500" /> : <Sparkles size={12} className="text-white" />}
                          </div>
                        )}
                        <div className={clsx(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative group",
                          msg.role === 'user' ? "bg-violet-600 text-white rounded-br-md"
                            : msg.isError ? "bg-red-50 text-red-700 border border-red-100 rounded-bl-md"
                            : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md"
                        )}>
                          <AIMarkdown text={msg.content} />
                          {msg.role === 'model' && (
                            <button onClick={() => copyText(msg.content, msg.id)} className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md border border-gray-200 rounded-lg p-1.5 text-gray-400 hover:text-violet-500">
                              {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                          <Sparkles size={12} className="text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="shrink-0 p-3 bg-white border-t border-gray-200/60">
                    {(currentCourse || currentTopic) && (
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Contexto:</span>
                        <span className="text-[11px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full border border-violet-200/60">
                          {currentTopic?.title || currentCourse?.name}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 items-end">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pergunte sobre medicina..."
                        rows={1}
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 resize-none"
                        style={{ maxHeight: '120px' }}
                      />
                      <button
                        onClick={() => sendChat()}
                        disabled={!input.trim() || isLoading}
                        className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                          input.trim() && !isLoading
                            ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                            : "bg-gray-100 text-gray-300"
                        )}
                      >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {mode === 'flashcards' && (
                <AIFlashcardsPanel
                  topic={flashcardTopic}
                  setTopic={setFlashcardTopic}
                  count={flashcardCount}
                  setCount={setFlashcardCount}
                  cards={generatedCards}
                  flippedCards={flippedCards}
                  setFlippedCards={setFlippedCards}
                  isLoading={isLoading}
                  onGenerate={generateFlashcardsFn}
                  onReset={() => setGeneratedCards([])}
                  currentTopicTitle={currentTopic?.title}
                />
              )}

              {mode === 'quiz' && (
                <AIQuizPanel
                  topic={quizTopic}
                  setTopic={setQuizTopic}
                  difficulty={quizDifficulty}
                  setDifficulty={setQuizDifficulty}
                  questions={generatedQuiz}
                  selectedAnswers={selectedAnswers}
                  setSelectedAnswers={setSelectedAnswers}
                  showExplanations={showExplanations}
                  setShowExplanations={setShowExplanations}
                  isLoading={isLoading}
                  onGenerate={generateQuizFn}
                  onReset={() => setGeneratedQuiz([])}
                  currentTopicTitle={currentTopic?.title}
                />
              )}

              {mode === 'explain' && (
                <AIExplainPanel
                  concept={explainConcept}
                  setConcept={setExplainConcept}
                  explanation={explanation}
                  isLoading={isLoading}
                  onExplain={explainFn}
                  onReset={() => { setExplanation(''); setExplainConcept(''); }}
                  onCopy={copyText}
                  copiedId={copiedId}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}