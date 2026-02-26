// ============================================================
// Axon — Editor Toolbar (Professor Summary Canvas)
// Uses document.execCommand for contentEditable formatting.
// PARALLEL-SAFE: independent component.
// ============================================================
import React, { useCallback, useRef } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  Image as ImageIcon, Minus, Quote, Undo2, Redo2,
  Highlighter, Save, Eye, Send, Type,
  ArrowDownToLine,
} from 'lucide-react';
import clsx from 'clsx';

interface EditorToolbarProps {
  /** Ref to the contentEditable element */
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInsertImage: (src: string) => void;
  onInsertClearBreak: () => void;
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  saving: boolean;
  status: 'draft' | 'published' | 'rejected';
}

function ToolButton({
  icon,
  label,
  isActive,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // prevent losing focus from contentEditable
        onClick();
      }}
      disabled={disabled}
      title={label}
      className={clsx(
        'p-1.5 rounded-md transition-all',
        isActive
          ? 'bg-purple-100 text-purple-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

export function EditorToolbar({
  editorRef,
  onInsertImage,
  onInsertClearBreak,
  onSave,
  onPublish,
  onPreview,
  saving,
  status,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }, [editorRef]);

  const formatBlock = useCallback((tag: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
  }, [editorRef]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onInsertImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [onInsertImage]);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-0.5 flex-wrap">
      {/* Undo / Redo */}
      <ToolButton icon={<Undo2 size={15} />} label="Desfazer (Ctrl+Z)" onClick={() => exec('undo')} />
      <ToolButton icon={<Redo2 size={15} />} label="Refazer (Ctrl+Y)" onClick={() => exec('redo')} />

      <Divider />

      {/* Block format */}
      <ToolButton icon={<Type size={15} />} label="Paragrafo" onClick={() => formatBlock('p')} />
      <ToolButton icon={<Heading1 size={15} />} label="Titulo 1" onClick={() => formatBlock('h1')} />
      <ToolButton icon={<Heading2 size={15} />} label="Titulo 2" onClick={() => formatBlock('h2')} />
      <ToolButton icon={<Heading3 size={15} />} label="Titulo 3" onClick={() => formatBlock('h3')} />

      <Divider />

      {/* Text formatting */}
      <ToolButton icon={<Bold size={15} />} label="Negrito (Ctrl+B)" onClick={() => exec('bold')} />
      <ToolButton icon={<Italic size={15} />} label="Italico (Ctrl+I)" onClick={() => exec('italic')} />
      <ToolButton icon={<UnderlineIcon size={15} />} label="Sublinhado (Ctrl+U)" onClick={() => exec('underline')} />
      <ToolButton icon={<Strikethrough size={15} />} label="Riscado" onClick={() => exec('strikeThrough')} />
      <ToolButton icon={<Highlighter size={15} />} label="Destacar" onClick={() => exec('hiliteColor', '#fef08a')} />

      <Divider />

      {/* Lists */}
      <ToolButton icon={<List size={15} />} label="Lista" onClick={() => exec('insertUnorderedList')} />
      <ToolButton icon={<ListOrdered size={15} />} label="Lista numerada" onClick={() => exec('insertOrderedList')} />
      <ToolButton icon={<Quote size={15} />} label="Citacao" onClick={() => formatBlock('blockquote')} />
      <ToolButton icon={<Minus size={15} />} label="Linha divisoria" onClick={() => exec('insertHorizontalRule')} />
      <ToolButton
        icon={<ArrowDownToLine size={15} />}
        label="Quebra de fluxo — continuar abaixo de imagem flutuante (Ctrl+Shift+Enter)"
        onClick={onInsertClearBreak}
      />

      <Divider />

      {/* Image */}
      <ToolButton
        icon={<ImageIcon size={15} />}
        label="Inserir imagem"
        onClick={() => fileInputRef.current?.click()}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status badge */}
      <span className={clsx(
        'text-[10px] px-2 py-0.5 rounded-full font-semibold mr-2',
        status === 'draft' && 'bg-amber-100 text-amber-700',
        status === 'published' && 'bg-emerald-100 text-emerald-700',
        status === 'rejected' && 'bg-red-100 text-red-700',
      )}>
        {status === 'draft' ? 'Rascunho' : status === 'published' ? 'Publicado' : 'Rejeitado'}
      </span>

      {/* Actions */}
      <button
        onClick={onPreview}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Eye size={14} />
        Preview
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors disabled:opacity-50"
      >
        <Save size={14} />
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
      <button
        onClick={onPublish}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
      >
        <Send size={14} />
        Publicar
      </button>
    </div>
  );
}
