// ============================================================
// Axon — Keyword Manager
// Manages keyword-level spaced repetition across all learning contexts
// ============================================================

import {
  KeywordState,
  createKeywordState,
  calculateNeedScore,
  updateKeywordAfterEvent,
  applyColorHysteresis,
  gradeFromPerformance,
  isKeywordDue,
  calculateKeywordRetention,
} from './spacedRepetition';

/**
 * Keywords associated with a quiz question or flashcard
 */
export interface QuestionKeywords {
  /** Primary keyword(s): the main concept being tested (receives 80% weight) */
  primary: string[];
  /** Secondary keywords: related concepts (share 20% weight) */
  secondary: string[];
  /** Distractor keywords: common mistakes/misconceptions */
  distractors?: Record<string, string>; // { optionIndex: keyword }
}

/**
 * Result from answering a quiz question or flashcard
 */
export interface LearningEventResult {
  correct: boolean;
  responseTimeMs: number;
  usedHint: boolean;
  confidence?: number;
  selectedDistractor?: string; // if incorrect, which keyword was chosen
}

/**
 * Collection of keyword states for a topic or course
 */
export interface KeywordCollection {
  [keyword: string]: KeywordState;
}

/**
 * Get or create a keyword state
 */
export function getOrCreateKeyword(
  collection: KeywordCollection,
  keyword: string
): KeywordState {
  const normalized = keyword.toLowerCase().trim();
  if (!collection[normalized]) {
    collection[normalized] = createKeywordState(normalized);
  }
  return collection[normalized];
}

/**
 * Update multiple keywords after a learning event.
 * Distributes the impact according to primary/secondary weights.
 * 
 * @param collection - The keyword collection to update
 * @param keywords - Primary and secondary keywords
 * @param result - Performance on this question/card
 * @param eventType - Type of learning event
 * @returns Updated collection
 */
export function updateKeywordsAfterEvent(
  collection: KeywordCollection,
  keywords: QuestionKeywords,
  result: LearningEventResult,
  eventType: 'quiz' | 'flashcard' | 'reading' = 'flashcard'
): KeywordCollection {
  const updated = { ...collection };
  
  // Calculate base grade
  const baseGrade = gradeFromPerformance(
    result.correct,
    result.responseTimeMs,
    10000,
    result.usedHint,
    result.confidence
  );

  // Update primary keywords (80% weight)
  for (const kw of keywords.primary) {
    const state = getOrCreateKeyword(updated, kw);
    const grade = baseGrade * 1.0; // Full grade for primary
    let newState = updateKeywordAfterEvent(state, grade, eventType);
    newState = applyColorHysteresis(newState);
    updated[kw.toLowerCase().trim()] = newState;
  }

  // Update secondary keywords (shared 20% weight)
  if (keywords.secondary.length > 0) {
    const secondaryGrade = baseGrade * 0.6; // Reduced impact
    for (const kw of keywords.secondary) {
      const state = getOrCreateKeyword(updated, kw);
      let newState = updateKeywordAfterEvent(state, secondaryGrade, eventType);
      newState = applyColorHysteresis(newState);
      updated[kw.toLowerCase().trim()] = newState;
    }
  }

  // If incorrect and distractor selected, update that keyword with stronger negative signal
  if (!result.correct && result.selectedDistractor && keywords.distractors) {
    const distractorKw = keywords.distractors[result.selectedDistractor];
    if (distractorKw) {
      const state = getOrCreateKeyword(updated, distractorKw);
      // Strong negative signal: the user confused this concept
      let newState = updateKeywordAfterEvent(state, 0.2, eventType);
      newState = applyColorHysteresis(newState);
      updated[distractorKw.toLowerCase().trim()] = newState;
    }
  }

  return updated;
}

/**
 * Select keywords for a study session based on need scores.
 * Returns keywords sorted by urgency (highest need first).
 * 
 * @param collection - Available keywords
 * @param maxKeywords - Maximum number to select
 * @param minNeedScore - Minimum need score to consider (0-1)
 * @returns Sorted array of [keyword, needScore, state]
 */
