// ============================================================
// useFlashcardNavigation — View state machine + navigation
// Manages: hub/section/deck transitions, course-change reset
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/app/context/AppContext';
import type { Section, Topic } from '@/app/data/courses';
import type { FlashcardViewState } from './flashcard-types';

export function useFlashcardNavigation() {
  const { currentCourse, setActiveView, setCurrentTopic } = useApp();

  // View state machine
  const [viewState, setViewState] = useState<FlashcardViewState>('hub');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);

  // Derived data
  const allSections = useMemo(
    () => currentCourse.semesters.flatMap(sem => sem.sections),
    [currentCourse],
  );

  const allFlashcards = useMemo(
    () => allSections.flatMap(sec => sec.topics.flatMap(t => t.flashcards || [])),
    [allSections],
  );

  // Reset on course change
  useEffect(() => {
    setViewState('hub');
    setSelectedSection(null);
    setSelectedTopic(null);
  }, [currentCourse]);

  // ── Actions ──

  const openSection = useCallback((section: Section, idx: number) => {
    setSelectedSection(section);
    setSelectedSectionIdx(idx);
    setViewState('section');
  }, []);

  const openDeck = useCallback((topic: Topic) => {
    setSelectedTopic(topic);
    setViewState('deck');
  }, []);

  const goBack = useCallback(() => {
    if (viewState === 'summary' || viewState === 'session') {
      setViewState(selectedTopic ? 'deck' : selectedSection ? 'section' : 'hub');
    } else if (viewState === 'deck') {
      setViewState('section');
      setSelectedTopic(null);
    } else if (viewState === 'section') {
      setViewState('hub');
      setSelectedSection(null);
    } else {
      setActiveView('study');
    }
  }, [viewState, selectedTopic, selectedSection, setActiveView]);

  const studySelectedTopic = useCallback(() => {
    if (selectedTopic) {
      setCurrentTopic(selectedTopic);
      setActiveView('study');
    }
  }, [selectedTopic, setCurrentTopic, setActiveView]);

  return {
    viewState,
    setViewState,
    selectedSection,
    selectedTopic,
    selectedSectionIdx,
    allSections,
    allFlashcards,
    currentCourse,
    openSection,
    openDeck,
    goBack,
    studySelectedTopic,
    setActiveView,
  };
}
