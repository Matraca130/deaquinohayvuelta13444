// ============================================================
// Flashcard Types, Constants & Pure Utilities
// Shared across all flashcard screens and hooks.
// ============================================================

import type { Flashcard } from '@/app/data/courses';

// ── Types ──

export type FlashcardViewState = 'hub' | 'section' | 'deck' | 'session' | 'summary';

export interface MasteryStats {
  avg: number;
  pct: number;
  mastered: number;
  learning: number;
  newCards: number;
}

// ── Constants ──

export const RATINGS = [
  { value: 1, label: 'Nao sei', color: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-rose-500', desc: 'Repetir logo' },
  { value: 2, label: 'Dificil', color: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-500', desc: 'Repetir em breve' },
  { value: 3, label: 'Medio', color: 'bg-yellow-400', hover: 'hover:bg-yellow-500', text: 'text-yellow-500', desc: 'Duvida razoavel' },
  { value: 4, label: 'Facil', color: 'bg-lime-500', hover: 'hover:bg-lime-600', text: 'text-lime-600', desc: 'Entendi bem' },
  { value: 5, label: 'Perfeito', color: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-emerald-500', desc: 'Memorizado' },
] as const;

// ── Pure Utilities ──

export function getMasteryStats(cards: Flashcard[]): MasteryStats {
  if (cards.length === 0) return { avg: 0, pct: 0, mastered: 0, learning: 0, newCards: 0 };
  const avg = cards.reduce((s, c) => s + c.mastery, 0) / cards.length;
  return {
    avg,
    pct: (avg / 5) * 100,
    mastered: cards.filter(c => c.mastery >= 4).length,
    learning: cards.filter(c => c.mastery === 3).length,
    newCards: cards.filter(c => c.mastery <= 2).length,
  };
}

export type MasteryFilter = 'all' | 'new' | 'learning' | 'mastered';

export function filterCardsByMastery(cards: Flashcard[], filter: MasteryFilter): Flashcard[] {
  switch (filter) {
    case 'new': return cards.filter(c => c.mastery <= 2);
    case 'learning': return cards.filter(c => c.mastery === 3);
    case 'mastered': return cards.filter(c => c.mastery >= 4);
    default: return cards;
  }
}