export function selectKeywordsForStudy(
  collection: KeywordCollection,
  maxKeywords: number = 10,
  minNeedScore: number = 0.3
): Array<{ keyword: string; needScore: number; state: KeywordState }> {
  const now = new Date();
  const candidates: Array<{ keyword: string; needScore: number; state: KeywordState }> = [];

  for (const [keyword, state] of Object.entries(collection)) {
    const needScore = calculateNeedScore(state, now);
    if (needScore >= minNeedScore) {
      candidates.push({ keyword, needScore, state });
    }
  }

  // Sort by need score descending
  candidates.sort((a, b) => b.needScore - a.needScore);

  return candidates.slice(0, maxKeywords);
}

/**
 * Get keywords that need more flashcard coverage.
 * These should be prioritized for AI generation.
 * 
 * @param collection - Available keywords
 * @param targetCoverage - Minimum desired card coverage
 * @param maxKeywords - Maximum to return
 */
export function getKeywordsNeedingCards(
  collection: KeywordCollection,
  targetCoverage: number = 3,
  maxKeywords: number = 5
): Array<{ keyword: string; coverage: number; needScore: number }> {
  const candidates: Array<{ keyword: string; coverage: number; needScore: number }> = [];

  for (const [keyword, state] of Object.entries(collection)) {
    if (state.card_coverage < targetCoverage) {
      const needScore = calculateNeedScore(state);
      candidates.push({
        keyword,
        coverage: state.card_coverage,
        needScore,
      });
    }
  }

  // Sort by need score, then by coverage gap
  candidates.sort((a, b) => {
    const scoreDiff = b.needScore - a.needScore;
    if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
    return a.coverage - b.coverage;
  });

  return candidates.slice(0, maxKeywords);
}

/**
 * Get summary statistics for a keyword collection
 */
export function getKeywordStats(collection: KeywordCollection): {
  total: number;
  byColor: { red: number; yellow: number; green: number };
  averageMastery: number;
  dueCount: number;
  needingCoverage: number;
} {
  let total = 0;
  let redCount = 0;
  let yellowCount = 0;
  let greenCount = 0;
  let totalMastery = 0;
  let dueCount = 0;
  let needingCoverage = 0;
  const now = new Date();

  for (const state of Object.values(collection)) {
    total++;
    if (state.color === 'red') redCount++;
    else if (state.color === 'yellow') yellowCount++;
    else if (state.color === 'green') greenCount++;
    
    totalMastery += state.mastery;
    
    if (isKeywordDue(state, now)) dueCount++;
    if (state.card_coverage < 3) needingCoverage++;
  }

  return {
    total,
    byColor: { red: redCount, yellow: yellowCount, green: greenCount },
    averageMastery: total > 0 ? totalMastery / total : 0,
    dueCount,
    needingCoverage,
  };
}

/**
 * Increment card coverage when a new flashcard is created for a keyword
 */
export function incrementCardCoverage(
  collection: KeywordCollection,
  keyword: string
): KeywordCollection {
  const updated = { ...collection };
  const normalized = keyword.toLowerCase().trim();
  const state = getOrCreateKeyword(updated, keyword);
  
  updated[normalized] = {
    ...state,
    card_coverage: state.card_coverage + 1,
  };
  
  return updated;
}

/**
 * Get keywords due for review (used for flashcard deck building)
 */
export function getDueKeywords(
  collection: KeywordCollection,
  maxCount?: number
): Array<{ keyword: string; state: KeywordState; retention: number }> {
  const now = new Date();
  const due: Array<{ keyword: string; state: KeywordState; retention: number }> = [];

  for (const [keyword, state] of Object.entries(collection)) {
    if (isKeywordDue(state, now)) {
      const retention = calculateKeywordRetention(state, now);
      due.push({ keyword, state, retention });
    }
  }

  // Sort by retention (lowest first = most urgent)
  due.sort((a, b) => a.retention - b.retention);

  return maxCount ? due.slice(0, maxCount) : due;
}

/**
 * Export/serialize keyword collection for storage
 */
export function serializeKeywordCollection(collection: KeywordCollection): string {
  return JSON.stringify(collection);
}

/**
 * Import/deserialize keyword collection from storage
 */
export function deserializeKeywordCollection(data: string): KeywordCollection {
  try {
    return JSON.parse(data) as KeywordCollection;
  } catch {
    return {};
  }
}
