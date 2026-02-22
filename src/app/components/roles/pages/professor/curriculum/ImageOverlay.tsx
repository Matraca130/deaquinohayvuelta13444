// ============================================================
// Axon — Image Resize & Move Overlay for Canvas Editor
// Shows handles to resize, layout-mode buttons (block / wrap-left
// / wrap-right) so text can flow beside images, plus drag-to-move,
// reset-size and delete.
// ============================================================
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Trash2, GripVertical, Maximize2,
  PanelLeft, PanelRight, RectangleHorizontal,
  ArrowDownToLine,
} from 'lucide-react';
import clsx from 'clsx';

// ── Types ────────────────────────────────────────────────

interface ImageOverlayProps {
  selectedImage: HTMLImageElement | null;
  editorRef: React.RefObject<HTMLDivElement | null>;
  onChange: () => void;
  onDeselect: () => void;
  onInsertClearBreak?: (afterFigure?: HTMLElement) => void;
}

type HandlePosition = 'nw' | 'ne' | 'sw' | 'se';
type LayoutMode = 'block' | 'wrap-left' | 'wrap-right';

const HANDLE_CURSORS: Record<HandlePosition, string> = {
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  se: 'nwse-resize',
};

const MIN_SIZE = 40;

// ── Helpers ──────────────────────────────────────────────

/** Read the current layout mode from the figure's data attribute */
function getLayoutMode(img: HTMLImageElement): LayoutMode {
  const figure = img.closest('figure') as HTMLElement | null;
  return (figure?.dataset.layout as LayoutMode) || 'block';
}

