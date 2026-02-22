// ============================================================
// VideoSession — Full video player with annotation sidebar
// Extracted from StudyView.tsx
// ============================================================
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, ArrowLeft, MoreVertical, PanelRightClose, PanelRight,
  Plus, Trash2, Maximize, Minimize, Highlighter, MousePointer2,
  Quote, StickyNote, Edit3,
} from 'lucide-react';
import clsx from 'clsx';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

interface AnnotationBlock {
  id: string;
  title: string;
  selectedText: string;
  note: string;
  timestamp: string;
  color: 'yellow' | 'blue' | 'green' | 'pink';
}

const ANNOTATION_COLORS = {
  yellow: { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-400', text: 'text-amber-700', highlight: 'bg-amber-100' },
  blue: { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'bg-teal-400', text: 'text-teal-700', highlight: 'bg-teal-100' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-400', text: 'text-emerald-700', highlight: 'bg-emerald-100' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'bg-pink-400', text: 'text-pink-700', highlight: 'bg-pink-100' },
};

export function VideoSession({ onBack, topic, courseColor, accentColor, activeLesson }: any) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'notes'>('summary');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [annotations, setAnnotations] = useState<AnnotationBlock[]>([
    {
      id: '1',
      title: 'Anatomia \u2014 Revis\u00e3o',
      selectedText: 'Conceitos fundamentais da anatomia',
      note: 'Revisar antes da prova \u2014 foco nas rela\u00e7\u00f5es topogr\u00e1ficas.',
      timestamp: '06/02/2026 14:30',
      color: 'yellow',
    },
  ]);
  const [selectionPopup, setSelectionPopup] = useState<{ text: string; x: number; y: number } | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0 && summaryRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = summaryRef.current.getBoundingClientRect();
      setSelectionPopup({
        text: selection.toString().trim(),
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 8,
      });
    } else {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.toString().trim().length === 0) {
          setSelectionPopup(null);
        }
      }, 200);
    }
  }, []);

  const createAnnotation = (selectedText: string) => {
    const colors: AnnotationBlock['color'][] = ['yellow', 'blue', 'green', 'pink'];
    const newAnnotation: AnnotationBlock = {
      id: Date.now().toString(),
      title: '',
      selectedText,
      note: '',
      timestamp: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      color: colors[annotations.length % colors.length],
    };
    setAnnotations(prev => [newAnnotation, ...prev]);
    setEditingAnnotation(newAnnotation.id);
    setSelectionPopup(null);
    setActiveTab('notes');
    window.getSelection()?.removeAllRanges();
  };

  const updateAnnotationNote = (id: string, note: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, note } : a));
  };
  const updateAnnotationTitle = (id: string, title: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, title } : a));
  };
  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };
  const changeAnnotationColor = (id: string, color: AnnotationBlock['color']) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, color } : a));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => setIsFullscreen(false));
    }
  };

  // Reusable Video Player Content
  const VideoPlayerContent = () => (
    <div className="flex-1 relative flex items-center justify-center group bg-black">
      <img 
        src="https://images.unsplash.com/photo-1768644675767-40b294727e10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGFuYXRvbXklMjBtZWRpY2FsJTIwc3R1ZHl8ZW58MXx8fHwxNzY5MDMzMDMxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
        className="absolute inset-0 w-full h-full object-contain opacity-80"
        alt="Video Content"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      <button className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:scale-110 transition-transform group-hover:bg-white/20">
        <Play size={32} className="text-white ml-1 fill-white" />
      </button>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-3 space-y-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all">
          <div className={clsx("h-full w-1/3 rounded-full relative", courseColor)} style={{ backgroundColor: 'currentColor' }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
          </div>
        </div>
        <div className="flex items-center justify-between text-white/90 font-medium">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors" title="Play">
              <Play size={18} fill="currentColor" />
            </button>
            <span className="text-xs">04:20 / 12:45</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 text-xs hover:bg-white/10 rounded-md transition-colors">1.0x</button>
            <button className="px-2 py-1 text-xs hover:bg-white/10 rounded-md transition-colors">HD</button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={clsx(
                "p-1.5 rounded-md transition-colors",
                showSidebar ? "bg-white/25 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
              title={showSidebar ? "Ocultar anota\u00e7\u00f5es" : "Mostrar anota\u00e7\u00f5es"}
            >
              {showSidebar ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 text-white/80 hover:bg-white/10 hover:text-white rounded-md transition-colors"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button className="p-1.5 text-white/80 hover:bg-white/10 hover:text-white rounded-md transition-colors" title="Mais op\u00e7\u00f5es">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const content = (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={clsx(
        "flex flex-col h-full bg-black z-20",
        isFullscreen && "fixed inset-0 z-50 w-screen h-screen"
      )}
    >
      {/* Video Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-white/10 backdrop-blur-md border-b border-white/10 shrink-0 z-30">
        <button 
          onClick={() => {
            if (isFullscreen) toggleFullscreen();
            onBack();
          }}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors py-2 px-3 hover:bg-white/10 rounded-lg"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <span className="text-white font-medium truncate max-w-[60%]">{activeLesson ? `${topic.title} \u2014 ${activeLesson.title}` : topic.title}</span>
        <div className="w-[88px]" />
      </div>

      {/* Split Content */}
      <div className="flex-1 relative overflow-hidden">
        {showSidebar ? (
          <PanelGroup direction="horizontal" autoSaveId="video-session-split">
            <Panel defaultSize={70} minSize={30} className="relative bg-gray-900 flex flex-col">
              <VideoPlayerContent />
            </Panel>
            
            <PanelResizeHandle className="w-1.5 bg-black hover:bg-blue-500 transition-colors cursor-col-resize flex items-center justify-center z-40 focus:outline-none focus:bg-blue-500">
              <div className="w-0.5 h-8 bg-gray-700 rounded-full" />
            </PanelResizeHandle>
            
            <Panel defaultSize={30} minSize={20} className="bg-white flex flex-col border-l border-gray-800">
              <div className="flex items-center border-b border-gray-200 bg-gray-50/50">
                <button 
                  onClick={() => setActiveTab('summary')}
                  className={clsx(
                    "flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors relative",
                    activeTab === 'summary' ? clsx("border-current bg-white", accentColor) : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Resumo
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={clsx(
                    "flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors relative",
                    activeTab === 'notes' ? clsx("border-current bg-white", accentColor) : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Anota\u00e7\u00f5es
                  {annotations.length > 0 && (
                    <span className={clsx("ml-1.5 inline-flex items-center justify-center w-4.5 h-4.5 rounded-full text-[10px] font-bold text-white", courseColor)}>
                      {annotations.length}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white">
                {activeTab === 'summary' ? (
                  <div className="p-6 relative" ref={summaryRef} onMouseUp={handleTextSelection}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm mb-6 select-text cursor-text">{topic.summary}</p>
                    
                    <div className="prose prose-sm prose-slate max-w-none select-text cursor-text">
                      <h4 className="text-gray-900 font-bold mb-2">Pontos Principais</h4>
                      <ul className="list-disc pl-4 space-y-1 text-gray-600">
                        <li>Conceitos fundamentais da anatomia</li>
                        <li>Rela\u00e7\u00f5es estruturais importantes</li>
                        <li>Aplica\u00e7\u00f5es cl\u00ednicas relevantes</li>
                      </ul>
                      
                      <h4 className="text-gray-900 font-bold mt-6 mb-2">Transcri\u00e7\u00e3o Autom\u00e1tica</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        [00:00] Bem-vindos a aula de hoje. Vamos come\u00e7ar analisando...
                        <br/>
                        [00:45] Observem como esta estrutura se conecta com...
                        <br/>
                        [02:15] \u00c9 fundamental entender a vasculariza\u00e7\u00e3o...
                      </p>
                    </div>

                    {annotations.length === 0 && (
                      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                        <MousePointer2 size={12} />
                        <span>Selecione um trecho de texto para criar uma anota\u00e7\u00e3o</span>
                      </div>
                    )}

                    {/* Selection popup */}
                    <AnimatePresence>
                      {selectionPopup && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50"
                          style={{ left: selectionPopup.x, top: selectionPopup.y, transform: 'translate(-50%, -100%)' }}
                        >
                          <div className="bg-gray-900 rounded-lg shadow-xl flex items-center overflow-hidden">
                            <button
                              onMouseDown={(e) => { e.preventDefault(); createAnnotation(selectionPopup.text); }}
                              className="flex items-center gap-1.5 px-3 py-2 text-white hover:bg-gray-700 transition-colors text-xs font-medium"
                            >
                              <StickyNote size={13} />
                              Anotar
                            </button>
                            <div className="w-px h-5 bg-gray-700" />
                            <button
                              onMouseDown={(e) => { e.preventDefault(); createAnnotation(selectionPopup.text); }}
                              className="flex items-center gap-1.5 px-3 py-2 text-white hover:bg-gray-700 transition-colors text-xs font-medium"
                            >
                              <Highlighter size={13} />
                              Destacar
                            </button>
                          </div>
                          <div className="w-2.5 h-2.5 bg-gray-900 rotate-45 mx-auto -mt-1.5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Annotation blocks header */}
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">{annotations.length} anota\u00e7\u00e3o(\u00f5es)</span>
                      <button
                        onClick={() => {
                          const newAnnotation: AnnotationBlock = {
                            id: Date.now().toString(),
                            title: '',
                            selectedText: '',
                            note: '',
                            timestamp: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                            color: 'yellow',
                          };
                          setAnnotations(prev => [newAnnotation, ...prev]);
                          setEditingAnnotation(newAnnotation.id);
                        }}
                        className={clsx("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:shadow-md active:scale-95", courseColor)}
                      >
                        <Plus size={13} />
                        Nota livre
                      </button>
                    </div>

                    {/* Annotation blocks list */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                      <AnimatePresence>
                        {annotations.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 text-center"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                              <StickyNote size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Nenhuma anota\u00e7\u00e3o</p>
                            <p className="text-xs text-gray-400 max-w-[200px]">Selecione um trecho no Resumo ou crie uma nota livre</p>
                          </motion.div>
                        ) : (
                          annotations.map((annotation) => {
                            const colors = ANNOTATION_COLORS[annotation.color];
                            return (
                              <motion.div
                                key={annotation.id}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: 40 }}
                                layout
                                className={clsx("rounded-xl border overflow-hidden group transition-shadow hover:shadow-md", colors.bg, colors.border)}
                              >
                                {/* Title + actions */}
                                <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                                  <input
                                    type="text"
                                    value={annotation.title}
                                    onChange={(e) => updateAnnotationTitle(annotation.id, e.target.value)}
                                    placeholder="T\u00edtulo..."
                                    className={clsx(
                                      "flex-1 min-w-0 bg-transparent text-xs text-gray-800 placeholder-gray-400 border-none outline-none py-0.5 truncate",
                                      annotation.title ? "font-semibold" : "font-normal italic"
                                    )}
                                  />
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {(['yellow', 'blue', 'green', 'pink'] as const).map(c => (
                                      <button
                                        key={c}
                                        onClick={() => changeAnnotationColor(annotation.id, c)}
                                        className={clsx(
                                          "w-3.5 h-3.5 rounded-full border-2 transition-transform hover:scale-125",
                                          ANNOTATION_COLORS[c].accent,
                                          annotation.color === c ? "border-gray-600 scale-110" : "border-transparent"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => setEditingAnnotation(editingAnnotation === annotation.id ? null : annotation.id)}
                                      className="p-1 rounded hover:bg-black/5 transition-colors"
                                      title="Editar"
                                    >
                                      <Edit3 size={12} className="text-gray-500" />
                                    </button>
                                    <button
                                      onClick={() => deleteAnnotation(annotation.id)}
                                      className="p-1 rounded hover:bg-red-50 transition-colors"
                                      title="Excluir"
                                    >
                                      <Trash2 size={12} className="text-red-400" />
                                    </button>
                                  </div>
                                </div>

                                {/* Quoted text */}
                                {annotation.selectedText && (
                                  <div className={clsx("mx-3 px-3 py-2 rounded-lg border-l-[3px] mb-2", colors.highlight, colors.border.replace('border-', 'border-l-'))}>
                                    <div className="flex items-start gap-1.5">
                                      <Quote size={11} className={clsx("mt-0.5 shrink-0", colors.text)} />
                                      <p className={clsx("text-xs leading-relaxed italic", colors.text)}>&ldquo;{annotation.selectedText}&rdquo;</p>
                                    </div>
                                  </div>
                                )}

                                {/* Note content */}
                                <div className="px-3 pb-2">
                                  {editingAnnotation === annotation.id ? (
                                    <textarea
                                      autoFocus
                                      value={annotation.note}
                                      onChange={(e) => updateAnnotationNote(annotation.id, e.target.value)}
                                      onBlur={() => setEditingAnnotation(null)}
                                      onKeyDown={(e) => { if (e.key === 'Escape') setEditingAnnotation(null); }}
                                      className={clsx("w-full resize-none rounded-lg border px-3 py-2 text-xs text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white/80", colors.border)}
                                      placeholder="Escreva sua anota\u00e7\u00e3o..."
                                      rows={3}
                                    />
                                  ) : (
                                    <p
                                      onClick={() => setEditingAnnotation(annotation.id)}
                                      className={clsx("text-xs text-gray-700 leading-relaxed cursor-text min-h-[20px] px-1 py-0.5 rounded hover:bg-white/50 transition-colors", !annotation.note && "text-gray-400 italic")}
                                    >
                                      {annotation.note || 'Clique para adicionar anota\u00e7\u00e3o...'}
                                    </p>
                                  )}
                                </div>

                                {/* Timestamp */}
                                <div className="px-3 pb-2 flex items-center justify-between">
                                  <span className="text-[10px] text-gray-400">{annotation.timestamp}</span>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/80">
                      <span className="text-[10px] text-gray-400">Salvo automaticamente</span>
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          <div className="w-full h-full bg-gray-900 flex flex-col">
            <VideoPlayerContent />
          </div>
        )}
      </div>
    </motion.div>
  );

  if (isFullscreen) {
    return createPortal(content, document.body);
  }

  return content;
}
