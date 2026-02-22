// ============================================================
// Axon — Summary Quick Access Modal
// Unified: browse existing summaries OR create a new one.
// Cascading selects: Course → Semester → Section → Topic
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, BookOpen, Calendar, Layers, FileText, Plus, Loader2, AlertCircle, Sparkles, Pencil, Check } from 'lucide-react';
import clsx from 'clsx';
import * as api from '@/services/platformApi';
import { usePlatformData } from '@/context/PlatformDataContext';
import type { Course, Semester, Section, Topic, Summary, UUID } from '@/types/platform';
import type { TreeSelection } from './CurriculumTree';

interface QuickCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (selection: TreeSelection, summary: Summary) => void;
  onOpenExisting?: (selection: TreeSelection, summary: Summary) => void;
}

function CascadeSelect<T extends { id: string; name: string }>({ label, icon, items, selected, onSelect, loading, disabled, placeholder, accentColor, onCreateNew, createLabel, createPlaceholder, creatingNew }: { label: string; icon: React.ReactNode; items: T[]; selected: T | null; onSelect: (item: T) => void; loading: boolean; disabled: boolean; placeholder: string; accentColor: string; onCreateNew?: (name: string) => Promise<void>; createLabel?: string; createPlaceholder?: string; creatingNew?: boolean }) {
  const [open, setOpen] = useState(false);
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [newName, setNewName] = useState('');
  useEffect(() => { if (disabled) { setOpen(false); setShowInlineCreate(false); setNewName(''); } }, [disabled]);
  const showEmptyCreate = !disabled && !loading && items.length === 0 && onCreateNew && !showInlineCreate;
  const handleCreate = async () => { if (!newName.trim() || !onCreateNew) return; await onCreateNew(newName.trim()); setNewName(''); setShowInlineCreate(false); };
  return (
    <div className="relative">
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {showInlineCreate && (
        <div className="flex items-center gap-1.5 mb-2">
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) handleCreate(); if (e.key === 'Escape') { setShowInlineCreate(false); setNewName(''); } }} placeholder={createPlaceholder || 'Nome...'} disabled={creatingNew} className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-purple-300 bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-60" />
          <button onClick={handleCreate} disabled={!newName.trim() || creatingNew} className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors">{creatingNew ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
          <button onClick={() => { setShowInlineCreate(false); setNewName(''); }} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X size={14} /></button>
        </div>
      )}
      <button type="button" disabled={disabled || loading} onClick={() => { if (!showInlineCreate) setOpen(!open); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${disabled || loading ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : open ? 'bg-white border-purple-300 ring-2 ring-purple-100' : selected ? 'bg-white border-gray-200 text-gray-900 hover:border-purple-200' : 'bg-white border-gray-200 text-gray-400 hover:border-purple-200'}`}>
        <span className={`shrink-0 ${selected ? accentColor : 'text-gray-400'}`}>{icon}</span>
        <span className="flex-1 text-sm truncate">{loading ? 'Carregando...' : selected ? selected.name : placeholder}</span>
        {loading ? <Loader2 size={14} className="animate-spin text-gray-400 shrink-0" /> : <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      <AnimatePresence>
        {open && !disabled && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }} className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
            {items.map((item) => (<button key={item.id} type="button" onClick={() => { onSelect(item); setOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-purple-50 transition-colors ${selected?.id === item.id ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'}`}><span className={`shrink-0 ${selected?.id === item.id ? accentColor : 'text-gray-400'}`}>{icon}</span><span className="truncate">{item.name}</span></button>))}
            {onCreateNew && (<button type="button" onClick={() => { setOpen(false); setShowInlineCreate(true); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-purple-600 hover:bg-purple-50 transition-colors border-t border-gray-100 font-medium"><Plus size={14} className="shrink-0" />{createLabel || 'Criar novo'}</button>)}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      {showEmptyCreate && (<motion.div initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-purple-50 border border-purple-200"><AlertCircle size={14} className="text-purple-500 shrink-0" /><p className="text-xs text-purple-700 flex-1">Nenhum item encontrado.</p><button type="button" onClick={() => setShowInlineCreate(true)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-semibold hover:bg-purple-700 transition-colors shrink-0"><Plus size={11} />{createLabel || 'Criar'}</button></motion.div>)}
    </div>
  );
}

function SummaryCard({ summary, onClick }: { summary: Summary; onClick: () => void }) {
  const statusMap: Record<string, { label: string; color: string }> = { draft: { label: 'Rascunho', color: 'bg-amber-100 text-amber-700' }, published: { label: 'Publicado', color: 'bg-emerald-100 text-emerald-700' }, rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' } };
  const st = statusMap[summary.status] || statusMap.draft;
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 transition-all text-left group">
      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors"><Pencil size={14} className="text-purple-500" /></div>
      <div className="flex-1 min-w-0"><p className="text-sm text-gray-800 truncate font-medium">{summary.title || 'Resumo sem titulo'}</p><p className="text-[11px] text-gray-400">v{summary.version || 1} \u00b7 {new Date(summary.updated_at).toLocaleDateString('pt-BR')}</p></div>
      <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0', st.color)}>{st.label}</span>
    </button>
  );
}

export function QuickCreateModal({ open, onClose, onCreated, onOpenExisting }: QuickCreateModalProps) {
  const { courses, institutionId, refreshCourses } = usePlatformData();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [title, setTitle] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [existingSummaries, setExistingSummaries] = useState<Summary[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingChild, setCreatingChild] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => { if (open) { setSelectedCourse(null); setSelectedSemester(null); setSelectedSection(null); setSelectedTopic(null); setTitle(''); setSemesters([]); setSections([]); setTopics([]); setExistingSummaries([]); setShowCreateForm(false); } }, [open]);

  const handleSelectCourse = useCallback(async (course: Course) => { setSelectedCourse(course); setSelectedSemester(null); setSelectedSection(null); setSelectedTopic(null); setSections([]); setTopics([]); setExistingSummaries([]); setShowCreateForm(false); setLoadingSemesters(true); try { const result = await api.getSemesters(course.id); setSemesters((result as any)?.items || result || []); } catch { setSemesters([]); } setLoadingSemesters(false); }, []);
  const handleSelectSemester = useCallback(async (sem: Semester) => { setSelectedSemester(sem); setSelectedSection(null); setSelectedTopic(null); setTopics([]); setExistingSummaries([]); setShowCreateForm(false); setLoadingSections(true); try { const result = await api.getSections(sem.id); setSections((result as any)?.items || result || []); } catch { setSections([]); } setLoadingSections(false); }, []);
  const handleSelectSection = useCallback(async (sec: Section) => { setSelectedSection(sec); setSelectedTopic(null); setExistingSummaries([]); setShowCreateForm(false); setLoadingTopics(true); try { const result = await api.getTopics(sec.id); setTopics((result as any)?.items || result || []); } catch { setTopics([]); } setLoadingTopics(false); }, []);
  const handleSelectTopic = useCallback(async (topic: Topic) => { setSelectedTopic(topic); setShowCreateForm(false); setLoadingSummaries(true); try { const data = await api.getTopicSummaries(topic.id); setExistingSummaries(data); } catch { setExistingSummaries([]); } setLoadingSummaries(false); }, []);

  const handleCreateSemester = useCallback(async (name: string) => { if (!selectedCourse) return; setCreatingChild(true); try { const newSem = await api.createSemester({ course_id: selectedCourse.id, name }); setSemesters(prev => [...prev, newSem]); setSelectedSemester(newSem); setSelectedSection(null); setSelectedTopic(null); setSections([]); setTopics([]); setExistingSummaries([]); setLoadingSections(true); try { const result = await api.getSections(newSem.id); setSections((result as any)?.items || result || []); } catch { setSections([]); } setLoadingSections(false); } catch (err) { console.error(err); } setCreatingChild(false); }, [selectedCourse]);
  const handleCreateSection = useCallback(async (name: string) => { if (!selectedSemester) return; setCreatingChild(true); try { const newSec = await api.createSection({ semester_id: selectedSemester.id, name }); setSections(prev => [...prev, newSec]); setSelectedSection(newSec); setSelectedTopic(null); setTopics([]); setExistingSummaries([]); setLoadingTopics(true); try { const result = await api.getTopics(newSec.id); setTopics((result as any)?.items || result || []); } catch { setTopics([]); } setLoadingTopics(false); } catch (err) { console.error(err); } setCreatingChild(false); }, [selectedSemester]);
  const handleCreateTopic = useCallback(async (name: string) => { if (!selectedSection) return; setCreatingChild(true); try { const newTop = await api.createTopic({ section_id: selectedSection.id, name }); setTopics(prev => [...prev, newTop]); setSelectedTopic(newTop); setExistingSummaries([]); setLoadingSummaries(true); try { const data = await api.getTopicSummaries(newTop.id); setExistingSummaries(data); } catch { setExistingSummaries([]); } setLoadingSummaries(false); } catch (err) { console.error(err); } setCreatingChild(false); }, [selectedSection]);
  const handleCreateCourse = useCallback(async (name: string) => { if (!institutionId) return; setCreatingChild(true); try { await api.createCourse({ name, institution_id: institutionId }); await refreshCourses(); } catch (err) { console.error(err); } setCreatingChild(false); }, [institutionId, refreshCourses]);

  const buildSelection = useCallback((): TreeSelection => ({ courseId: selectedCourse?.id, semesterId: selectedSemester?.id, sectionId: selectedSection?.id, topicId: selectedTopic?.id, course: selectedCourse || undefined, semester: selectedSemester || undefined, section: selectedSection || undefined, topic: selectedTopic || undefined }), [selectedCourse, selectedSemester, selectedSection, selectedTopic]);
  const handleOpenSummary = useCallback((summary: Summary) => { const sel = buildSelection(); if (onOpenExisting) onOpenExisting(sel, summary); else onCreated(sel, summary); }, [buildSelection, onOpenExisting, onCreated]);
  const handleCreate = async () => { if (!selectedTopic || !selectedCourse) return; setCreating(true); try { const summaryTitle = title.trim() || `Novo Resumo - ${selectedTopic.name}`; const newSummary = await api.createSummary({ topic_id: selectedTopic.id, title: summaryTitle, content_markdown: '', status: 'draft' }); onCreated(buildSelection(), newSummary); } catch (err) { console.error(err); } setCreating(false); };

  const step = !selectedCourse ? 1 : !selectedSemester ? 2 : !selectedSection ? 3 : !selectedTopic ? 4 : 5;
  const topicSelected = !!selectedTopic;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-transparent to-teal-50 opacity-50" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Sparkles size={18} className="text-purple-600" /></div><div><h2 className="text-[15px] font-bold text-gray-900">Resumos</h2><p className="text-[11px] text-gray-500">Navegue ou crie a estrutura para chegar ao resumo</p></div></div>
                <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"><X size={18} /></button>
              </div>
              <div className="relative flex items-center gap-1.5 mt-4">{[1, 2, 3, 4].map((s) => (<div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s < step ? 'bg-purple-500' : s === step ? 'bg-purple-300' : 'bg-gray-200'}`} />))}</div>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <CascadeSelect label="1. Curso" icon={<BookOpen size={15} />} items={courses} selected={selectedCourse} onSelect={handleSelectCourse} loading={false} disabled={false} placeholder="Selecione um curso" accentColor="text-purple-500" onCreateNew={handleCreateCourse} createLabel="Criar novo curso" createPlaceholder="Nome do curso..." creatingNew={creatingChild} />
              <CascadeSelect label="2. Semestre" icon={<Calendar size={15} />} items={semesters} selected={selectedSemester} onSelect={handleSelectSemester} loading={loadingSemesters} disabled={!selectedCourse} placeholder={!selectedCourse ? 'Selecione o curso primeiro' : 'Selecione ou crie um semestre'} accentColor="text-purple-400" onCreateNew={selectedCourse ? handleCreateSemester : undefined} createLabel="Criar novo semestre" createPlaceholder="Nome do semestre..." creatingNew={creatingChild} />
              <CascadeSelect label="3. Secao" icon={<Layers size={15} />} items={sections} selected={selectedSection} onSelect={handleSelectSection} loading={loadingSections} disabled={!selectedSemester} placeholder={!selectedSemester ? 'Selecione o semestre primeiro' : 'Selecione ou crie uma secao'} accentColor="text-blue-500" onCreateNew={selectedSemester ? handleCreateSection : undefined} createLabel="Criar nova secao" createPlaceholder="Nome da secao..." creatingNew={creatingChild} />
              <CascadeSelect label="4. Topico" icon={<FileText size={15} />} items={topics} selected={selectedTopic} onSelect={handleSelectTopic} loading={loadingTopics} disabled={!selectedSection} placeholder={!selectedSection ? 'Selecione a secao primeiro' : 'Selecione ou crie um topico'} accentColor="text-teal-500" onCreateNew={selectedSection ? handleCreateTopic : undefined} createLabel="Criar novo topico" createPlaceholder="Nome do topico..." creatingNew={creatingChild} />
              {topicSelected && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-3 pt-1">
                  <div className="h-px bg-gray-100" />
                  {loadingSummaries && <div className="flex items-center justify-center gap-2 py-4"><Loader2 size={16} className="animate-spin text-purple-400" /><span className="text-sm text-gray-500">Carregando resumos...</span></div>}
                  {!loadingSummaries && existingSummaries.length > 0 && (<div><p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Resumos existentes ({existingSummaries.length})</p><div className="space-y-1.5 max-h-40 overflow-y-auto">{existingSummaries.map((sum) => (<SummaryCard key={sum.id} summary={sum} onClick={() => handleOpenSummary(sum)} />))}</div></div>)}
                  {!loadingSummaries && existingSummaries.length === 0 && (<div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-gray-50 border border-gray-200"><FileText size={16} className="text-gray-400 shrink-0" /><p className="text-sm text-gray-500">Nenhum resumo neste topico ainda.</p></div>)}
                  {!loadingSummaries && !showCreateForm && (<button type="button" onClick={() => setShowCreateForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-purple-200 text-purple-600 hover:border-purple-400 hover:bg-purple-50/50 transition-all font-medium text-sm"><Plus size={16} />Criar Novo Resumo neste Topico</button>)}
                  {showCreateForm && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden"><p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Novo resumo</p><input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }} placeholder={`Novo Resumo - ${selectedTopic?.name || ''}`} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all" /><div className="flex items-center gap-2"><button onClick={() => setShowCreateForm(false)} className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button><button onClick={handleCreate} disabled={creating} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all shadow-md shadow-purple-200 disabled:opacity-60">{creating ? (<><Loader2 size={14} className="animate-spin" />Criando...</>) : (<><Plus size={14} />Criar e Abrir Editor</>)}</button></div></motion.div>)}
                </motion.div>
              )}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0"><button onClick={onClose} className="w-full px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">Fechar</button></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
