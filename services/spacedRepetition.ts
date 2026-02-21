// ============================================================
// Axon — SM-2 Spaced Repetition Algorithm
// Based on SuperMemo SM-2 by Piotr Wozniak
// Enhanced with keyword-level tracking and need-based weighting
// ============================================================
//
// Quality ratings:
//   5 — perfect response, no hesitation
//   4 — correct after brief hesitation
//   3 — correct with serious difficulty
//   2 — incorrect, but upon seeing the answer, felt familiar
//   1 — incorrect, wrong answer remembered
//   0 — complete blackout (not used in our 1-5 scale)
//
// The algorithm calculates:
//   - ease factor (EF): how "easy" the card is (min 1.3)
//   - interval: days until next review
//   - repetitions: successful review streak
// ============================================================

// ============================================================
// KEYWORD-LEVEL STATE
// ============================================================

// KeywordState is now defined in types/student.ts (canonical location).
// Re-exported here for backward compatibility.
import type { KeywordState as _KeywordState } from '@/app/types/student';
export type KeywordState = _KeywordState;

/**
 * Create a new keyword state with safe defaults
 */
export function createKeywordState(keyword: string): KeywordState {
  return {
    keyword,
    mastery: 0.0,
    stability_days: 0.5, // Start very low
    due_at: new Date().toISOString(), // Due immediately
    lapses: 0,
    exposures: 0,
    card_coverage: 0,
    last_review_at: null,
    color: 'red',
    color_stability_counter: 0,
  };
}

/**
 * Calculate NEED SCORE (weight) for a keyword.
 * Higher score = more urgent to practice.
 * 
 * Combines 4 factors:
 * - overdue: Is it past due date?
 * - need_mastery: Low mastery = needs work
 * - need_fragility: Many lapses or low stability
 * - need_coverage: Few flashcards available
 */
