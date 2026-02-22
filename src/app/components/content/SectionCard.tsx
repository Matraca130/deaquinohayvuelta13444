// ============================================================
// Axon — SectionCard (Study Hub)
//
// Displays a curriculum section as a card with two modes:
//   - Collapsed: cover image + title + topic count
//   - Expanded:  full topic list with image thumbnails
//
// Used by StudyHubView to render the grid of sections.
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight, Folder, PlayCircle, BookOpen,
  Clock, CheckCircle2, Layers,
} from 'lucide-react';
import clsx from 'clsx';
import type { Topic, Section } from '@/app/data/courses';
import { getLessonsForTopic } from '@/app/data/lessonData';
import { headingStyle } from '@/app/design-system';
import { iconBadgeClasses } from '@/app/design-system';

// ── Fallback images ───────────────────────────────────────
// Generic medical/science images for sections without a cover

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1602404454048-b0243398564e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80';

// ── Types ─────────────────────────────────────────────────

export interface SectionCardProps {
  section: Section;
  courseColor: string;
  currentTopicId: string | null;
  onTopicSelect: (topic: Topic) => void;
  isExpanded: boolean;
  isHidden: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

// ── Component ─────────────────────────────────────────────

export function SectionCard({
  section, courseColor, currentTopicId,
  onTopicSelect, isExpanded, isHidden, onExpand, onCollapse,
}: SectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const coverImage = section.imageUrl || FALLBACK_COVER;

  return (
    <motion.div
      layout
      className={clsx(
        'bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 group relative',
        isExpanded ? 'col-span-full ring-2 ring-teal-100' : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer h-80',
        isHidden && 'hidden',
      )}
      onClick={() => !isExpanded && onExpand()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <CollapsedView
            key="cover"
            title={section.title}
            topicCount={section.topics.length}
            coverImage={coverImage}
            isHovered={isHovered}
          />
        ) : (
          <ExpandedView
            key="list"
            section={section}
            courseColor={courseColor}
            currentTopicId={currentTopicId}
            coverImage={coverImage}
            onTopicSelect={onTopicSelect}
            onCollapse={onCollapse}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Collapsed sub-component ───────────────────────────────

function CollapsedView({
  title, topicCount, coverImage, isHovered,
}: {
  title: string;
  topicCount: number;
  coverImage: string;
  isHovered: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <div className="p-6 pb-4 bg-white z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={iconBadgeClasses()}>
            <Folder className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
            {topicCount} Aulas
          </span>
        </div>
        <h3
          className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-teal-600 transition-colors"
          style={headingStyle}
        >
          {title}
        </h3>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] opacity-0 transition-all duration-300 z-20',
            isHovered && 'opacity-100',
          )}
        >
          <div className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <BookOpen size={16} className="text-teal-600" />
            Ver Conteúdos
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Expanded sub-component ────────────────────────────────

function ExpandedView({
  section, courseColor, currentTopicId, coverImage,
  onTopicSelect, onCollapse,
}: {
  section: Section;
  courseColor: string;
  currentTopicId: string | null;
  coverImage: string;
  onTopicSelect: (topic: Topic) => void;
  onCollapse: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-6 bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onCollapse(); }}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
            <p className="text-xs text-gray-500 font-medium">Lista de aulas disponíveis</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onCollapse(); }}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-full transition-colors"
        >
          Fechar
        </button>
      </div>

      {/* Topic grid */}
      <div className="grid grid-cols-2 gap-5">
        {section.topics.map((topic, index) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            index={index}
            courseColor={courseColor}
            isActive={currentTopicId === topic.id}
            coverImage={coverImage}
            onSelect={() => onTopicSelect(topic)}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Single topic card ─────────────────────────────────────

function TopicCard({
  topic, index, courseColor, isActive, coverImage, onSelect,
}: {
  topic: Topic;
  index: number;
  courseColor: string;
  isActive: boolean;
  coverImage: string;
  onSelect: () => void;
}) {
  const lessons = getLessonsForTopic(topic.id);
  const completedCount = lessons.filter(l => l.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={clsx(
        'flex rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group/card h-[200px]',
        isActive
          ? 'border-teal-300 ring-2 ring-teal-100 shadow-md'
          : 'border-gray-200 hover:border-gray-300',
      )}
    >
      {/* Left: Image */}
      <div className="w-1/2 relative overflow-hidden bg-gray-100">
        <img
          src={coverImage}
          alt={topic.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
        {isActive && (
          <div className="absolute top-3 left-3 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <PlayCircle size={10} fill="currentColor" />
            Atual
          </div>
        )}
      </div>

      {/* Right: Info */}
      <div className="w-1/2 p-5 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={clsx(
              'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
              isActive ? clsx(courseColor, 'text-white') : 'bg-gray-100 text-gray-500',
            )}>
              {topic.title.charAt(0).toUpperCase()}
            </div>
            {lessons.length > 0 ? (
              <span className="text-[10px] font-semibold text-teal-500 uppercase tracking-wider flex items-center gap-1">
                <Layers size={9} />
                {lessons.length} Aulas
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Resumo
              </span>
            )}
          </div>
          <h4 className="font-bold text-gray-900 mb-2">{topic.title}</h4>
          {topic.summary && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{topic.summary}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {lessons.length > 0 ? `${lessons.length} aulas` : '15 min'}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={11} />
              {completedCount > 0 ? `${completedCount}/${lessons.length}` : 'Não iniciado'}
            </span>
          </div>
          <div className="opacity-0 group-hover/card:opacity-100 transition-opacity">
            <PlayCircle size={16} className="text-teal-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
