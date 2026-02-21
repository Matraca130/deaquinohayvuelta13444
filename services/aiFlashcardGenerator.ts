// ============================================================
// Axon — AI Flashcard Generator (Keyword-Aware)
// Thin wrapper over studentApi.aiGenerateFlashcards.
// All scoring/gap-analysis runs server-side.
// ============================================================

import { aiGenerateFlashcards } from '@/app/services/studentApi';
import type { KeywordCollection } from './keywordManager';

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  keywords: {
    primary: string[];
    secondary: string[];
  };
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
}

/**
 * Generate flashcards for specific keywords via the AI backend.
 * Uses the centralised `aiRequest` channel (no raw fetch).
 */
export async function generateFlashcardsForKeywords(opts: {
  keywords: string[];
  count: number;
  courseContext: string;
  topicContext: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}): Promise<GeneratedFlashcard[]> {
  const topic = `${opts.topicContext} (foco em: ${opts.keywords.join(', ')})`;
  const result = await aiGenerateFlashcards(topic, opts.count, {
    course: opts.courseContext,
    keywords: opts.keywords,
    difficulty: opts.difficulty || 'medium',
  });
  return (result.flashcards ?? []) as GeneratedFlashcard[];
}

/**
 * Estimate how many flashcards should be generated based on keyword states.
 * Pure frontend helper — reads keyword collection in memory.
 */
export function estimateFlashcardNeeds(collection: KeywordCollection): {
  totalGap: number;
  byUrgency: { critical: number; high: number; medium: number };
  recommendedGeneration: number;
} {
  const TARGET_COVERAGE = 3;
  let critical = 0;
  let high = 0;
  let medium = 0;

  for (const state of Object.values(collection)) {
    if (state.card_coverage >= TARGET_COVERAGE) continue;
    const gap = TARGET_COVERAGE - state.card_coverage;
    const urgency = 1 - state.mastery; // simple proxy
    if (urgency > 0.7) critical += gap;
    else if (urgency > 0.4) high += gap;
    else medium += gap;
  }

  const totalGap = critical + high + medium;
  const recommendedGeneration = Math.min(critical + Math.ceil(high * 0.5), 20);

  return { totalGap, byUrgency: { critical, high, medium }, recommendedGeneration };
}

/**
 * Smart generate: pick keywords needing coverage, call AI, return results.
 */
export async function smartGenerateFlashcards(
  collection: KeywordCollection,
  courseContext: string,
  topicContext: string,
  config = { maxCardsPerSession: 10, targetCoverage: 3, minNeedScore: 0.4 },
): Promise<{
  flashcards: GeneratedFlashcard[];
  updatedCollection: KeywordCollection;
  stats: { keywordsProcessed: number; cardsGenerated: number; gapReduction: number };
}> {
  // Pick keywords needing cards
  const needingCards = Object.entries(collection)
    .filter(([, s]) => s.card_coverage < config.targetCoverage)
    .sort((a, b) => a[1].mastery - b[1].mastery)
    .slice(0, Math.ceil(config.maxCardsPerSession / 2));

  if (needingCards.length === 0) {
    return {
      flashcards: [],
      updatedCollection: collection,
      stats: { keywordsProcessed: 0, cardsGenerated: 0, gapReduction: 0 },
    };
  }

  const keywords = needingCards.map(([kw]) => kw);
  const flashcards = await generateFlashcardsForKeywords({
    keywords,
    count: keywords.length * 2,
    courseContext,
    topicContext,
  });

  // Update coverage counts locally
  const updatedCollection = { ...collection };
  const processed = new Set<string>();
  for (const fc of flashcards) {
    for (const kw of fc.keywords?.primary ?? []) {
      const norm = kw.toLowerCase().trim();
      if (updatedCollection[norm]) {
        updatedCollection[norm] = { ...updatedCollection[norm], card_coverage: updatedCollection[norm].card_coverage + 1 };
        processed.add(norm);
      }
    }
  }

  const afterGap = estimateFlashcardNeeds(updatedCollection).totalGap;
  const beforeGap = estimateFlashcardNeeds(collection).totalGap;

  return {
    flashcards,
    updatedCollection,
    stats: {
      keywordsProcessed: processed.size,
      cardsGenerated: flashcards.length,
      gapReduction: beforeGap - afterGap,
    },
  };
}