export function calculateNeedScore(
  state: KeywordState,
  currentDate: Date = new Date(),
  config = {
    graceDays: 1,
    targetCards: 5,
    overdueWeight: 0.45,
    masteryWeight: 0.30,
    fragilityWeight: 0.15,
    coverageWeight: 0.10,
  }
): number {
  // Factor 1: Overdue
  let overdue = 0;
  if (state.due_at) {
    const dueDate = new Date(state.due_at);
    const daysOverdue = (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
    overdue = Math.max(0, Math.min(1, daysOverdue / config.graceDays));
  } else {
    overdue = 1; // Never reviewed = immediately due
  }

  // Factor 2: Low mastery
  const need_mastery = 1 - state.mastery;

  // Factor 3: Fragility (lapses relative to exposure)
  const need_fragility = Math.min(1, state.lapses / Math.max(1, state.exposures + 1));

  // Factor 4: Coverage gap
  const need_coverage = Math.max(0, Math.min(1, 
    (config.targetCards - state.card_coverage) / config.targetCards
  ));

  const weight =
    config.overdueWeight * overdue +
    config.masteryWeight * need_mastery +
    config.fragilityWeight * need_fragility +
    config.coverageWeight * need_coverage;

  return Math.max(0, Math.min(1, weight));
}

/**
 * Convert performance metrics to a grade (0 to 1).
 * 
 * @param correct - Was the answer correct?
 * @param responseTimeMs - How long did it take?
 * @param expectedTimeMs - Reasonable time for this type of question
 * @param usedHint - Did the user need a hint?
 * @param confidence - Optional self-reported confidence (0-1)
 */
export function gradeFromPerformance(
  correct: boolean,
  responseTimeMs: number,
  expectedTimeMs: number = 10000,
  usedHint: boolean = false,
  confidence?: number
): number {
  if (!correct) {
    // Incorrect
    if (confidence !== undefined && confidence > 0.7) {
      // Close attempt (high confidence but wrong)
      return 0.3;
    }
    return 0.0; // Complete failure
  }

  // Correct
  let grade = 1.0;

  // Penalize slow response
  const timeRatio = responseTimeMs / expectedTimeMs;
  if (timeRatio > 2.0) {
    grade -= 0.2; // Very slow
  } else if (timeRatio > 1.5) {
    grade -= 0.1; // Somewhat slow
  }

  // Penalize hint usage
  if (usedHint) {
    grade -= 0.2;
  }

  // Factor in confidence if provided
  if (confidence !== undefined) {
    grade = (grade * 0.7) + (confidence * 0.3);
  }

  return Math.max(0.0, Math.min(1.0, grade));
}

/**
 * Update keyword state after a learning event (quiz, flashcard, etc.)
 * 
 * Uses:
 * - EMA (exponential moving average) to smooth mastery changes
 * - Evidence-based learning rate (more events = more confidence)
 * - Stability calculation based on grade
 * 
 * @param state - Current keyword state
 * @param grade - Performance grade 0-1 (from gradeFromPerformance)
 * @param eventType - Type of learning event
 * @param config - Tuning parameters
 */
export function updateKeywordAfterEvent(
  state: KeywordState,
  grade: number,
  eventType: 'quiz' | 'flashcard' | 'reading' = 'flashcard',
  config = {
    baseLearningRate: 0.2,
    minEventsForFullImpact: 3,
    eventWeights: { quiz: 1.0, flashcard: 0.8, reading: 0.3 },
    minStability: 0.5,
    maxStability: 180,
  }
): KeywordState {
  const now = new Date().toISOString();
  const exposures = state.exposures + 1;

  // Event-specific weight
  const eventWeight = config.eventWeights[eventType];

  // Learning rate with evidence scaling
  const evidenceScale = Math.min(1, exposures / config.minEventsForFullImpact);
  const lr = config.baseLearningRate * evidenceScale * eventWeight;

  // Update mastery with EMA
  const newMastery = (1 - lr) * state.mastery + lr * grade;

  // Update stability
  const delta = grade - 0.6; // Neutral point
  let newStability = state.stability_days;
  
  if (grade >= 0.4) {
    // Success: increase stability
    newStability = state.stability_days * (1 + 0.6 * delta);
  } else {
    // Failure: reduce stability significantly
    newStability = Math.max(config.minStability, state.stability_days * 0.7);
  }
  
  newStability = Math.max(config.minStability, Math.min(config.maxStability, newStability));

  // Update lapses
  const newLapses = grade < 0.4 ? state.lapses + 1 : state.lapses;

  // Schedule next review
  const targetRetention = 0.85;
  const intervalDays = -newStability * Math.log(targetRetention);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Math.round(intervalDays));

  return {
    ...state,
    mastery: Math.max(0, Math.min(1, newMastery)),
    stability_days: newStability,
    due_at: dueDate.toISOString(),
    lapses: newLapses,
    exposures,
    last_review_at: now,
  };
}

/**
 * Get keyword color with HYSTERESIS to prevent flickering.
 * 
 * Thresholds for going UP are stricter than going DOWN.
 * A counter tracks consecutive "stable" evaluations.
 */
export function getKeywordColor(
  state: KeywordState,
  config = {
    greenUp: 0.80,
    greenDown: 0.70,
    yellowUp: 0.50,
    yellowDown: 0.40,
    stabilityRequired: 2,
  }
): { color: 'red' | 'yellow' | 'green'; counter: number } {
  const { mastery, color, color_stability_counter } = state;
  let newColor = color;
  let newCounter = color_stability_counter;

  if (color === 'red') {
    // Red → Yellow: requires mastery > yellowUp for N times
    if (mastery >= config.yellowUp) {
      newCounter++;
      if (newCounter >= config.stabilityRequired) {
        newColor = 'yellow';
        newCounter = 0;
      }
    } else {
      newCounter = 0;
    }
  } else if (color === 'yellow') {
    // Yellow → Green: requires mastery > greenUp for N times
    if (mastery >= config.greenUp) {
      newCounter++;
      if (newCounter >= config.stabilityRequired) {
        newColor = 'green';
        newCounter = 0;
      }
    }
    // Yellow → Red: only if mastery < yellowDown
    else if (mastery < config.yellowDown) {
      newCounter++;
      if (newCounter >= config.stabilityRequired) {
        newColor = 'red';
        newCounter = 0;
      }
    } else {
      newCounter = 0;
    }
  } else if (color === 'green') {
    // Green → Yellow: only if mastery < greenDown
    if (mastery < config.greenDown) {
      newCounter++;
      if (newCounter >= config.stabilityRequired) {
        newColor = 'yellow';
        newCounter = 0;
      }
    } else {
      newCounter = 0;
    }
  }

  return { color: newColor, counter: newCounter };
}

