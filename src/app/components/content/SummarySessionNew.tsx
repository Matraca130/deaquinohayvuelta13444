import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { headingStyle, components, iconClasses } from '@/app/design-system';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Loader2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Layers,
  CheckCircle2,
  AlertCircle,
  Pen,
  Box,
} from 'lucide-react';
import clsx from 'clsx';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { getStudyContent } from '@/app/data/studyContent';
import { useApp } from '@/app/context/AppContext';
import {
  masteryConfig,
  findKeyword,
  getAllKeywordTerms
} from '@/app/data/keywords';
import { getSectionImage } from '@/app/data/sectionImages';
import type { Model3D } from '@/app/data/courses';

// ── Hook imports ──
import { useSummaryTimer } from '@/app/hooks/useSummaryTimer';
import { useKeywordMastery } from '@/app/hooks/useKeywordMastery';
import { useTextAnnotations } from '@/app/hooks/useTextAnnotations';
import { useSummaryPersistence } from '@/app/hooks/useSummaryPersistence';
import { useSummaryViewer } from '@/app/hooks/useSummaryViewer';
import { useStudentDataContext } from '@/app/context/StudentDataContext';

// ── Extracted sub-components ──
import { EditableKeyword } from '@/app/components/shared/EditableKeyword';
import { TextAnnotationsPanel } from '@/app/components/shared/TextAnnotationsPanel';
import { SummaryToolbar } from './summary/SummaryToolbar';
import { SummaryAnnotationPopup } from './summary/SummaryAnnotationPopup';

// ─── Summary Session (Sessao de Resumo) ──────────────────────────────────────