/** Apply a layout mode to the figure (or bare img) */
function applyLayoutMode(img: HTMLImageElement, mode: LayoutMode) {
  const figure = (img.closest('figure') || img) as HTMLElement;
  figure.dataset.layout = mode;

  // Reset all layout-related inline styles first
  figure.style.float = '';
  figure.style.clear = '';
  figure.style.marginLeft = '';
  figure.style.marginRight = '';
  figure.style.marginTop = '';
  figure.style.marginBottom = '';
  figure.style.maxWidth = '';
  figure.style.textAlign = '';

  switch (mode) {
    case 'wrap-left':
      figure.style.float = 'left';
      figure.style.marginRight = '20px';
      figure.style.marginBottom = '12px';
      figure.style.marginTop = '4px';
      figure.style.maxWidth = '50%';
      figure.style.textAlign = 'center';
      // Constrain img width if it was full-size
      if (!img.style.width || img.style.maxWidth === '100%') {
        img.style.width = '100%';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
      break;

    case 'wrap-right':
      figure.style.float = 'right';
      figure.style.marginLeft = '20px';
      figure.style.marginBottom = '12px';
      figure.style.marginTop = '4px';
      figure.style.maxWidth = '50%';
      figure.style.textAlign = 'center';
      if (!img.style.width || img.style.maxWidth === '100%') {
        img.style.width = '100%';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
      break;

    case 'block':
    default:
      figure.style.margin = '16px 0';
      figure.style.textAlign = 'center';
      figure.style.clear = 'both';
      break;
  }
}

// ── Component ────────────────────────────────────────────

export function ImageOverlay({ selectedImage, editorRef, onChange, onDeselect, onInsertClearBreak }: ImageOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('block');
  const [dragging, setDragging] = useState(false);
  const resizingRef = useRef<{ handle: HandlePosition; startX: number; startW: number; startH: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; ghost: HTMLElement | null } | null>(null);

  // ── Sync layout mode when image changes ─────────────────
  useEffect(() => {
    if (selectedImage) {
      setLayoutMode(getLayoutMode(selectedImage));
    }
  }, [selectedImage]);

  // ── Recalculate rect ────────────────────────────────────
  const updateRect = useCallback(() => {
    if (!selectedImage || !editorRef.current) {
      setRect(null);
      return;
    }
    const container = editorRef.current.closest('.relative') as HTMLElement | null;
    if (!container) { setRect(null); return; }

    const containerRect = container.getBoundingClientRect();
    const imgRect = selectedImage.getBoundingClientRect();
    setRect(new DOMRect(
      imgRect.left - containerRect.left,
      imgRect.top - containerRect.top,
      imgRect.width,
      imgRect.height,
    ));
  }, [selectedImage, editorRef]);

  useEffect(() => {
    updateRect();
    const scrollEl = editorRef.current?.closest('.flex-1.overflow-auto') || editorRef.current?.closest('.overflow-auto');
    const handler = () => updateRect();
    scrollEl?.addEventListener('scroll', handler);
    window.addEventListener('resize', handler);
    return () => {
      scrollEl?.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [updateRect]);

  // ── Layout mode change ──────────────────────────────────
  const handleSetLayout = useCallback((mode: LayoutMode) => {
    if (!selectedImage) return;
    applyLayoutMode(selectedImage, mode);
    setLayoutMode(mode);
    onChange();

    // ── Auto-insert clear break when switching to wrap mode ──
    // This is the key UX fix: users expect to be able to type below
    // a floated image without manual intervention.
    if ((mode === 'wrap-left' || mode === 'wrap-right') && onInsertClearBreak) {
      const figure = (selectedImage.closest('figure') || selectedImage) as HTMLElement;
      // Don't duplicate — check if a clear break already follows this figure
      let sibling = figure.nextElementSibling;
      let alreadyHasClear = false;
      while (sibling) {
        if (sibling.classList?.contains('axon-clear-break')) {
          alreadyHasClear = true;
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      if (!alreadyHasClear) {
        onInsertClearBreak(figure);
      }
    }

    requestAnimationFrame(updateRect);
  }, [selectedImage, onChange, updateRect, onInsertClearBreak]);

  // ── Resize logic ────────────────────────────────────────
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: HandlePosition) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedImage) return;

    const startW = selectedImage.offsetWidth;
    const startH = selectedImage.offsetHeight;
    resizingRef.current = { handle, startX: e.clientX, startW, startH };

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current || !selectedImage) return;
      const { handle: h, startX, startW: sw, startH: sh } = resizingRef.current;
      const dx = ev.clientX - startX;
      const aspectRatio = sw / sh;

      let newW = sw;
      switch (h) {
        case 'se': case 'ne': newW = Math.max(MIN_SIZE, sw + dx); break;
        case 'sw': case 'nw': newW = Math.max(MIN_SIZE, sw - dx); break;
      }
      const newH = newW / aspectRatio;

      selectedImage.style.width = `${Math.round(newW)}px`;
      selectedImage.style.height = `${Math.round(newH)}px`;
      selectedImage.style.maxWidth = 'none';
      updateRect();
    };

    const onMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      onChange();
      updateRect();
    };

    document.body.style.cursor = HANDLE_CURSORS[handle];
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [selectedImage, onChange, updateRect]);

  // ── Drag to reposition ──────────────────────────────────
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedImage || !editorRef.current) return;

    const ghost = document.createElement('div');
    ghost.style.cssText = `
      position:fixed; width:${selectedImage.offsetWidth * 0.3}px;
      height:${selectedImage.offsetHeight * 0.3}px;
      background-image:url(${selectedImage.src}); background-size:cover;
      border-radius:6px; opacity:0.7; pointer-events:none; z-index:9999;
      box-shadow:0 4px 16px rgba(0,0,0,0.2); border:2px solid #14b8a6;
      left:${e.clientX - 30}px; top:${e.clientY - 30}px;
    `;
    document.body.appendChild(ghost);
    dragRef.current = { startX: e.clientX, startY: e.clientY, ghost };
    setDragging(true);

    const editor = editorRef.current;
    const blocks = editor.querySelectorAll('p, h1, h2, h3, div, figure, blockquote, ul, ol');

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      ghost.style.left = `${ev.clientX - 30}px`;
      ghost.style.top = `${ev.clientY - 30}px`;
      blocks.forEach(b => {
        (b as HTMLElement).style.removeProperty('border-top');
        (b as HTMLElement).style.removeProperty('border-bottom');
      });
      const target = getDropTarget(ev, editor);
      if (target.element) {
        const prop = target.position === 'before' ? 'borderTop' : 'borderBottom';
        (target.element as HTMLElement).style[prop] = '2px solid #14b8a6';
      }
    };

    const onMouseUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setDragging(false);
      dragRef.current?.ghost?.remove();
      blocks.forEach(b => {
        (b as HTMLElement).style.removeProperty('border-top');
        (b as HTMLElement).style.removeProperty('border-bottom');
      });

      const figure = selectedImage.closest('figure') || selectedImage;
      const target = getDropTarget(ev, editor);
      if (target.element && target.element !== figure && !figure.contains(target.element)) {
        if (target.position === 'before') {
          target.element.parentNode?.insertBefore(figure, target.element);
        } else {
          target.element.parentNode?.insertBefore(figure, target.element.nextSibling);
        }
        onChange();
        requestAnimationFrame(updateRect);
      }
      dragRef.current = null;
    };

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [selectedImage, editorRef, onChange, updateRect]);

  // ── Reset to original size ──────────────────────────────
  const handleResetSize = useCallback(() => {
    if (!selectedImage) return;
    selectedImage.style.width = '';
    selectedImage.style.height = 'auto';
    selectedImage.style.maxWidth = '100%';
    onChange();
    requestAnimationFrame(updateRect);
  }, [selectedImage, onChange, updateRect]);

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!selectedImage) return;
    const figure = selectedImage.closest('figure');
    (figure || selectedImage).remove();
    onChange();
    onDeselect();
  }, [selectedImage, onChange, onDeselect]);

  // ── Insert clear break after this figure ───────────────
  const handleClearBreak = useCallback(() => {
    if (!selectedImage || !onInsertClearBreak) return;
    const figure = (selectedImage.closest('figure') || selectedImage) as HTMLElement;
    onInsertClearBreak(figure);
  }, [selectedImage, onInsertClearBreak]);

  // ── Render ──────────────────────────────────────────────

  if (!selectedImage || !rect) return null;

  const sizeLabel = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

  // Layout-mode button helper
  const LayoutBtn = ({ mode, icon: Icon, label }: { mode: LayoutMode; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => handleSetLayout(mode)}
      className={clsx(
        'p-1.5 rounded-md transition-colors',
        layoutMode === mode
          ? 'bg-teal-500/30 text-teal-300'
          : 'text-gray-300 hover:text-white hover:bg-white/10',
      )}
      title={label}
    >
      <Icon size={14} />
    </button>
  );

  return (
    <>
      {/* Selection border */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: rect.x - 2,
          top: rect.y - 2,
          width: rect.width + 4,
          height: rect.height + 4,
          border: '2px solid #14b8a6',
          borderRadius: '6px',
          transition: dragging ? 'none' : 'all 0.1s ease',
        }}
      />

      {/* Corner resize handles */}
      {(['nw', 'ne', 'sw', 'se'] as HandlePosition[]).map(pos => {
        const x = pos.includes('w') ? rect.x - 5 : rect.x + rect.width - 5;
        const y = pos.includes('n') ? rect.y - 5 : rect.y + rect.height - 5;
        return (
          <div
            key={pos}
            className="absolute z-30 w-[10px] h-[10px] bg-white border-2 border-teal-500 rounded-sm shadow-sm"
            style={{ left: x, top: y, cursor: HANDLE_CURSORS[pos] }}
            onMouseDown={(e) => handleResizeStart(e, pos)}
          />
        );
      })}

      {/* ── Floating toolbar above image ── */}
      <div
        className="absolute z-30 flex items-center gap-0.5 bg-gray-900/90 backdrop-blur-sm rounded-lg px-1.5 py-1 shadow-xl"
        style={{
          left: Math.max(rect.x + rect.width / 2, 120),
          top: Math.max(rect.y - 44, 0),
          transform: 'translateX(-50%)',
        }}
      >
        {/* Drag handle */}
        <button
          onMouseDown={handleDragStart}
          className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing"
          title="Arrastar para mover"
        >
          <GripVertical size={14} />
        </button>

        <div className="w-px h-4 bg-gray-600 mx-0.5" />

        {/* Layout modes */}
        <LayoutBtn mode="block"      icon={RectangleHorizontal} label="Bloco (largura total)" />
        <LayoutBtn mode="wrap-left"  icon={PanelLeft}           label="Imagem à esquerda, texto ao lado" />
        <LayoutBtn mode="wrap-right" icon={PanelRight}          label="Imagem à direita, texto ao lado" />

        {/* Clear break — only visible when wrapped */}
        {layoutMode !== 'block' && onInsertClearBreak && (
          <>
            <div className="w-px h-4 bg-gray-600 mx-0.5" />
            <button
              onClick={handleClearBreak}
              className="flex items-center gap-1 px-1.5 py-1 rounded-md text-teal-300 hover:text-teal-200 hover:bg-teal-500/20 transition-colors text-[10px]"
              title="Inserir quebra: continuar abaixo da imagem (Ctrl+Shift+Enter)"
            >
              <ArrowDownToLine size={13} />
              <span className="whitespace-nowrap">Abaixo</span>
            </button>
          </>
        )}

        <div className="w-px h-4 bg-gray-600 mx-0.5" />

        {/* Reset size */}
        <button
          onClick={handleResetSize}
          className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Tamanho original"
        >
          <Maximize2 size={14} />
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
          title="Remover imagem"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Size + mode label below image */}
      <div
        className="absolute z-30 flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-gray-900/70 px-2 py-0.5 rounded"
        style={{
          left: rect.x + rect.width / 2,
          top: rect.y + rect.height + 6,
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{sizeLabel}</span>
        {layoutMode !== 'block' && (
          <>
            <span className="text-gray-500">·</span>
            <span className="text-teal-400">
              {layoutMode === 'wrap-left' ? 'Texto à direita' : 'Texto à esquerda'}
            </span>
          </>
        )}
      </div>
    </>
  );
}

// ── Helper: find nearest drop target ──────────────────────

function getDropTarget(
  ev: MouseEvent,
  editor: HTMLElement,
): { element: Element | null; position: 'before' | 'after' } {
  const children = Array.from(editor.children);
  let closest: { element: Element | null; distance: number; position: 'before' | 'after' } = {
    element: null, distance: Infinity, position: 'before',
  };

  for (const child of children) {
    const r = child.getBoundingClientRect();
    const dT = Math.abs(ev.clientY - r.top);
    const dB = Math.abs(ev.clientY - r.bottom);
    if (dT < closest.distance) closest = { element: child, distance: dT, position: 'before' };
    if (dB < closest.distance) closest = { element: child, distance: dB, position: 'after' };
  }
  return { element: closest.element, position: closest.position };
}