/**
 * Apply color with hysteresis to keyword state
 */
export function applyColorHysteresis(state: KeywordState): KeywordState {
  const { color, counter } = getKeywordColor(state);
  return {
    ...state,
    color,
    color_stability_counter: counter,
  };
}

/**
 * Check if a keyword is due for review
 */
export function isKeywordDue(state: KeywordState, currentDate: Date = new Date()): boolean {
  if (!state.due_at) return true;
  return new Date(state.due_at) <= currentDate;
}

/**
 * Calculate retention probability for a keyword using forgetting curve
 * R = exp(-t/S) where t = time since last review, S = stability
 */
export function calculateKeywordRetention(
  state: KeywordState,
  currentDate: Date = new Date()
): number {
  if (!state.last_review_at || state.stability_days <= 0) return 0;
  
  const lastReview = new Date(state.last_review_at);
  const daysSince = (currentDate.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
  
  const retention = Math.exp(-daysSince / state.stability_days);
  return Math.max(0, Math.min(1, retention));
}

// ============================================================
// ORIGINAL SM-2 CARD-BASED SYSTEM (unchanged)
// ============================================================

export interface SM2Card {
  ease: number;       // Ease factor (default 2.5, min 1.3)
  interval: number;   // Days until next review
  repetitions: number; // Number of successful reviews in a row
  lastReview?: string; // ISO date of last review
  nextReview?: string; // ISO date of next review
}

export interface SM2ReviewResult {
  ease: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

/**
 * SM-2 Algorithm
 * @param card - Current card state
 * @param quality - Rating 1-5 (mapped from user input)
 * @returns Updated card state with new interval and next review date
 */
export function sm2Review(
  card: SM2Card,
  quality: 1 | 2 | 3 | 4 | 5
): SM2ReviewResult {
  // Map our 1-5 scale to SM-2's 0-5 scale
  const q = quality - 1; // Now 0-4, we add 1 so effective range is 1-5 for SM-2
  const smQuality = quality; // Direct mapping: 1=again, 2=hard, 3=good, 4=easy, 5=perfect

  let { ease, interval, repetitions } = card;

  // If quality < 3, reset repetitions (failed recall)
  if (smQuality < 3) {
    repetitions = 0;
    interval = 1; // Review again tomorrow
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    repetitions += 1;
  }

  // Update ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  const delta = 0.1 - (5 - smQuality) * (0.08 + (5 - smQuality) * 0.02);
  ease = Math.max(1.3, ease + delta);

  // Calculate next review date
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + interval);

  return {
    ease: Math.round(ease * 100) / 100,
    interval,
    repetitions,
    nextReview: next.toISOString(),
  };
}

/**
 * Create a new SM-2 card with default values
 */
export function createNewCard(): SM2Card {
  return {
    ease: 2.5,
    interval: 0,
    repetitions: 0,
  };
}

/**
 * Calculate retention percentage based on time since last review
 * Uses the Ebbinghaus forgetting curve: R = e^(-t/S)
 * where t = time elapsed, S = stability (derived from ease and interval)
 */
export function calculateRetention(
  lastReviewDate: string,
  interval: number,
  ease: number,
  currentDate?: Date
): number {
  const now = currentDate || new Date();
  const lastReview = new Date(lastReviewDate);
  const daysSinceReview = Math.max(0,
    (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Stability is proportional to interval * ease
  // A card with interval=30 and ease=2.5 should still have ~90% retention at day 30
  const stability = interval * ease * 0.6;

  if (stability <= 0) return 0;

  // Forgetting curve: R = e^(-t/S)
  const retention = Math.exp(-daysSinceReview / stability) * 100;

  return Math.max(0, Math.min(100, Math.round(retention)));
}

/**
 * Check if a card is due for review
 */
export function isCardDue(card: SM2Card, currentDate?: Date): boolean {
  if (!card.nextReview) return true;
  const now = currentDate || new Date();
  return new Date(card.nextReview) <= now;
}

/**
 * Calculate overall mastery percentage for a set of cards
 */
export function calculateMastery(cards: SM2Card[]): number {
  if (cards.length === 0) return 0;

  const totalScore = cards.reduce((sum, card) => {
    // Score based on ease and repetitions
    const easeScore = Math.min(1, (card.ease - 1.3) / (2.5 - 1.3)); // 0-1
    const repScore = Math.min(1, card.repetitions / 5); // 0-1 (5 reps = mastered)
    return sum + (easeScore * 0.4 + repScore * 0.6);
  }, 0);

  return Math.round((totalScore / cards.length) * 100);
}

/**
 * Get cards sorted by urgency (most urgent first)
 * Priority: overdue > due today > low retention > normal
 */
export function sortByUrgency<T extends { card: SM2Card; retention?: number }>(
  items: T[],
  currentDate?: Date
): T[] {
  const now = currentDate || new Date();

  return [...items].sort((a, b) => {
    const aOverdue = a.card.nextReview ? new Date(a.card.nextReview) < now : true;
    const bOverdue = b.card.nextReview ? new Date(b.card.nextReview) < now : true;

    // Overdue cards first
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Then by retention (lower retention = more urgent)
    const aRet = a.retention ?? 100;
    const bRet = b.retention ?? 100;
    if (aRet !== bRet) return aRet - bRet;

    // Then by ease (lower ease = harder card = more urgent)
    return a.card.ease - b.card.ease;
  });
}

/**
 * Calculate forgetting curve data points for visualization
 * Returns array of { day, retention } for charting
 */
export function getForgettingCurvePoints(
  ease: number = 2.5,
  interval: number = 7,
  days: number = 30,
  withReviews: boolean = true
): { day: number; retentionActual: number; retentionDecay: number }[] {
  const stability = interval * ease * 0.6;
  const points: { day: number; retentionActual: number; retentionDecay: number }[] = [];

  for (let d = 0; d <= days; d++) {
    // Pure decay (no reviews)
    const decay = Math.exp(-d / stability) * 100;

    // With reviews: bump retention at scheduled intervals
    let actual = decay;
    if (withReviews) {
      // Simulate reviews boosting retention
      const reviewDays = [0, 1, 3, 7, 14, 28].filter(rd => rd <= d);
      const lastReviewDay = reviewDays[reviewDays.length - 1] || 0;
      const daysSinceLastReview = d - lastReviewDay;
      const boostedStability = stability * 1.5;
      actual = Math.exp(-daysSinceLastReview / boostedStability) * 100;
    }

    points.push({
      day: d,
      retentionActual: Math.round(Math.max(0, Math.min(100, actual))),
      retentionDecay: Math.round(Math.max(0, Math.min(100, decay))),
    });
  }

  return points;
}

/**
 * Get urgency level based on retention
 */
export function getUrgencyLevel(retention: number): 'critical' | 'warning' | 'info' | 'none' {
  if (retention < 40) return 'critical';
  if (retention < 60) return 'warning';
  if (retention < 80) return 'info';
  return 'none';
}

/**
 * Calculate how many cards are due per topic
 */
export function getDueCardCount(
  cards: SM2Card[],
  currentDate?: Date
): { due: number; total: number; urgentCount: number } {
  const now = currentDate || new Date();
  let due = 0;
  let urgentCount = 0;

  for (const card of cards) {
    if (isCardDue(card, now)) {
      due++;
      // Urgent if overdue by more than 1 day
      if (card.nextReview) {
        const overdueDays = (now.getTime() - new Date(card.nextReview).getTime()) / (1000 * 60 * 60 * 24);
        if (overdueDays > 1) urgentCount++;
      }
    }
  }

  return { due, total: cards.length, urgentCount };
}