export function SummarySession({ onBack, onStartFlashcards, topic, courseColor, accentColor }: any) {
  const { setActiveView, currentCourse, setQuizAutoStart } = useApp();
  const { studentId } = useStudentDataContext();

  // Study content (needed for section count before viewer hook)
  const studyContent = getStudyContent(topic.id);
  const sections = studyContent?.sections || [];

  // ── Hooks: all business logic extracted ──
  const timer = useSummaryTimer();
  const keywords = useKeywordMastery();
  const annotations = useTextAnnotations();
  const viewer = useSummaryViewer(sections.length);

  const { summaryLoaded, saveStatus } = useSummaryPersistence({
    studentId,
    courseId: currentCourse?.id,
    topicId: topic?.id,
    courseName: currentCourse?.name || '',
    topicTitle: topic?.title || '',
    textAnnotations: annotations.textAnnotations,
    keywordMastery: keywords.keywordMastery,
    personalNotes: keywords.personalNotes,
    sessionElapsed: timer.sessionElapsed,
    setTextAnnotations: annotations.setTextAnnotations,
    setKeywordMastery: keywords.setKeywordMastery,
    setPersonalNotes: keywords.setPersonalNotes,
    setSessionElapsed: timer.setSessionElapsed,
  });

  // ── Aliases for backward compatibility with JSX below ──
  const { sessionElapsed, isTimerRunning, formatTime } = timer;
  const { keywordMastery, personalNotes, handleMasteryChange, handleUpdateNotes, getAnnotationStats, getAnnotatedKeywords } = keywords;
  const {
    textAnnotations, pendingAnnotation, annotationNoteInput, annotationQuestionInput,
    annotationBotLoading, annotationActiveTab, annotationColor, highlighterStyles,
    setPendingAnnotation, setAnnotationNoteInput, setAnnotationQuestionInput,
    setAnnotationActiveTab, setAnnotationColor, createTextAnnotation, deleteTextAnnotation,
  } = annotations;
  const {
    zoom, isFullscreen, currentSection, showOutline, setShowOutline,
    activeTool, setActiveTool, highlightColor,
    showAnnotations, setShowAnnotations, mounted, scrollContainerRef,
    handleZoomIn, handleZoomOut, toggleFullscreen, scrollToSection,
  } = viewer;

  // Collect all 3D models from the current course
  const related3DModels = useMemo(() => {
    const models: { topicTitle: string; model: Model3D; sectionTitle: string }[] = [];
    for (const semester of currentCourse.semesters) {
      for (const section of semester.sections) {
        for (const t of section.topics) {
          if (t.model3D) {
            models.push({
              topicTitle: t.title,
              model: t.model3D,
              sectionTitle: section.title,
            });
          }
        }
      }
    }
    return models;
  }, [currentCourse]);

  const handleView3D = () => {
    setActiveView('3d');
  };

  // ── Keyword text parsing ──

  const parseTextWithKeywords = (text: string) => {
    const allTerms = getAllKeywordTerms();
    const parts: Array<{ type: string; content: string; index: number }> = [];
    let currentIndex = 0;
    const lowerText = text.toLowerCase();

    allTerms.forEach(term => {
      const escapedTerm = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const termRegex = new RegExp(`(?<!\\p{L})${escapedTerm}(?!\\p{L})`, 'giu');
      let match;
      while ((match = termRegex.exec(lowerText)) !== null) {
        if (match.index > currentIndex) {
          parts.push({ type: 'text', content: text.substring(currentIndex, match.index), index: currentIndex });
        }
        const actualTerm = text.substring(match.index, match.index + term.length);
        parts.push({ type: 'keyword', content: actualTerm, index: match.index });
        currentIndex = match.index + term.length;
      }
    });

    if (currentIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(currentIndex), index: currentIndex });
    }

    const sortedParts = parts.sort((a, b) => a.index - b.index);
    const cleanParts: typeof parts = [];
    let lastEnd = 0;
    sortedParts.forEach(part => {
      if (part.index >= lastEnd) {
        cleanParts.push(part);
        lastEnd = part.index + part.content.length;
      }
    });

    return cleanParts.length === 0
      ? [{ type: 'text', content: text, index: 0 }]
      : cleanParts;
  };

  const renderTextWithKeywords = (text: string) => {
    const parts = parseTextWithKeywords(text);
    return parts.map((part, index) => {
      if (part.type === 'keyword') {
        const kwData = findKeyword(part.content);
        if (kwData) {
          const currentMastery = keywordMastery[kwData.term] || kwData.masteryLevel;
          const notes = personalNotes[kwData.term] || [];
          return (
            <EditableKeyword
              key={`${part.content}-${part.index}-${index}`}
              keywordData={kwData}
              mastery={currentMastery}
              onMasteryChange={handleMasteryChange}
              personalNotes={notes}
              onUpdateNotes={handleUpdateNotes}
              onView3D={kwData.has3DModel ? handleView3D : undefined}
            />
          );
        }
      }
      const matchedAnn = textAnnotations.find(a => a.originalText === part.content);
      return (
        <span
          key={`text-${part.index}-${index}`}
          className={clsx(
            "cursor-pointer transition-all duration-150",
            !matchedAnn && "hover:bg-blue-50/50 rounded-sm"
          )}
          style={matchedAnn ? {
            ...highlighterStyles[matchedAnn.color],
            borderRadius: '2px',
            padding: '0 1px',
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
          } as React.CSSProperties : undefined}
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setPendingAnnotation({ text: part.content, rect });
            setAnnotationActiveTab('highlight');
          }}
          title={matchedAnn ? "Trecho anotado — clique para editar" : "Clique para anotar este trecho"}
        >
          {part.content}
        </span>
      );
    });
  };

  // ── Shared paragraph renderer (DRY) ──

  const renderParagraphs = (content: string) =>
    content.split('\n\n').map((paragraph: string, pIndex: number) => {
      if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
        const headingText = paragraph.trim().replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/:/g, '');
        return (
          <h3 key={pIndex} className="text-xl font-bold text-gray-800 mt-8 mb-4">
            {headingText}
          </h3>
        );
      }
      if (paragraph.trim().startsWith('*') && paragraph.includes(':')) {
        const parts = paragraph.split(':');
        const heading = parts[0].replace(/^\*/, '').trim();
        const contentText = parts.slice(1).join(':').trim();
        return (
          <div key={pIndex} className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-1 text-base">{heading}</h4>
            <div className="text-gray-600 leading-relaxed">{renderTextWithKeywords(contentText)}</div>
          </div>
        );
      }
      return (
        <div key={pIndex} className="mb-4 text-justify leading-relaxed text-gray-600">
          {renderTextWithKeywords(paragraph)}
        </div>
      );
    });

  // ─── Quiz / Flashcard shortcuts ───

  const quizCount = topic?.quizzes?.length || 0;
  const flashcardCount = topic?.flashcards?.length || 0;
  const hasQuiz = quizCount > 0;
  const hasFlashcards = flashcardCount > 0;

  const handleGoToQuiz = () => { setQuizAutoStart(true); setActiveView('quiz'); };
  const handleGoToFlashcards = () => { if (onStartFlashcards) onStartFlashcards(); };

  let figureCounter = 0;

  const renderStudyActionBar = (pageNum: number, totalPages: number, position: 'top' | 'bottom') => (
    <div className={clsx(
      "flex items-center justify-between py-3 px-1",
      position === 'top' ? "mb-8 border-b border-gray-100" : "mt-10 pt-4 border-t border-gray-100",
    )}>
      <span className="text-[11px] text-gray-400 font-medium tracking-wide">
        Página {pageNum} de {totalPages}
      </span>
    </div>
  );

  // ─── Render Document Content ───

  const renderDocumentContent = () => {
    figureCounter = 0;
    const totalPages = sections.length || 1;
    return (
    <div
      className={clsx(
        "min-h-screen p-12 md:p-20 flex flex-col transition-all",
        activeTool === 'highlight' && "cursor-text selection:bg-yellow-200 selection:text-black",
        activeTool === 'pen' && "cursor-crosshair"
      )}
    >
      {/* Floating Study Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="sticky top-4 z-50 ml-auto flex flex-col items-end gap-2">
          {/* Timer pill */}
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-full px-1.5 py-1 shadow-lg border border-gray-200/60">
            <div className="flex items-center gap-1.5 px-2 py-1">
              <Timer size={13} className={clsx("transition-colors", isTimerRunning ? "text-emerald-500" : "text-gray-400")} />
              <span className={clsx(
                "text-[12px] font-mono font-semibold tabular-nums tracking-wide",
                isTimerRunning ? "text-gray-800" : "text-gray-400"
              )}>
                {formatTime(sessionElapsed)}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <button onClick={timer.toggleTimer} className={clsx("p-1.5 rounded-full transition-all active:scale-90", isTimerRunning ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700" : "text-emerald-500 hover:bg-emerald-50")} title={isTimerRunning ? "Pausar" : "Retomar"}>
              {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button onClick={timer.resetTimer} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-90" title="Reiniciar">
              <RotateCcw size={11} />
            </button>

            {/* Save status */}
            <div className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all",
              saveStatus === 'saving' && "text-blue-500 bg-blue-50",
              saveStatus === 'saved' && "text-emerald-500 bg-emerald-50",
              saveStatus === 'error' && "text-red-500 bg-red-50",
              saveStatus === 'idle' && "text-gray-400 bg-gray-50",
            )}>
              {saveStatus === 'saving' && <><Loader2 size={10} className="animate-spin" /> Salvando...</>}
              {saveStatus === 'saved' && <><CheckCircle2 size={10} /> Salvo</>}
              {saveStatus === 'error' && <><AlertCircle size={10} /> Erro</>}
              {saveStatus === 'idle' && summaryLoaded && textAnnotations.length > 0 && <><CheckCircle2 size={10} /> Sincronizado</>}
            </div>

            <div className="w-px h-4 bg-gray-200" />

            <button onClick={handleGoToQuiz} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-blue-600 bg-blue-50/80 hover:bg-blue-600 hover:text-white transition-all active:scale-95" title={`Quiz: ${topic?.title || 'Tópico atual'} (${quizCount} questões)`}>
              <FileText size={12} />
              <span>Quiz</span>
            </button>

            <button onClick={handleGoToFlashcards} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-amber-600 bg-amber-50/80 hover:bg-amber-500 hover:text-white transition-all active:scale-95 group/fc" title={`Flashcards: ${topic?.title || 'Tópico atual'} (${flashcardCount} cards)`}>
              <Layers size={12} />
              <span className="max-w-[90px] truncate">Flashcard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Header */}
      <div className="mb-12 pb-8 border-b border-gray-100">
        <div className={clsx("inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-3", courseColor, "text-white")}>
          Resumo Completo
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight" style={headingStyle}>{topic.title}</h1>
        <p className="mt-4 text-gray-500 text-sm">Material de estudo oficial AXON - Ultima atualizacao em 2025</p>

        {/* Keyword Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-600">Palavras-chave:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Nao domino</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Parcialmente</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Domino</span>
        </div>
      </div>

      {/* Paginated Sections */}
      <div className="flex-1">
        {sections.map((section: any, idx: number) => {
          const sectionImage = getSectionImage(topic.id, section.title);
          const imageOnLeft = idx % 2 === 1;
          let figNum: number | null = null;
          if (sectionImage) { figureCounter++; figNum = figureCounter; }
          const pageNum = idx + 1;

          return (
          <div key={idx}>
          <div id={`section-${idx}`} className="scroll-mt-24">
            {renderStudyActionBar(pageNum, totalPages, 'top')}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 text-sm font-bold">{idx + 1}</span>
              {section.title}
            </h2>

            {sectionImage && figNum !== null ? (
              <div className={clsx("flex gap-8", imageOnLeft && "flex-row-reverse")}>
                <div className="flex-1 min-w-0 prose prose-lg max-w-none text-gray-600 leading-relaxed">
                  {renderParagraphs(section.content)}
                </div>
                <div className="w-72 shrink-0 self-stretch">
                  <div className="sticky top-6">
                    <figure className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img src={sectionImage.url} alt={sectionImage.alt} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">Fig. {figNum}</div>
                      </div>
                      <figcaption className="px-4 py-3 text-xs text-gray-500 leading-relaxed border-t border-gray-100 bg-gray-50/80">
                        <span className="font-semibold text-gray-700">Fig. {figNum}</span> — {sectionImage.caption.replace(/^Fig\.\s*\d+\s*[—–-]\s*/, '')}
                      </figcaption>
                    </figure>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                {renderParagraphs(section.content)}
              </div>
            )}

            {renderStudyActionBar(pageNum, totalPages, 'bottom')}
          </div>

          {idx < sections.length - 1 && (
            <div className="my-6 flex items-center justify-center gap-4 select-none">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Próxima seção</span>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>
          )}
          </div>
          );
        })}
      </div>

      {/* 3D Models Gallery */}
      {related3DModels.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className={iconClasses('md')}>
              <Box size={20} className={components.icon.default.text} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={headingStyle}>Modelos 3D Relacionados</h2>
              <p className="text-sm text-gray-500">Explore as estruturas anatômicas em 3D interativo</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related3DModels.map((item, idx) => (
              <button
                key={item.model.id}
                onClick={() => setActiveView('3d')}
                className="group text-left p-5 rounded-2xl border border-gray-200 bg-white hover:border-teal-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", item.model.available ? "bg-teal-50" : "bg-gray-100")}>
                    <Box size={22} className={item.model.available ? "text-teal-500" : "text-gray-400"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-teal-700 transition-colors truncate" style={headingStyle}>{item.model.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.sectionTitle}</p>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{item.model.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full", item.model.available ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500")}>
                    {item.model.available ? 'Disponível' : 'Em breve'}
                  </span>
                  <span className="text-xs text-teal-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Explorar <ChevronRight size={12} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom study actions */}
      <div className="mt-10 mb-4 flex justify-end">
        <div className="flex items-center gap-1.5">
          {hasQuiz && (
            <button onClick={handleGoToQuiz} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-600 hover:text-white transition-all active:scale-95" title={`Quiz: ${topic.title}`}>
              <FileText size={13} />
              <span className="hidden sm:inline">Quiz ({quizCount})</span>
            </button>
          )}
          {hasFlashcards && (
            <button onClick={handleGoToFlashcards} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-500 hover:text-white transition-all active:scale-95" title={`Flashcards: ${topic.title}`}>
              <Layers size={13} />
              <span className="hidden sm:inline">Flashcard ({flashcardCount})</span>
            </button>
          )}
          <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500 hover:text-white transition-all active:scale-95" title="Terminar Sessão">
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Terminar</span>
          </button>
        </div>
      </div>

      {/* Document Footer */}
      <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
        <span>Fim do documento</span>
        <span>AXON © 2025</span>
      </div>
    </div>
    );
  };

  // ─── Main Content JSX ───

  const content = (
    <div
      className={clsx(
        "flex flex-col h-full bg-[#525659] z-20 transition-opacity duration-300",
        mounted ? "opacity-100" : "opacity-0",
        isFullscreen && "fixed inset-0 z-[100] w-screen h-screen"
      )}
    >
      {/* PDF-style Toolbar */}
      <SummaryToolbar
        onBack={onBack}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        showOutline={showOutline}
        setShowOutline={setShowOutline}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        highlightColor={highlightColor}
        currentSection={currentSection}
        totalSections={sections.length}
        scrollToSection={scrollToSection}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        showAnnotations={showAnnotations}
        setShowAnnotations={setShowAnnotations}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Outline Sidebar */}
        <AnimatePresence>
          {showOutline && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#3e4246] border-r border-black/20 overflow-hidden flex-shrink-0"
            >
              <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 px-2">Sumario</h3>
                <nav className="space-y-1">
                  {sections.map((section: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => scrollToSection(index)}
                      className={clsx(
                        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all",
                        currentSection === index
                          ? "bg-white/10 text-white font-medium"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={clsx("w-1.5 h-1.5 rounded-full", currentSection === index ? "bg-sky-400" : "bg-gray-500")} />
                        <span className="line-clamp-2">{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {showAnnotations ? (
          <PanelGroup direction="horizontal" autoSaveId="summary-keywords-split">
            <Panel defaultSize={70} minSize={40} className="flex flex-col bg-gray-100">
              <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={scrollContainerRef}>
                <div className="max-w-5xl mx-auto w-full bg-white min-h-full shadow-sm" style={{ zoom: `${zoom}%` }}>
                  {renderDocumentContent()}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1.5 bg-black hover:bg-blue-500 transition-colors cursor-col-resize flex items-center justify-center z-40 focus:outline-none focus:bg-blue-500">
              <div className="w-0.5 h-8 bg-gray-700 rounded-full" />
            </PanelResizeHandle>

            {/* Keywords Sidebar */}
            <Panel defaultSize={30} minSize={20} className="bg-white flex flex-col border-l border-gray-800">
              <div className="px-4 py-4 border-b border-gray-200 bg-gray-50/80">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Palavras-Chave</h3>
                {(() => {
                  const stats = getAnnotationStats();
                  return (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-xs font-medium text-red-700">{stats.red}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-xs font-medium text-amber-700">{stats.yellow}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-emerald-700">{stats.green}</span>
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">{stats.total} termos</span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {getAnnotatedKeywords().map(({ keyword, mastery: level, notes }) => {
                  const mc = masteryConfig[level];
                  return (
                    <div key={keyword.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-default">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className={clsx("w-2.5 h-2.5 rounded-full shrink-0", mc.bgDot)} />
                        <span className="font-medium text-sm text-gray-900 capitalize">{keyword.term}</span>
                        {keyword.has3DModel && <Box size={12} className="text-blue-400 ml-auto shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 ml-5 leading-relaxed">{keyword.definition}</p>
                      {notes.length > 0 && (
                        <div className="ml-5 mt-1.5 flex items-center gap-1">
                          <Pen size={10} className="text-emerald-500" />
                          <span className="text-[10px] text-emerald-600">{notes.length} anotacao(oes)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-gray-100" ref={scrollContainerRef}>
            <div className="max-w-5xl mx-auto w-full bg-white min-h-full shadow-sm" style={{ zoom: `${zoom}%` }}>
              {renderDocumentContent()}
            </div>
          </div>
        )}
      </div>

      {/* Text Annotation Popup (Portal) */}
      {pendingAnnotation && createPortal(
        <SummaryAnnotationPopup
          pending={pendingAnnotation}
          onClose={() => setPendingAnnotation(null)}
          activeTab={annotationActiveTab}
          setActiveTab={setAnnotationActiveTab}
          color={annotationColor}
          setColor={setAnnotationColor}
          noteInput={annotationNoteInput}
          setNoteInput={setAnnotationNoteInput}
          questionInput={annotationQuestionInput}
          setQuestionInput={setAnnotationQuestionInput}
          botLoading={annotationBotLoading}
          onCreate={createTextAnnotation}
        />,
        document.body
      )}

      {/* Text Annotations Sidebar Drawer */}
      {textAnnotations.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[9998]">
          <TextAnnotationsPanel
            annotations={textAnnotations}
            onDelete={deleteTextAnnotation}
            botLoading={annotationBotLoading}
          />
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return createPortal(content, document.body);
  }

  return content;
}