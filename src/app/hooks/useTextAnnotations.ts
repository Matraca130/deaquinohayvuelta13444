// ============================================================
// useTextAnnotations — Text annotation system
// Manages: highlights, notes, MedBot questions on text
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';

// ── Types ──

export type AnnotationColor = 'yellow' | 'blue' | 'green' | 'pink';
export type AnnotationType = 'highlight' | 'note' | 'question';

export interface TextAnnotation {
  id: string;
  originalText: string;
  displayText: string;
  color: AnnotationColor;
  note: string;
  type: AnnotationType;
  botReply?: string;
  timestamp: number;
}

export interface PendingAnnotation {
  text: string;
  rect: DOMRect;
}

// ── Constants ──

export const HIGHLIGHTER_STYLES: Record<AnnotationColor, React.CSSProperties> = {
  yellow: { background: 'linear-gradient(to bottom, transparent 40%, #fde047 40%, #fde047 85%, transparent 85%)' },
  blue:   { background: 'linear-gradient(to bottom, transparent 40%, #93c5fd 40%, #93c5fd 85%, transparent 85%)' },
  green:  { background: 'linear-gradient(to bottom, transparent 40%, #6ee7b7 40%, #6ee7b7 85%, transparent 85%)' },
  pink:   { background: 'linear-gradient(to bottom, transparent 40%, #f9a8d4 40%, #f9a8d4 85%, transparent 85%)' },
};

// ── Hook ──

export function useTextAnnotations() {
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [pendingAnnotation, setPendingAnnotation] = useState<PendingAnnotation | null>(null);
  const [annotationNoteInput, setAnnotationNoteInput] = useState('');
  const [annotationQuestionInput, setAnnotationQuestionInput] = useState('');
  const [annotationBotLoading, setAnnotationBotLoading] = useState(false);
  const [annotationActiveTab, setAnnotationActiveTab] = useState<AnnotationType>('highlight');
  const [annotationColor, setAnnotationColor] = useState<AnnotationColor>('yellow');

  // Create a new annotation
  const createTextAnnotation = useCallback((
    text: string,
    type: AnnotationType,
    note: string = '',
    color: AnnotationColor = 'yellow'
  ) => {
    const newId = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newAnnotation: TextAnnotation = {
      id: newId,
      originalText: text,
      displayText: text.length > 200 ? text.slice(0, 200) + '…' : text,
      color,
      note,
      type,
      timestamp: Date.now(),
    };
    setTextAnnotations(prev => [...prev, newAnnotation]);

    // Simulate MedBot response for questions
    if (type === 'question') {
      setAnnotationBotLoading(true);
      setTimeout(() => {
        setTextAnnotations(prev => prev.map(a =>
          a.id === newId
            ? { ...a, botReply: `Com base no trecho selecionado, posso explicar que: "${text.slice(0, 60)}..." Este conceito é fundamental na medicina porque se relaciona com os mecanismos fisiológicos e anatômicos da região estudada. Deseja que eu aprofunde algum aspecto específico?` }
            : a
        ));
        setAnnotationBotLoading(false);
      }, 1500);
    }

    // Reset inputs
    setPendingAnnotation(null);
    setAnnotationNoteInput('');
    setAnnotationQuestionInput('');
  }, []);

  // Delete an annotation
  const deleteTextAnnotation = useCallback((id: string) => {
    setTextAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  // Close popup on outside click
  useEffect(() => {
    if (!pendingAnnotation) return;
    const handler = (e: MouseEvent) => {
      const popup = document.getElementById('text-annotation-popup');
      if (popup && !popup.contains(e.target as Node)) {
        setPendingAnnotation(null);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [pendingAnnotation]);

  return {
    // State
    textAnnotations,
    setTextAnnotations,            // for persistence restore
    pendingAnnotation,
    annotationNoteInput,
    annotationQuestionInput,
    annotationBotLoading,
    annotationActiveTab,
    annotationColor,

    // Setters
    setPendingAnnotation,
    setAnnotationNoteInput,
    setAnnotationQuestionInput,
    setAnnotationActiveTab,
    setAnnotationColor,

    // Actions
    createTextAnnotation,
    deleteTextAnnotation,

    // Constants
    highlighterStyles: HIGHLIGHTER_STYLES,
  };
}