// ============================================================
// useFlashcardEngine — Session logic + backend persistence
// Manages: card queue, ratings, session lifecycle
// Persists: reviews + session log via studentApi (backend)
// ============================================================

import { useState, useCallback, useRef } from 'react';
import type { Flashcard } from '@/app/data/courses';
import type { FlashcardReview, StudySession } from '@/app/types/student';

// Backend persistence helpers (fire-and-forget)
import * as studentApi from '@/app/services/studentApi';

interface UseFlashcardEngineOpts {
  studentId: string | null;
  courseId: string;
  topicId?: string | null;
  onFinish: () => void;
}

export function useFlashcardEngine({ studentId, courseId, topicId, onFinish }: UseFlashcardEngineOpts) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState<number[]>([]);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);

  // Track timing per card
  const cardStartTime = useRef<number>(Date.now());
  // Accumulate reviews for batch save
  const pendingReviews = useRef<FlashcardReview[]>([]);
  const sessionStartTime = useRef<string>(new Date().toISOString());

  // ── Start Session ──

  const startSession = useCallback((cards: Flashcard[]) => {
    if (cards.length === 0) return;
    setSessionCards(cards);
    setCurrentIndex(0);
    setSessionStats([]);
    setIsRevealed(false);
    cardStartTime.current = Date.now();
    pendingReviews.current = [];
    sessionStartTime.current = new Date().toISOString();
  }, []);

  // ── Persist reviews to backend (fire-and-forget) ──

  const persistReviews = useCallback(async (reviews: FlashcardReview[]) => {
    if (reviews.length === 0 || !studentId) return;
    try {
      await studentApi.saveReviews(reviews, studentId);
    } catch (err) {
      console.warn('[useFlashcardEngine] Failed to persist reviews (will retry on next session):', err);
    }
  }, [studentId]);

  const persistSessionLog = useCallback(async (stats: number[]) => {
    if (!studentId) return;
    const now = new Date();
    const started = new Date(sessionStartTime.current);
    const durationMinutes = Math.max(1, Math.round((now.getTime() - started.getTime()) / 60000));

    const session: Omit<StudySession, 'studentId'> = {
      id: `session-${Date.now()}`,
      courseId,
      topicId: topicId || undefined,
      type: 'flashcards',
      startedAt: sessionStartTime.current,
      endedAt: now.toISOString(),
      durationMinutes,
      cardsReviewed: stats.length,
    };

    try {
      await studentApi.logSession(session, studentId);
    } catch (err) {
      console.warn('[useFlashcardEngine] Failed to log session:', err);
    }
  }, [studentId, courseId, topicId]);

  // ── Handle Rating ──

  const handleRate = useCallback((rating: number) => {
    const responseTimeMs = Date.now() - cardStartTime.current;
    const card = sessionCards[currentIndex];

    // Build review record for backend
    if (card) {
      pendingReviews.current.push({
        cardId: card.id,
        topicId: topicId || '',
        courseId,
        reviewedAt: new Date().toISOString(),
        rating: rating as 1 | 2 | 3 | 4 | 5,
        responseTimeMs,
        ease: 2.5, // defaults — real SM-2 runs on backend
        interval: 0,
        repetitions: 0,
      });
    }

    setSessionStats(prev => [...prev, rating]);
    setIsRevealed(false);

    const isLast = currentIndex >= sessionCards.length - 1;

    if (isLast) {
      // Session complete: persist everything, then transition
      const allReviews = [...pendingReviews.current];
      const allStats = [...sessionStats, rating];
      persistReviews(allReviews);
      persistSessionLog(allStats);
      setTimeout(() => onFinish(), 200);
    } else {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        cardStartTime.current = Date.now();
      }, 200);
    }
  }, [sessionCards, currentIndex, courseId, topicId, sessionStats, persistReviews, persistSessionLog, onFinish]);

  // ── Restart / Exit ──

  const restartSession = useCallback(() => {
    setCurrentIndex(0);
    setSessionStats([]);
    setIsRevealed(false);
    cardStartTime.current = Date.now();
    pendingReviews.current = [];
    sessionStartTime.current = new Date().toISOString();
  }, []);

  return {
    isRevealed,
    setIsRevealed,
    currentIndex,
    sessionStats,
    sessionCards,
    startSession,
    handleRate,
    restartSession,
  };
}
