import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useApp } from '@/app/context/AppContext';
import { SummarySession as SummarySessionWithAnnotations } from '@/app/components/content/SummarySessionNew';
import { getLessonsForTopic } from '@/app/data/lessonData';
import { LessonGridView } from '@/app/components/content/LessonGridView';
import { Lesson } from '@/app/data/courses';

// ── Extracted sub-components ──
import { SelectionScreen } from './study/SelectionScreen';
import { VideoSession } from './study/VideoSession';
import { FlashcardsSession } from './study/FlashcardsSession';

export function StudyView() {
  const { currentTopic, currentCourse, setStudySessionActive, setActiveView, setSidebarOpen } = useApp();
  const [session, setSession] = useState<'selection' | 'video' | 'summary' | 'flashcards'>('selection');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const lessons = currentTopic ? getLessonsForTopic(currentTopic.id) : [];
  const hasLessons = lessons.length > 0;

  useEffect(() => {
    setSession('selection');
    setActiveLesson(null);
  }, [currentTopic]);

  useEffect(() => {
    setStudySessionActive(session !== 'selection');
    return () => setStudySessionActive(false);
  }, [session, setStudySessionActive]);

  if (!currentTopic) return null;

  const handleBack = () => { setSession('selection'); setActiveLesson(null); };
  const handleBackToTopics = () => { setSidebarOpen(true); setActiveView('study-hub'); };
  const handleStartFlashcards = () => setSession('flashcards');

  const handleSelectLesson = (lesson: Lesson, mode: 'video' | 'summary') => {
    setActiveLesson(lesson);
    setSession(mode);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-teal-400" />

      <AnimatePresence mode="wait">
        {session === 'selection' && hasLessons && (
          <LessonGridView
            key="lesson-grid"
            topic={currentTopic}
            courseColor={currentCourse.color}
            accentColor={currentCourse.accentColor}
            onSelectLesson={handleSelectLesson}
            onBack={handleBackToTopics}
          />
        )}

        {session === 'selection' && !hasLessons && (
          <SelectionScreen 
            key="selection" 
            onSelect={setSession} 
            topic={currentTopic} 
            courseColor={currentCourse.color}
            accentColor={currentCourse.accentColor}
          />
        )}
        
        {session === 'video' && (
          <VideoSession 
            key="video" 
            onBack={handleBack} 
            topic={currentTopic}
            courseColor={currentCourse.color}
            accentColor={currentCourse.accentColor}
            activeLesson={activeLesson}
          />
        )}
        
        {session === 'summary' && (
          <SummarySessionWithAnnotations 
            key="summary" 
            onBack={handleBack}
            onStartFlashcards={handleStartFlashcards}
            topic={currentTopic}
            courseColor={currentCourse.color}
            accentColor={currentCourse.accentColor}
          />
        )}

        {session === 'flashcards' && (
          <FlashcardsSession
            key="flashcards"
            onBack={() => setSession('summary')}
            topic={currentTopic}
            courseColor={currentCourse.color}
            accentColor={currentCourse.accentColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
