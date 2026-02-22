// ============================================================
// Axon — Summary Canvas Editor (WYSIWYG page-based editor)
// Uses native contentEditable for rich text, styled as A4 pages.
// Supports drag & drop images, auto-save, word count, keyword marking.
// PARALLEL-SAFE: independent from student area.
// ============================================================
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize, FileText,
  Clock, Type as TypeIcon, CheckCircle2, AlertCircle, Tag,
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';
import * as api from '@/app/services/platformApi';
import type { Summary } from '@/app/types/platform';
import { EditorToolbar } from './EditorToolbar';
import { ImageOverlay } from './ImageOverlay';
import type { TreeSelection } from './CurriculumTree';

// ── Types ────────────────────────────────────────────────

interface SummaryCanvasEditorProps {
  summary: Summary | null;
  selection: TreeSelection;
  onBack: () => void;
  onSaved?: (summary: Summary) => void;
}

// ── Breadcrumb ───────────────────────────────────────────

function EditorBreadcrumb({ selection }: { selection: TreeSelection }) {
  const parts = [
    selection.course?.name,
    selection.semester?.name,
    selection.section?.name,
    selection.topic?.name,
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-1 text-xs text-gray-400 overflow-hidden">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300">/</span>}
          <span className="truncate max-w-[120px]">{part}</span>
        </span>
      ))}
    </div>
  );
}

// ── Status Bar ───────────────────────────────────────────

