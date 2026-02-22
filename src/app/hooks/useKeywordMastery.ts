// ============================================================
// useKeywordMastery — Keyword mastery levels + personal notes
// Reusable: not tied to SummarySession specifically
// ============================================================

import { useState, useCallback } from 'react';
import {
  KeywordData,
  MasteryLevel,
  masteryConfig,
  findKeyword,
  getAllKeywordTerms,
} from '@/app/data/keywords';

export type { KeywordData, MasteryLevel };
export { masteryConfig };

export interface AnnotatedKeyword {
  keyword: KeywordData;
  mastery: MasteryLevel;
  notes: string[];
}

export interface KeywordStats {
  red: number;
  yellow: number;
  green: number;
  total: number;
}

export function useKeywordMastery() {
  const [keywordMastery, setKeywordMastery] = useState<Record<string, MasteryLevel>>({});
  const [personalNotes, setPersonalNotes] = useState<Record<string, string[]>>({});

  const handleMasteryChange = useCallback((term: string, level: MasteryLevel) => {
    setKeywordMastery(prev => ({ ...prev, [term]: level }));
  }, []);

  const handleUpdateNotes = useCallback((term: string, notes: string[]) => {
    setPersonalNotes(prev => ({ ...prev, [term]: notes }));
  }, []);

  const getAnnotationStats = useCallback((): KeywordStats => {
    const allTerms = getAllKeywordTerms();
    let red = 0, yellow = 0, green = 0;
    allTerms.forEach(term => {
      const kw = findKeyword(term);
      if (!kw) return;
      const level = keywordMastery[kw.term] || kw.masteryLevel;
      if (level === 'red') red++;
      else if (level === 'yellow') yellow++;
      else green++;
    });
    return { red, yellow, green, total: allTerms.length };
  }, [keywordMastery]);

  const getAnnotatedKeywords = useCallback((): AnnotatedKeyword[] => {
    const allTerms = getAllKeywordTerms();
    return allTerms
      .map(term => {
        const kw = findKeyword(term)!;
        const level = keywordMastery[kw.term] || kw.masteryLevel;
        const notes = personalNotes[kw.term] || [];
        return { keyword: kw, mastery: level, notes };
      })
      .sort((a, b) => {
        const order: Record<MasteryLevel, number> = { red: 0, yellow: 1, green: 2 };
        return order[a.mastery] - order[b.mastery];
      });
  }, [keywordMastery, personalNotes]);

  return {
    keywordMastery,
    setKeywordMastery,       // for persistence restore
    personalNotes,
    setPersonalNotes,        // for persistence restore
    handleMasteryChange,
    handleUpdateNotes,
    getAnnotationStats,
    getAnnotatedKeywords,
  };
}
