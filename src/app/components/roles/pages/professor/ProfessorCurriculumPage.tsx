// ============================================================
// Axon — Professor: Curriculum Page
// Two views: Tree Navigation ↔ Canvas Editor
// PARALLEL-SAFE: This file is independent. Edit freely.
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ListTree, FileText, BookOpen, Loader2, Plus, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import * as api from '@/app/services/platformApi';
import { usePlatformData } from '@/app/context/PlatformDataContext';
import type { Summary, UUID } from '@/app/types/platform';
import { CurriculumTree, type TreeSelection } from './curriculum/CurriculumTree';
import { SummaryCanvasEditor } from './curriculum/SummaryCanvasEditor';
import { QuickCreateModal } from './curriculum/QuickCreateModal';

// ── View mode ────────────────────────────────────────────

type ViewMode = 'tree' | 'editor';

// ── Main Page Component ──────────────────────────────────

export function ProfessorCurriculumPage() {
  const { loading, courses, institutionId } = usePlatformData();
  const [view, setView] = useState<ViewMode>('tree');
  const [editorSelection, setEditorSelection] = useState<TreeSelection | null>(null);
  const [editorSummary, setEditorSummary] = useState<Summary | null>(null);
  const [creating, setCreating] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // ── Open editor for existing summary ─────────────────

  const handleSelectSummary = useCallback((sel: TreeSelection & { summary: Summary }) => {
    setEditorSelection(sel);
    setEditorSummary(sel.summary);
    setView('editor');
  }, []);

  // ── Create new summary and open editor ───────────────

  const handleCreateSummary = useCallback(async (sel: TreeSelection & { topicId: UUID }) => {
    setCreating(true);
    try {
      const newSummary = await api.createSummary({
        topic_id: sel.topicId,
        title: `Novo Resumo - ${sel.topic?.name || 'Sem titulo'}`,
        content_markdown: '',
        status: 'draft',
      });
      setEditorSelection(sel);
      setEditorSummary(newSummary);
      setView('editor');
    } catch (err) {
      console.error('Error creating summary:', err);
    }
    setCreating(false);
  }, []);

  // ── Quick create callback ───────────────────────────

  const handleQuickCreated = useCallback((selection: TreeSelection, summary: Summary) => {
    setQuickCreateOpen(false);
    setEditorSelection(selection);
    setEditorSummary(summary);
    setView('editor');
  }, []);

  // ── Quick open existing callback ────────────────────

  const handleQuickOpenExisting = useCallback((selection: TreeSelection, summary: Summary) => {
    setQuickCreateOpen(false);
    setEditorSelection(selection);
    setEditorSummary(summary);
    setView('editor');
  }, []);

  // ── Back to tree ─────────────────────────────────────

  const handleBackToTree = useCallback(() => {
    setView('tree');
    setEditorSummary(null);
    setEditorSelection(null);
  }, []);

  // ── Saved callback ───────────────────────────────────

  const handleSaved = useCallback((updated: Summary) => {
    setEditorSummary(updated);
  }, []);

  // ── Loading state ────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-purple-500" />
          <p className="text-sm text-gray-400">Carregando curriculum...</p>
        </div>
      </div>
    );
  }

  // ── Editor View ──────────────────────────────────────

  if (view === 'editor' && editorSelection) {
    return (
      <SummaryCanvasEditor
        summary={editorSummary}
        selection={editorSelection}
        onBack={handleBackToTree}
        onSaved={handleSaved}
      />
    );
  }

  // ── Tree View (default) ──────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <ListTree size={18} className="text-purple-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Curriculum</h1>
              <p className="text-xs text-gray-500">
                Gerencie cursos, semestres, secoes, topicos e resumos
              </p>
            </div>
          </div>

          {/* Prominent Create Button */}
          <button
            onClick={() => setQuickCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-200"
          >
            <FileText size={16} />
            Abrir / Criar Resumo
          </button>
        </div>
      </div>

      {/* Split Panel: Tree + Welcome/Details */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" autoSaveId="professor-curriculum-split">
          {/* Left: Curriculum Tree */}
          <Panel defaultSize={35} minSize={25} maxSize={50}>
            <div className="h-full bg-white border-r border-gray-100 overflow-hidden flex flex-col">
              <CurriculumTree
                onSelectSummary={handleSelectSummary}
                onCreateSummary={handleCreateSummary}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-gray-50 hover:bg-purple-200 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-0.5 h-8 bg-gray-300 rounded-full" />
          </PanelResizeHandle>

          {/* Right: Welcome / Details Panel */}
          <Panel defaultSize={65} minSize={40}>
            <div className="h-full overflow-auto bg-gray-50">
              <WelcomePanel
                courseCount={courses.length}
                creating={creating}
                onQuickCreate={() => setQuickCreateOpen(true)}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Quick Create Modal */}
      <QuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreated={handleQuickCreated}
        onOpenExisting={handleQuickOpenExisting}
      />
    </div>
  );
}

// ── Welcome Panel (shown when no summary is selected) ────

function WelcomePanel({ courseCount, creating, onQuickCreate }: { courseCount: number; creating: boolean; onQuickCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {creating ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-purple-500" />
            <p className="text-sm text-gray-500">Criando resumo...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Editor de Resumos
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Crie e edite resumos para seus alunos. Use o botao abaixo para comecar rapidamente, ou navegue pela arvore ao lado.
            </p>

            {/* Prominent CTA */}
            <button
              onClick={onQuickCreate}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-200 mb-8"
            >
              <Plus size={18} />
              Criar Novo Resumo
            </button>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatsCard
                icon={<BookOpen size={16} />}
                label="Cursos"
                value={courseCount}
                color="purple"
              />
              <StatsCard
                icon={<ListTree size={16} />}
                label="Hierarquia"
                value="4 niveis"
                color="blue"
              />
              <StatsCard
                icon={<FileText size={16} />}
                label="Editor"
                value="Canvas"
                color="teal"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Duas formas de criar
              </p>
              <div className="space-y-2">
                {[
                  { text: 'Botao "Criar Resumo" — selects em cascata, rapido e direto', highlight: true },
                  { text: 'Arvore lateral — expanda curso > semestre > secao > topico', highlight: false },
                  { text: 'Edite no canvas visual com imagens e formatacao', highlight: false },
                  { text: 'Salve como rascunho ou publique para os alunos', highlight: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      step.highlight ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`text-xs ${step.highlight ? 'text-purple-700 font-medium' : 'text-gray-600'}`}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ── Stats Card ───────────────────────────────────────────

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5', c.bg, c.text)}>
        {icon}
      </div>
      <p className="text-lg font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}