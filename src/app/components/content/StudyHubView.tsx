// ============================================================
// Axon — Study Hub View
//
// Main study dashboard showing the curriculum tree:
//   semester → sections (as cards) → topics
//
// States: loading → error → empty → content
// ============================================================

import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { useStudentCurriculum } from '@/app/context/StudentCurriculumContext';
import { motion } from 'motion/react';
import { PlayCircle, BookOpen, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { Topic, Section, Semester } from '@/app/data/courses';
import { AxonPageHeader } from '@/app/components/shared/AxonPageHeader';
import { SectionCard } from '@/app/components/content/SectionCard';

// ── Shared empty-state shell ──────────────────────────────

function CurriculumStatusPage({
  courseName,
  statsLeft,
  icon: Icon,
  iconClass,
  title,
  description,
  actionLabel,
  onAction,
}: {
  courseName: string;
  statsLeft: React.ReactNode;
  icon: React.ElementType;
  iconClass: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto bg-surface-dashboard">
      <AxonPageHeader title="Plano de Estudos" subtitle={courseName} statsLeft={statsLeft} />
      <div className="px-6 py-20 flex flex-col items-center justify-center">
        <Icon size={40} className={clsx(iconClass, 'mb-4')} />
        <p className="text-gray-700 font-medium mb-2">{title}</p>
        {description && (
          <p className="text-gray-500 text-sm mb-4 max-w-md text-center">{description}</p>
        )}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-sm shadow-sm transition-all active:scale-95"
          >
            <RefreshCw size={14} /> {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────

export function StudyHubView() {
  const { currentCourse, currentTopic, setCurrentTopic, setActiveView, curriculumLoading } = useApp();
  const { error: curriculumError, refresh: refreshCurriculum } = useStudentCurriculum();
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const handleTopicSelect = (topic: Topic) => {
    setCurrentTopic(topic);
    setActiveView('study');
  };

  const hasSemesters = currentCourse.semesters?.length > 0;
  const totalSections = hasSemesters
    ? currentCourse.semesters.reduce((acc, s: Semester) => acc + s.sections.length, 0)
    : 0;
  const totalTopics = hasSemesters
    ? currentCourse.semesters.reduce(
        (acc, s: Semester) => acc + s.sections.reduce((a, sec: Section) => a + sec.topics.length, 0), 0,
      )
    : 0;

  // ── Loading ──
  if (curriculumLoading) {
    return (
      <CurriculumStatusPage
        courseName={currentCourse.name}
        statsLeft={
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Carregando curriculum...
          </p>
        }
        icon={Loader2}
        iconClass="animate-spin text-teal-500"
        title="Buscando dados do curriculum..."
      />
    );
  }

  // ── Error ──
  if (curriculumError) {
    return (
      <CurriculumStatusPage
        courseName={currentCourse.name}
        statsLeft={
          <p className="text-red-500 text-sm flex items-center gap-2">
            <AlertCircle size={14} /> Erro ao carregar
          </p>
        }
        icon={AlertCircle}
        iconClass="text-red-400"
        title="Falha ao carregar curriculum"
        description={curriculumError}
        actionLabel="Tentar novamente"
        onAction={refreshCurriculum}
      />
    );
  }

  // ── Empty ──
  if (!hasSemesters) {
    return (
      <CurriculumStatusPage
        courseName={currentCourse.name}
        statsLeft={<p className="text-gray-500 text-sm">Nenhum conteúdo publicado ainda</p>}
        icon={BookOpen}
        iconClass="text-gray-300"
        title="Sem conteúdo disponível"
        description="O professor ainda não publicou conteúdo neste curso. Quando conteúdos forem criados, eles aparecerão aqui automaticamente."
        actionLabel="Atualizar"
        onAction={refreshCurriculum}
      />
    );
  }

  // ── Content ──
  return (
    <div className="h-full overflow-y-auto bg-surface-dashboard">
      <AxonPageHeader
        title="Plano de Estudos"
        subtitle={currentCourse.name}
        statsLeft={
          <p className="text-gray-500 text-sm">
            {totalSections} seções &middot; {totalTopics} tópicos disponíveis
          </p>
        }
        actionButton={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshCurriculum()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm transition-all active:scale-95 shrink-0"
              title="Atualizar conteúdo"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setActiveView('study')}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <PlayCircle size={15} /> Continuar Estudando
            </button>
          </div>
        }
      />

      <div className="px-6 py-6 bg-surface-dashboard">
        <div className="max-w-7xl mx-auto space-y-12">
          {currentCourse.semesters.map((semester: Semester, semesterIndex: number) => {
            const semesterHasExpanded =
              expandedSectionId !== null && semester.sections.some(s => s.id === expandedSectionId);
            const semesterIsHidden = expandedSectionId !== null && !semesterHasExpanded;

            return (
              <motion.div
                key={semester.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + semesterIndex * 0.08 }}
                className={clsx(semesterIsHidden && 'hidden')}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  {semester.title}
                  <div className="h-px flex-1 bg-gray-200" />
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {semester.sections.map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      courseColor={currentCourse.color}
                      currentTopicId={currentTopic?.id ?? null}
                      onTopicSelect={handleTopicSelect}
                      isExpanded={expandedSectionId === section.id}
                      isHidden={expandedSectionId !== null && expandedSectionId !== section.id}
                      onExpand={() => setExpandedSectionId(section.id)}
                      onCollapse={() => setExpandedSectionId(null)}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
