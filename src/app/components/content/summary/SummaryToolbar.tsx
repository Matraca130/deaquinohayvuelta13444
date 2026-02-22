// ============================================================
// SummaryToolbar — Dark PDF-style toolbar for the summary viewer
// Extracted from SummarySessionNew.tsx for modularity
// ============================================================
import React from 'react';
import {
  ArrowLeft, ZoomIn, ZoomOut, Search, Bookmark,
  Maximize, Minimize, ChevronLeft, ChevronRight,
  Menu, Highlighter, Pen, Eraser, FileText, Sparkles, CircleDot,
} from 'lucide-react';
import clsx from 'clsx';
import type { ReaderTool, HighlightColor } from '@/app/hooks/useSummaryViewer';

interface SummaryToolbarProps {
  onBack: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  showOutline: boolean;
  setShowOutline: (v: boolean) => void;
  activeTool: ReaderTool;
  setActiveTool: (t: ReaderTool) => void;
  highlightColor: HighlightColor;
  currentSection: number;
  totalSections: number;
  scrollToSection: (idx: number) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  showAnnotations: boolean;
  setShowAnnotations: (v: boolean) => void;
}

export function SummaryToolbar({
  onBack,
  isFullscreen,
  toggleFullscreen,
  showOutline,
  setShowOutline,
  activeTool,
  setActiveTool,
  highlightColor,
  currentSection,
  totalSections,
  scrollToSection,
  zoom,
  onZoomIn,
  onZoomOut,
  showAnnotations,
  setShowAnnotations,
}: SummaryToolbarProps) {
  return (
    <div className="h-14 bg-[#323639] border-b border-black/20 flex items-center justify-between px-4 shrink-0 shadow-lg z-50">
      {/* Left: Nav & Tools */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (isFullscreen) toggleFullscreen();
            onBack();
          }}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 hover:bg-white/10 rounded-lg"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium hidden sm:inline">Voltar</span>
        </button>

        <div className="h-6 w-px bg-white/10 mx-1" />

        <button
          onClick={() => setShowOutline(!showOutline)}
          className={clsx(
            "p-2 rounded-lg transition-colors text-sm",
            showOutline ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
          )}
          title="Sumario"
        >
          <Menu size={18} />
        </button>

        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool('pen')}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              activeTool === 'pen' ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
            )}
            title="Desenhar"
          >
            <Pen size={18} />
          </button>
          <button
            onClick={() => setActiveTool('highlight')}
            className={clsx(
              "p-2 rounded-lg transition-colors relative",
              activeTool === 'highlight' ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
            )}
            title="Realcar"
          >
            <Highlighter size={18} />
            <div className={clsx("absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full border border-[#323639]",
              highlightColor === 'yellow' ? "bg-yellow-400" :
              highlightColor === 'green' ? "bg-green-400" :
              highlightColor === 'blue' ? "bg-sky-400" : "bg-pink-400"
            )} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Borracha"
          >
            <Eraser size={18} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Adicionar Texto"
          >
            <FileText size={18} />
          </button>

          <div className="h-6 w-px bg-white/10 mx-1" />

          <button
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors"
            title="Perguntar ao MedBot"
          >
            <Sparkles size={18} />
          </button>
        </div>
      </div>

      {/* Center - Page Nav */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-lg px-2 py-1">
          <button className="text-gray-400 hover:text-white disabled:opacity-30" disabled={currentSection === 0} onClick={() => scrollToSection(Math.max(0, currentSection - 1))}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-white text-sm font-medium min-w-[40px] text-center">
            {currentSection + 1} <span className="text-gray-500">/</span> {totalSections}
          </span>
          <button className="text-gray-400 hover:text-white disabled:opacity-30" disabled={currentSection === totalSections - 1} onClick={() => scrollToSection(Math.min(totalSections - 1, currentSection + 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Right: Zoom & Actions */}
      <div className="flex items-center gap-2">
        <button onClick={onZoomOut} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Reduzir zoom">
          <ZoomOut size={18} />
        </button>
        <span className="text-white text-sm font-medium min-w-[50px] text-center">{zoom}%</span>
        <button onClick={onZoomIn} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Aumentar zoom">
          <ZoomIn size={18} />
        </button>

        <div className="h-6 w-px bg-white/10 mx-2" />

        <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Buscar">
          <Search size={18} />
        </button>
        <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Salvar">
          <Bookmark size={18} />
        </button>
        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            showAnnotations ? "bg-white/20 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
          )}
          title={showAnnotations ? "Ocultar palavras-chave" : "Mostrar palavras-chave"}
        >
          <CircleDot size={18} />
        </button>
        <button
          onClick={toggleFullscreen}
          className={clsx(
            "p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors",
            isFullscreen && "text-blue-400 bg-white/10"
          )}
          title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </div>
  );
}
