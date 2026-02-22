// ============================================================
// FlashcardsSession — Mini flashcard session inside StudyView
// Extracted from StudyView.tsx
// ============================================================
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import clsx from 'clsx';

export function FlashcardsSession({ onBack, topic, courseColor, accentColor }: any) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Mock Data for Flashcards
  const flashcards = [
    { id: 1, front: "Qual a principal fun\u00e7\u00e3o desta estrutura anat\u00f4mica?", back: "Sustenta\u00e7\u00e3o mec\u00e2nica e prote\u00e7\u00e3o de \u00f3rg\u00e3os vitais." },
    { id: 2, front: "Quais nervos passam por esta regi\u00e3o?", back: "Nervo Vago e Nervo Fr\u00eanico." },
    { id: 3, front: "Defina o conceito de vasculariza\u00e7\u00e3o colateral.", back: "Circula\u00e7\u00e3o alternativa ao redor de uma via bloqueada." },
  ];

  const handleRate = (_level: number) => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % flashcards.length);
    }, 300);
  };

  const content = (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={clsx(
        "flex flex-col h-full bg-gray-100 z-20",
        isFullscreen && "fixed inset-0 z-50 w-screen h-screen"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
        <button 
          onClick={() => {
            if (isFullscreen) toggleFullscreen();
            onBack();
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors py-2 px-3 hover:bg-gray-50 rounded-lg"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium hidden sm:inline">Encerrar Sess\u00e3o</span>
          <span className="text-sm font-medium sm:hidden">Sair</span>
        </button>
        <div className="text-center">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider block">Flashcards</span>
          <span className="text-sm font-bold text-gray-900">{currentCard + 1} / {flashcards.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div> 
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
        <div className="w-full max-w-5xl aspect-[4/3] md:aspect-[3/2] relative perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <motion.div 
            className="w-full h-full relative preserve-3d transition-transform duration-700"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
          >
            {/* Front */}
            <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 md:p-16 text-center backface-hidden border border-gray-100">
              <span className="mb-4 md:mb-8 px-3 py-1 md:px-4 md:py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest">Pergunta</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight max-w-4xl select-none">
                {flashcards[currentCard].front}
              </h3>
              <p className="absolute bottom-6 md:bottom-10 text-gray-400 text-xs sm:text-sm md:text-base font-medium animate-pulse">Clique para virar</p>
            </div>

            {/* Back */}
            <div 
              className={clsx(
                "absolute inset-0 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 md:p-16 text-center backface-hidden border border-white/20 text-white",
                courseColor
              )}
              style={{ transform: "rotateY(180deg)" }}
            >
              <span className="mb-4 md:mb-8 px-3 py-1 md:px-4 md:py-1.5 bg-white/20 text-white rounded-full text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest">Resposta</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl select-none">
                {flashcards[currentCard].back}
              </h3>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Controls (SM-2 Inspired) */}
      <div className="min-h-[6rem] py-4 bg-white border-t border-gray-200 flex items-center justify-center gap-4 px-4 shrink-0 overflow-x-auto">
        {!isFlipped ? (
          <button 
            onClick={() => setIsFlipped(true)}
            className="px-8 py-3 md:py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl w-full max-w-md text-sm sm:text-base md:text-lg"
          >
            Mostrar Resposta
          </button>
        ) : (
          <div className="flex gap-2 w-full max-w-4xl justify-center">
            <button onClick={() => handleRate(1)} className="flex-1 py-3 px-1 md:px-2 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors text-xs sm:text-sm md:text-base flex flex-col items-center gap-1">
              <span className="text-[10px] sm:text-xs opacity-70 uppercase tracking-wider hidden sm:inline">1</span>
              <span className="line-clamp-1">N\u00e3o Sei</span>
            </button>
            <button onClick={() => handleRate(2)} className="flex-1 py-3 px-1 md:px-2 bg-orange-100 text-orange-700 font-bold rounded-xl hover:bg-orange-200 transition-colors text-xs sm:text-sm md:text-base flex flex-col items-center gap-1">
              <span className="text-[10px] sm:text-xs opacity-70 uppercase tracking-wider hidden sm:inline">2</span>
              <span className="line-clamp-1">Dif\u00edcil</span>
            </button>
            <button onClick={() => handleRate(3)} className="flex-1 py-3 px-1 md:px-2 bg-yellow-100 text-yellow-700 font-bold rounded-xl hover:bg-yellow-200 transition-colors text-xs sm:text-sm md:text-base flex flex-col items-center gap-1">
              <span className="text-[10px] sm:text-xs opacity-70 uppercase tracking-wider hidden sm:inline">3</span>
              <span className="line-clamp-1">D\u00favida</span>
            </button>
            <button onClick={() => handleRate(4)} className="flex-1 py-3 px-1 md:px-2 bg-lime-100 text-lime-700 font-bold rounded-xl hover:bg-lime-200 transition-colors text-xs sm:text-sm md:text-base flex flex-col items-center gap-1">
              <span className="text-[10px] sm:text-xs opacity-70 uppercase tracking-wider hidden sm:inline">4</span>
              <span className="line-clamp-1">Bom</span>
            </button>
            <button onClick={() => handleRate(5)} className="flex-1 py-3 px-1 md:px-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors text-xs sm:text-sm md:text-base flex flex-col items-center gap-1">
              <span className="text-[10px] sm:text-xs opacity-70 uppercase tracking-wider hidden sm:inline">5</span>
              <span className="line-clamp-1">Perfeito</span>
            </button>
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
