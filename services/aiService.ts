// ============================================================
// Axon — AI Service (Frontend → Backend → Gemini)
// ============================================================

import { FIGMA_BACKEND_URL, getAnonKey } from '@/app/services/apiConfig';

async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${FIGMA_BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAnonKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const rawMsg = err?.error || `AI API error ${res.status}`;
    console.error(`[aiService] ${rawMsg}`);

    // Provide a user-friendly message for rate limits
    if (res.status === 500 && rawMsg.toLowerCase().includes('rate limit')) {
      throw new Error(
        'A API de IA está temporariamente sobrecarregada. Aguarde alguns segundos e tente novamente.'
      );
    }
    if (res.status === 500 && rawMsg.toLowerCase().includes('429')) {
      throw new Error(
        'Limite de requisições da IA excedido. Aguarde um momento e tente novamente.'
      );
    }

    throw new Error(rawMsg);
  }

  return res.json();
}

// ── Types ─────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatContext {
  courseName?: string;
  topicTitle?: string;
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// ── API calls ─────────────────────────────────────────────

export async function chat(
  messages: ChatMessage[],
  context?: ChatContext
): Promise<string> {
  const data = await post<{ reply: string }>('/ai/chat', { messages, context });
  return data.reply;
}

export async function generateFlashcards(
  topic: string,
  count: number = 5,
  context?: string
): Promise<GeneratedFlashcard[]> {
  const data = await post<{ flashcards: GeneratedFlashcard[] }>('/ai/flashcards', {
    topic,
    count,
    context,
  });
  return data.flashcards;
}

export async function generateQuiz(
  topic: string,
  count: number = 3,
  difficulty: 'basic' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<GeneratedQuestion[]> {
  const data = await post<{ questions: GeneratedQuestion[] }>('/ai/quiz', {
    topic,
    count,
    difficulty,
  });
  return data.questions;
}

export async function explainConcept(
  concept: string,
  context?: string
): Promise<string> {
  const data = await post<{ explanation: string }>('/ai/explain', {
    concept,
    context,
  });
  return data.explanation;
}