function EditorStatusBar({
  wordCount,
  charCount,
  lastSaved,
  autoSaveEnabled,
  hasUnsavedChanges,
}: {
  wordCount: number;
  charCount: number;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  hasUnsavedChanges: boolean;
}) {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-1.5 flex items-center gap-4 text-[11px] text-gray-400 shrink-0">
      <div className="flex items-center gap-1.5">
        <TypeIcon size={11} />
        <span>{wordCount} palavras · {charCount} caracteres</span>
      </div>

      <div className="flex-1" />

      {hasUnsavedChanges && (
        <div className="flex items-center gap-1 text-amber-500">
          <AlertCircle size={11} />
          <span>Alteracoes nao salvas</span>
        </div>
      )}

      {lastSaved && !hasUnsavedChanges && (
        <div className="flex items-center gap-1 text-emerald-500">
          <CheckCircle2 size={11} />
          <span>Salvo {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}

      {autoSaveEnabled && (
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>Auto-save ativo</span>
        </div>
      )}
    </div>
  );
}

// ── Keyword Toast (floating notification for marking) ────

function KeywordToast({
  visible,
  selectedText,
  onMark,
  onDismiss,
}: {
  visible: boolean;
  selectedText: string;
  onMark: () => void;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3"
        >
          <Tag size={14} className="text-purple-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate max-w-[200px]">
              &ldquo;{selectedText}&rdquo;
            </p>
            <p className="text-[10px] text-gray-400">Marcar como keyword?</p>
          </div>
          <button
            onClick={onMark}
            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-medium transition-colors shrink-0"
          >
            Marcar
          </button>
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
          >
            Nao
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Component ───────────────────────────────────────

export function SummaryCanvasEditor({ summary, selection, onBack, onSaved }: SummaryCanvasEditorProps) {
  const [title, setTitle] = useState(summary?.title || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published' | 'rejected'>(summary?.status || 'draft');
  const [summaryId, setSummaryId] = useState<string | null>(summary?.id || null);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    summary?.updated_at ? new Date(summary.updated_at) : null
  );
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Keyword selection
  const [keywordSelection, setKeywordSelection] = useState<{ text: string; range: Range } | null>(null);

  // Image selection for resize/move overlay
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const summaryIdRef = useRef<string | null>(summaryId);
  const titleRef = useRef(title);
  const autoSaveRef = useRef<() => void>(() => {});

  // Keep refs in sync
  useEffect(() => {
    summaryIdRef.current = summaryId;
  }, [summaryId]);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && summary?.content_markdown) {
      editorRef.current.innerHTML = summary.content_markdown;
      updateWordCount();
    }
    // Ensure trailing clear paragraph on mount (after content loaded)
    requestAnimationFrame(() => ensureTrailingClear());
  }, []);

  // ── Word/char count ──────────────────────────────────

  const updateWordCount = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, []);

  // ── Get editor HTML ──────────────────────────────────

  const getEditorHTML = useCallback(() => {
    if (!editorRef.current) return '';
    // Clone so we can strip the trailing sentinel without affecting live DOM
    const clone = editorRef.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.axon-trailing-clear').forEach(el => el.remove());
    return clone.innerHTML;
  }, []);

  // ── Ensure trailing clear paragraph ──────────────────
  // Always keep a clickable paragraph at the very bottom that
  // clears floats.  This gives the user somewhere to click /
  // type below a floated image without requiring any manual
  // "clear break" action.

  const ensureTrailingClear = useCallback(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;

    // Check if there are any active floats in the editor
    const hasFloats = editor.querySelector(
      'figure[data-layout="wrap-left"], figure[data-layout="wrap-right"]'
    );

    // Remove any stale sentinels that aren't at the very end
    const sentinels = editor.querySelectorAll('.axon-trailing-clear');
    sentinels.forEach((s, i) => {
      // Keep the last one if it IS the last child
      if (i === sentinels.length - 1 && s === editor.lastElementChild && hasFloats) return;
      s.remove();
    });

    if (!hasFloats) return; // no floats → no sentinel needed

    // Already have a valid trailing sentinel?
    if (editor.lastElementChild?.classList?.contains('axon-trailing-clear')) return;

    // Create the sentinel — a real editable <p> so the user can
    // click it and type naturally.
    const sentinel = document.createElement('p');
    sentinel.className = 'axon-trailing-clear';
    sentinel.style.clear = 'both';
    sentinel.innerHTML = '<br>';
    editor.appendChild(sentinel);
  }, []);

  // ── Handle content changes ───────────────────────────

  const handleInput = useCallback(() => {
    setHasUnsavedChanges(true);
    updateWordCount();

    // Maintain trailing clear sentinel when floats exist
    ensureTrailingClear();

    // Auto-save debounce (5 seconds after last change)
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveRef.current();
    }, 5000);
  }, [updateWordCount, ensureTrailingClear]);

  // ── Auto-save ────────────────────────────────────────

  const handleAutoSave = useCallback(async () => {
    if (!selection.topicId) return;
    const currentSummaryId = summaryIdRef.current;
    const currentTitle = titleRef.current;
    try {
      const content_markdown = getEditorHTML();
      if (currentSummaryId) {
        await api.updateSummary(currentSummaryId, {
          content_markdown,
          title: currentTitle || undefined,
        });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Auto-save error:', err);
      toast.error('Erro no auto-save', { duration: 2000 });
    }
  }, [selection.topicId, getEditorHTML]);

  // Keep autoSaveRef always pointing to the latest handleAutoSave
  useEffect(() => {
    autoSaveRef.current = handleAutoSave;
  }, [handleAutoSave]);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // ── Insert image at cursor ───────────────────────────

  const handleInsertImage = useCallback((src: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '8px';
    img.style.margin = '12px 0';
    img.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    img.style.cursor = 'pointer';
    img.draggable = true;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      // Wrap in a figure with caption
      const figure = document.createElement('figure');
      figure.style.margin = '16px 0';
      figure.style.textAlign = 'center';
      figure.appendChild(img);

      const caption = document.createElement('figcaption');
      caption.contentEditable = 'true';
      caption.style.fontSize = '12px';
      caption.style.color = '#6b7280';
      caption.style.fontStyle = 'italic';
      caption.style.marginTop = '6px';
      caption.textContent = 'Legenda da imagem...';
      figure.appendChild(caption);

      range.insertNode(figure);

      // Move cursor after figure
      range.setStartAfter(figure);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    setHasUnsavedChanges(true);
  }, []);

  // ── Insert Clear Break (escape float context) ─────────

  /**
   * Inserts a "clear break" element that forces subsequent content
   * below any floated images.  Two modes:
   *   - afterFigure provided → insert right after that element
   *   - no afterFigure       → insert at current cursor position
   * The break is a visible dashed line in the editor and invisible
   * in preview (just a `clear:both`).
   */
  const handleInsertClearBreak = useCallback((afterFigure?: HTMLElement) => {
    if (!editorRef.current) return;

    // Build the clear-break element
    const clearDiv = document.createElement('div');
    clearDiv.className = 'axon-clear-break';
    clearDiv.setAttribute('contenteditable', 'false');
    clearDiv.style.clear = 'both';

    // Also insert an empty paragraph after it so the cursor has
    // somewhere to land and the user can keep typing below.
    const nextP = document.createElement('p');
    nextP.innerHTML = '<br>';

    if (afterFigure && editorRef.current.contains(afterFigure)) {
      // ── Mode A: after a specific figure (from ImageOverlay button)
      // Walk forward past any siblings that are NOT clear-breaks
      // to find the right insertion point (after the content that
      // wraps beside the image, not immediately after the figure).
      // But for simplicity & predictability, insert right after the figure.
      afterFigure.parentNode?.insertBefore(clearDiv, afterFigure.nextSibling);
      clearDiv.parentNode?.insertBefore(nextP, clearDiv.nextSibling);
    } else {
      // ── Mode B: at cursor position (from toolbar / keyboard shortcut)
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();

        // Find the block-level parent to insert after
        let block: Node | null = range.startContainer;
        while (block && block !== editorRef.current && block.parentNode !== editorRef.current) {
          block = block.parentNode;
        }
        if (block && block !== editorRef.current) {
          block.parentNode?.insertBefore(clearDiv, block.nextSibling);
          clearDiv.parentNode?.insertBefore(nextP, clearDiv.nextSibling);
        } else {
          // Fallback: append at end
          editorRef.current.appendChild(clearDiv);
          editorRef.current.appendChild(nextP);
        }
      } else {
        editorRef.current.appendChild(clearDiv);
        editorRef.current.appendChild(nextP);
      }
    }

    // Place cursor in the new paragraph
    const newRange = document.createRange();
    newRange.setStart(nextP, 0);
    newRange.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(newRange);
    editorRef.current.focus();

    setHasUnsavedChanges(true);
    updateWordCount();
  }, [updateWordCount]);

  // ── Image selection (click to select, ESC/click-outside to deselect) ──

  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && editorRef.current?.contains(target)) {
      e.preventDefault();
      setSelectedImage(target as HTMLImageElement);
    } else if (selectedImage && !target.closest('[data-image-overlay]')) {
      setSelectedImage(null);
    }
  }, [selectedImage]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [selectedImage]);

  const handleImageChange = useCallback(() => {
    setHasUnsavedChanges(true);
    // Re-check trailing clear after layout mode changes
    requestAnimationFrame(() => ensureTrailingClear());
  }, [ensureTrailingClear]);

  // ── Drag & Drop images ───────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (!files?.length) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleInsertImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [handleInsertImage]);

  // ── Keyword detection on text selection ───────────────

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current) {
      setKeywordSelection(null);
      return;
    }

    // Check if selection is inside our editor
    const anchorNode = sel.anchorNode;
    if (!anchorNode || !editorRef.current.contains(anchorNode)) {
      setKeywordSelection(null);
      return;
    }

    const text = sel.toString().trim();
    // Show keyword prompt for 1-4 word selections
    if (text.length >= 2 && text.split(/\s+/).length <= 4) {
      const range = sel.getRangeAt(0).cloneRange();
      setKeywordSelection({ text, range });
    } else {
      setKeywordSelection(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // ── Mark keyword (wraps selected text in a styled span) ─

  const handleMarkKeyword = useCallback(() => {
    if (!keywordSelection || !editorRef.current) return;

    const { range, text } = keywordSelection;

    // Create keyword span
    const span = document.createElement('span');
    span.className = 'axon-keyword';
    span.setAttribute('data-keyword', text);
    span.style.backgroundColor = '#ddd6fe';
    span.style.color = '#6d28d9';
    span.style.padding = '1px 4px';
    span.style.borderRadius = '3px';
    span.style.fontWeight = '600';
    span.style.cursor = 'pointer';
    span.title = `Keyword: ${text}`;

    try {
      range.surroundContents(span);
    } catch {
      // If selection spans multiple elements, use extractContents
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }

    setKeywordSelection(null);
    setHasUnsavedChanges(true);

    toast.success(`Keyword marcada: "${text}"`, {
      description: 'A keyword foi destacada no texto.',
      duration: 2000,
    });
  }, [keywordSelection]);

  // ── Save handler ─────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!selection.topicId) return;
    setSaving(true);
    try {
      const content_markdown = getEditorHTML();
      if (summaryId) {
        const updated = await api.updateSummary(summaryId, {
          title: title || undefined,
          content_markdown,
          status,
        });
        onSaved?.(updated);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast.success('Resumo salvo!', { duration: 2000 });
      } else {
        const created = await api.createSummary({
          topic_id: selection.topicId!,
          title: title || undefined,
          content_markdown,
          status: 'draft',
        });
        setSummaryId(created.id);
        onSaved?.(created);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast.success('Resumo criado!', { duration: 2000 });
      }
    } catch (err) {
      console.error('Error saving summary:', err);
      toast.error('Erro ao salvar resumo');
    }
    setSaving(false);
  }, [summaryId, title, status, selection, getEditorHTML, onSaved]);

  // ── Publish handler ──────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (!selection.topicId) return;
    setSaving(true);
    try {
      const content_markdown = getEditorHTML();
      if (summaryId) {
        const updated = await api.updateSummary(summaryId, {
          title: title || undefined,
          content_markdown,
          status: 'published',
        });
        setStatus('published');
        onSaved?.(updated);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast.success('Resumo publicado!', {
          description: 'Os alunos ja podem acessar este conteudo.',
          duration: 3000,
        });
      } else {
        const created = await api.createSummary({
          topic_id: selection.topicId!,
          title: title || undefined,
          content_markdown,
          status: 'published',
        });
        setSummaryId(created.id);
        setStatus('published');
        onSaved?.(created);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast.success('Resumo publicado!', { duration: 3000 });
      }
    } catch (err) {
      console.error('Error publishing summary:', err);
      toast.error('Erro ao publicar resumo');
    }
    setSaving(false);
  }, [summaryId, title, selection, getEditorHTML, onSaved]);

  // ── Keyboard shortcuts ───────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Shift+Enter → insert clear break at cursor
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleInsertClearBreak();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleInsertClearBreak]);

  // ── Zoom ─────────────────────────────────────────────

  const handleZoomIn = () => setZoom(z => Math.min(z + 10, 150));
  const handleZoomOut = () => setZoom(z => Math.max(z - 10, 60));

  // ── Fullscreen ───────────────────────────────────────

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsFullscreen(!isFullscreen);
  };

  // ── Warn on navigate away with unsaved changes ───────

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ── Handle back with unsaved check ───────────────────

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = confirm('Voce tem alteracoes nao salvas. Deseja sair sem salvar?');
      if (!confirmed) return;
    }
    onBack();
  }, [hasUnsavedChanges, onBack]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        'flex flex-col h-full bg-gray-100',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* ── Top Bar: Back + Title + Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-medium">Voltar</span>
        </button>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex-1 min-w-0 flex flex-col">
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true); }}
            placeholder="Titulo do resumo..."
            className="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none placeholder:text-gray-300 w-full"
          />
          <EditorBreadcrumb selection={selection} />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 text-gray-400">
          <button onClick={handleZoomOut} className="p-1 hover:bg-gray-100 rounded" title="Diminuir zoom">
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] font-mono w-8 text-center">{zoom}%</span>
          <button onClick={handleZoomIn} className="p-1 hover:bg-gray-100 rounded" title="Aumentar zoom">
            <ZoomIn size={14} />
          </button>
          <button onClick={toggleFullscreen} className="p-1 hover:bg-gray-100 rounded ml-1">
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <EditorToolbar
        editorRef={editorRef}
        onInsertImage={handleInsertImage}
        onInsertClearBreak={() => handleInsertClearBreak()}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={() => setShowPreview(!showPreview)}
        saving={saving}
        status={status}
      />

      {/* ── Canvas Area ── */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div
          className="mx-auto py-8 transition-transform origin-top"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* A4-like Page */}
          <div
            className={clsx(
              'bg-white rounded-sm mx-auto relative',
              'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)]',
              'border border-gray-200/60',
              isDragOver && 'ring-2 ring-purple-400 ring-offset-2',
            )}
            style={{
              width: '816px',
              minHeight: '1056px',
              padding: '72px 80px',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drop overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-purple-50/80 backdrop-blur-sm flex items-center justify-center rounded-sm z-10 pointer-events-none">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
                    <FileText size={28} className="text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-purple-700">Solte a imagem aqui</p>
                </div>
              </div>
            )}

            {/* Title rendered on page */}
            {title && (
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h1 style={{ fontSize: '1.75em', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                  {title}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={clsx(
                    'text-[9px] px-1.5 py-0.5 rounded-full font-semibold',
                    status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
                  )}>
                    {status === 'draft' ? 'RASCUNHO' : 'PUBLICADO'}
                  </span>
                  {summaryId && (
                    <span className="text-[10px] text-gray-400">
                      v{summary?.version || 1}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Preview Mode */}
            {showPreview ? (
              <div
                className="axon-canvas-preview"
                dangerouslySetInnerHTML={{ __html: getEditorHTML() }}
              />
            ) : (
              /* contentEditable Editor */
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                className="outline-none min-h-[800px] axon-canvas-ce"
                style={{
                  lineHeight: 1.7,
                  color: '#1f2937',
                  fontSize: '14px',
                  caretColor: '#8b5cf6',
                  overflow: 'hidden', // contain floated images
                }}
                data-placeholder="Comece a escrever o resumo aqui..."
                onClick={handleEditorClick}
              />
            )}

            {/* Image Resize/Move Overlay */}
            {!showPreview && selectedImage && (
              <ImageOverlay
                selectedImage={selectedImage}
                editorRef={editorRef}
                onChange={handleImageChange}
                onDeselect={() => setSelectedImage(null)}
                onInsertClearBreak={handleInsertClearBreak}
              />
            )}
          </div>

          {/* Page footer */}
          <div className="text-center text-[10px] text-gray-400 mt-3 pb-4">
            {selection.course?.name} · {selection.topic?.name} · Pagina 1
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <EditorStatusBar
        wordCount={wordCount}
        charCount={charCount}
        lastSaved={lastSaved}
        autoSaveEnabled={!!summaryId}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* ── Keyword Selection Toast ── */}
      <KeywordToast
        visible={!!keywordSelection}
        selectedText={keywordSelection?.text || ''}
        onMark={handleMarkKeyword}
        onDismiss={() => setKeywordSelection(null)}
      />

      {/* Editor styles */}
      <style>{`
        .axon-canvas-ce:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
        }
        .axon-canvas-ce h1,
        .axon-canvas-preview h1 {
          font-size: 1.75em;
          font-weight: 700;
          color: #111827;
          margin: 0.8em 0 0.3em;
          line-height: 1.3;
        }
        .axon-canvas-ce h2,
        .axon-canvas-preview h2 {
          font-size: 1.35em;
          font-weight: 700;
          color: #1f2937;
          margin: 0.7em 0 0.3em;
          line-height: 1.3;
        }
        .axon-canvas-ce h3,
        .axon-canvas-preview h3 {
          font-size: 1.15em;
          font-weight: 600;
          color: #374151;
          margin: 0.6em 0 0.2em;
          line-height: 1.3;
        }
        .axon-canvas-ce p,
        .axon-canvas-preview p {
          margin: 0.5em 0;
          line-height: 1.7;
        }
        .axon-canvas-ce ul,
        .axon-canvas-ce ol,
        .axon-canvas-preview ul,
        .axon-canvas-preview ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .axon-canvas-ce li,
        .axon-canvas-preview li {
          margin: 0.2em 0;
          color: #374151;
        }
        .axon-canvas-ce blockquote,
        .axon-canvas-preview blockquote {
          border-left: 3px solid #a78bfa;
          padding-left: 1em;
          margin: 0.8em 0;
          color: #6b7280;
          font-style: italic;
        }
        .axon-canvas-ce hr,
        .axon-canvas-preview hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.5em 0;
        }
        .axon-canvas-ce img,
        .axon-canvas-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 12px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .axon-canvas-ce figure,
        .axon-canvas-preview figure {
          margin: 16px 0;
          text-align: center;
        }
        .axon-canvas-ce figure[data-layout="wrap-left"],
        .axon-canvas-preview figure[data-layout="wrap-left"] {
          float: left;
          margin: 4px 20px 12px 0;
          max-width: 50%;
        }
        .axon-canvas-ce figure[data-layout="wrap-right"],
        .axon-canvas-preview figure[data-layout="wrap-right"] {
          float: right;
          margin: 4px 0 12px 20px;
          max-width: 50%;
        }
        .axon-canvas-ce figure[data-layout="wrap-left"] + *,
        .axon-canvas-ce figure[data-layout="wrap-right"] + *,
        .axon-canvas-preview figure[data-layout="wrap-left"] + *,
        .axon-canvas-preview figure[data-layout="wrap-right"] + * {
          /* Prevent first paragraph after floated figure from collapsing */
          overflow: hidden;
        }
        .axon-canvas-ce figcaption,
        .axon-canvas-preview figcaption {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
          margin-top: 6px;
        }
        .axon-canvas-ce strong,
        .axon-canvas-preview strong {
          font-weight: 700;
          color: #111827;
        }
        .axon-canvas-ce .axon-keyword,
        .axon-canvas-preview .axon-keyword {
          background-color: #ddd6fe;
          color: #6d28d9;
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .axon-canvas-ce .axon-keyword:hover {
          background-color: #c4b5fd;
        }
        .axon-canvas-ce img {
          cursor: pointer;
          transition: box-shadow 0.15s ease;
        }
        .axon-canvas-ce img:hover {
          box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.4), 0 1px 3px rgba(0,0,0,0.1);
        }
        .axon-canvas-ce .axon-clear-break {
          clear: both;
          border: none;
          border-top: 1px dashed #d1d5db;
          margin: 12px 0;
          padding: 0;
          height: 0;
          position: relative;
          cursor: default;
          user-select: none;
        }
        .axon-canvas-ce .axon-clear-break::after {
          content: 'continuar abaixo';
          position: absolute;
          left: 50%;
          top: -8px;
          transform: translateX(-50%);
          font-size: 9px;
          color: #9ca3af;
          background: white;
          padding: 0 8px;
          letter-spacing: 0.05em;
        }
        .axon-canvas-ce .axon-clear-break:hover {
          border-top-color: #f87171;
        }
        .axon-canvas-ce .axon-clear-break:hover::after {
          content: 'continuar abaixo  (Backspace para remover)';
          color: #f87171;
        }
        .axon-canvas-preview .axon-clear-break {
          clear: both;
          height: 0;
          margin: 0;
          padding: 0;
          border: none;
          font-size: 0;
          line-height: 0;
        }
        /* Trailing sentinel: editable paragraph that clears floats.
           Gives user a clickable zone below floated images.
           min-height ensures it's always big enough to click on. */
        .axon-canvas-ce .axon-trailing-clear {
          clear: both;
          min-height: 2em;
        }
        .axon-canvas-ce .axon-trailing-clear:only-child {
          /* Don't show sentinel if editor is otherwise empty */
          min-height: 0;
        }
      `}</style>
    </motion.div>
  );
}