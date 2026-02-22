import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/context/AppContext';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { Topic } from '@/app/data/courses';
import { headingStyle, components } from '@/app/design-system';

export function TopicSidebar() {
  const { currentCourse, currentTopic, setCurrentTopic, setActiveView, setSidebarOpen } = useApp();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Start with all sections expanded so the tree is always visible
    const allIds = new Set<string>();
    for (const semester of currentCourse.semesters) {
      for (const section of semester.sections) {
        allIds.add(section.id);
      }
    }
    return allIds;
  });

  // Re-expand all sections when course changes
  useEffect(() => {
    const allIds = new Set<string>();
    for (const semester of currentCourse.semesters) {
      for (const section of semester.sections) {
        allIds.add(section.id);
      }
    }
    setExpandedSections(allIds);
  }, [currentCourse]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleTopicClick = (topic: Topic) => {
    setCurrentTopic(topic);
    setActiveView('study');
  };

  return (
    <div className="w-[240px] shrink-0 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">

      {/* Back button */}
      <div className="px-3 pt-3 pb-1 border-b border-gray-100">
        <button
          onClick={() => {
            setSidebarOpen(false);
            setActiveView('study-hub');
          }}
          className="flex items-center gap-2 px-2 py-2 w-full rounded-lg text-teal-700 hover:text-teal-800 hover:bg-teal-50 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-teal-500 group-hover:text-teal-700 transition-colors" />
          <span className="text-sm font-medium" style={headingStyle}>Voltar aos temas</span>
        </button>
      </div>

      {/* Scrollable tree */}
      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        {currentCourse.semesters.map((semester) => (
          <div key={semester.id}>
            {/* Sections */}
            {semester.sections.map((section) => {
              const isExpanded = expandedSections.has(section.id);
              const hasActiveTopic = section.topics.some(t => t.id === currentTopic?.id);

              return (
                <div key={section.id}>
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={clsx(
                      "w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors group"
                    )}
                  >
                    <span
                      className={clsx(
                        "text-sm font-semibold truncate pr-2",
                        hasActiveTopic ? "text-gray-900" : "text-gray-700"
                      )}
                    >
                      {section.title}
                    </span>
                    <span className="text-gray-400 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {/* Sub-topics */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="relative ml-4 border-l-2 border-blue-500">
                          {section.topics.map((topic) => {
                            const isActive = currentTopic?.id === topic.id;
                            return (
                              <button
                                key={topic.id}
                                onClick={() => handleTopicClick(topic)}
                                className={clsx(
                                  "w-full text-left pl-4 pr-3 py-2 text-sm transition-colors",
                                  isActive
                                    ? "text-blue-600 bg-blue-50/60"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                              >
                                <span className="line-clamp-2">{topic.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}