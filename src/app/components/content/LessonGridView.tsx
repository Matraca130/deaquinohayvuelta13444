import React, { useState } from 'react';
import { Topic } from '@/app/data/courses';
import { Lesson } from '@/app/data/courses';
import { getLessonsForTopic } from '@/app/data/lessonData';
import { Play, FileText, ChevronDown, ChevronUp, Circle, CheckCircle2, MonitorPlay, BookOpen, Zap } from 'lucide-react';
import clsx from 'clsx';
import { AxonPageHeader } from '@/app/components/shared/AxonPageHeader';
import { headingStyle } from '@/app/design-system';

interface LessonGridViewProps {
  topic: Topic;
  courseColor: string;
  accentColor: string;
  onSelectLesson: (lesson: Lesson, mode: 'video' | 'summary') => void;
  onBack?: () => void;
}

export function LessonGridView({ topic, courseColor, accentColor, onSelectLesson, onBack }: LessonGridViewProps) {
  const lessons = getLessonsForTopic(topic.id);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    lessons.forEach(l => { map[l.id] = l.completed; });
    return map;
  });
  const [expandedAlso, setExpandedAlso] = useState<string | null>(null);

  const totalLessons = lessons.length;
  const completedCount = Object.values(completedMap).filter(Boolean).length;

  const toggleComplete = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedMap(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  if (lessons.length === 0) {
    return null; // fallback to default view
  }

  return (
    <div className="flex-1 w-full overflow-y-auto z-10 bg-surface-dashboard">
      {/* ── AXON Page Header ── */}
      <AxonPageHeader
        title={topic.title}
        subtitle="Aulas Disponíveis"
        statsLeft={
          <p className="text-sm text-gray-500">
            {completedCount} de {totalLessons} completos &middot; {Math.round((completedCount / totalLessons) * 100)}%
          </p>
        }
        actionButton={
          <button
            onClick={() => onSelectLesson(lessons[0], 'video')}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-medium text-sm transition-colors shrink-0"
          >
            <Zap size={15} /> Assistir Todas
          </button>
        }
        onBack={onBack}
      />

      {/* ── Content ── */}
      <div className="px-6 py-6 bg-surface-dashboard">
        <div className="max-w-5xl mx-auto">
          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-500">Progresso do Módulo</span>
              <span className="text-sm font-semibold text-gray-900">{completedCount}/{totalLessons} aulas</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-teal-500 transition-all duration-500"
                style={{ width: `${(completedCount / totalLessons) * 100}%` }}
              />
            </div>
          </div>

          {/* Lesson Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={!!completedMap[lesson.id]}
                onToggleComplete={(e) => toggleComplete(lesson.id, e)}
                onSelectVideo={() => onSelectLesson(lesson, 'video')}
                onSelectSummary={() => onSelectLesson(lesson, 'summary')}
                courseColor={courseColor}
                accentColor={accentColor}
                isAlsoExpanded={expandedAlso === lesson.id}
                onToggleAlso={() => setExpandedAlso(expandedAlso === lesson.id ? null : lesson.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  onToggleComplete: (e: React.MouseEvent) => void;
  onSelectVideo: () => void;
  onSelectSummary: () => void;
  courseColor: string;
  accentColor: string;
  isAlsoExpanded: boolean;
  onToggleAlso: () => void;
}

function LessonCard({ lesson, isCompleted, onToggleComplete, onSelectVideo, onSelectSummary, courseColor, accentColor, isAlsoExpanded, onToggleAlso }: LessonCardProps) {
  return (
    <div className={clsx(
      "flex h-[100px] rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-md group/card bg-white",
      isCompleted ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:border-gray-300"
    )}>
      {/* Thumbnail */}
      <div 
        className="w-[160px] h-full relative overflow-hidden bg-gray-900 cursor-pointer shrink-0"
        onClick={onSelectVideo}
      >
        <img 
          src={lesson.thumbnailUrl}
          alt={lesson.title}
          className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded">
          {lesson.duration}
        </div>

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/20 mx-[12px] my-[0px]">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play size={16} className="text-gray-900 ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-2 px-3 flex flex-col justify-center gap-1 min-w-0">
        {/* Top: Completion toggle + Title */}
        <div>
          <button 
            onClick={onToggleComplete}
            className="flex items-center gap-1 mb-0.5 group/check"
          >
            {isCompleted ? (
              <CheckCircle2 size={12} className="text-green-500 shrink-0" />
            ) : (
              <Circle size={12} className="text-gray-300 group-hover/check:text-gray-400 shrink-0" />
            )}
            <span className={clsx(
              "text-[11px] transition-colors",
              isCompleted ? "text-green-600" : "text-gray-400 group-hover/check:text-gray-500"
            )}>
              {isCompleted ? 'Completo' : 'Marcar como completado'}
            </span>
          </button>

          <h3 className={clsx(
            "font-semibold text-[13px] text-gray-900 leading-tight mb-0.5",
            isCompleted && "text-gray-500"
          )} style={headingStyle}>
            {lesson.title}
          </h3>
        </div>

        {/* Bottom: Action icons + Also appears in */}
        <div className="space-y-0.5">
          {/* Action icons */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={onSelectSummary}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-md transition-all duration-200",
                "bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700",
                "border border-teal-200 hover:border-teal-300 hover:shadow-sm"
              )}
              title="Ler resumo"
            >
              <BookOpen size={13} />
              <span className="text-xs font-medium">Ler Resumo</span>
            </button>
            <button 
              onClick={onSelectVideo}
              className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-teal-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <MonitorPlay size={13} />
            </button>
          </div>

          {/* Also appears in */}
          {lesson.alsoAppearsIn && lesson.alsoAppearsIn.length > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleAlso(); }}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MonitorPlay size={10} />
              <span>Também aparece em</span>
              {isAlsoExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
          {isAlsoExpanded && lesson.alsoAppearsIn && (
            <div className="pl-3 text-[10px] text-gray-400 space-y-0">
              {lesson.alsoAppearsIn.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}