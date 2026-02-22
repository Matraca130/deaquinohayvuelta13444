// ============================================================
// Axon — Student API Service (Hybrid Backend)
//
// TWO REQUEST CHANNELS:
// ┌──────────────────────────────────────────────────────────┐
// │ dataRequest — Student CRUD                               │
// │  (profile, stats, progress, sessions, reviews,           │
// │   summaries, keywords)                                   │
// │  Currently → figmaRequest (Figma Make backend)           │
// │  MIGRATION: flip to realRequest once routes-student.tsx   │
// │  is mounted in the real backend's index.ts               │
// │                                                          │
// │ aiRequest — AI + prototyping tools                       │
// │  (chat, flashcards, quiz, explain, seed)                 │
// │  Always → figmaRequest (endpoints only on Figma Make)    │
// └──────────────────────────────────────────────────────────┘
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- realRequest is pre-imported for the migration toggle below
import { figmaRequest, realRequest } from '@/app/services/apiConfig';
import type {
  StudentProfile,
  StudentStats,
  CourseProgress,
  FlashcardReview,
  StudySession,
  DailyActivity,
  StudySummary,
} from '@/app/types/student';

// ── Request function toggle ───────────────────────────────
// Student data CRUD → flip to `realRequest` when routes-student.tsx
// is mounted in the real backend's index.ts.
// AI features always stay on `figmaRequest`.
const dataRequest = figmaRequest;   // ← FLIP TO: realRequest
const aiRequest = figmaRequest;     // ← ALWAYS figmaRequest

// ── Student ID resolution ─────────────────────────────────

const FALLBACK_STUDENT_ID = 'demo-student-001';

function resolveId(studentId?: string): string {
  return studentId || FALLBACK_STUDENT_ID;
}

// ── Profile ───────────────────────────────────────────────

export async function getProfile(studentId?: string): Promise<StudentProfile | null> {
  const id = resolveId(studentId);
  try {
    return await dataRequest<StudentProfile>(`/student/${id}/profile`);
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function updateProfile(
  data: Partial<StudentProfile>,
  studentId?: string
): Promise<StudentProfile> {
  const id = resolveId(studentId);
  return dataRequest<StudentProfile>(`/student/${id}/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Stats ────────────────────────────────────────────────

export async function getStats(studentId?: string): Promise<StudentStats | null> {
  const id = resolveId(studentId);
  try {
    return await dataRequest<StudentStats>(`/student/${id}/stats`);
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function updateStats(
  data: Partial<StudentStats>,
  studentId?: string
): Promise<StudentStats> {
  const id = resolveId(studentId);
  return dataRequest<StudentStats>(`/student/${id}/stats`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Course Progress ───────────────────────────────────────

export async function getAllCourseProgress(studentId?: string): Promise<CourseProgress[]> {
  const id = resolveId(studentId);
  const result = await dataRequest<CourseProgress[]>(`/student/${id}/progress`);
  return result || [];
}

export async function getCourseProgress(
  courseId: string,
  studentId?: string
): Promise<CourseProgress | null> {
  const id = resolveId(studentId);
  try {
    return await dataRequest<CourseProgress>(`/student/${id}/progress/${courseId}`);
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function updateCourseProgress(
  courseId: string,
  data: Partial<CourseProgress>,
  studentId?: string
): Promise<CourseProgress> {
  const id = resolveId(studentId);
  return dataRequest<CourseProgress>(`/student/${id}/progress/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Daily Activity ────────────────────────────────────────

export async function getDailyActivity(studentId?: string): Promise<DailyActivity[]> {
  const id = resolveId(studentId);
  const result = await dataRequest<DailyActivity[]>(`/student/${id}/activity`);
  return result || [];
}

// ── Sessions ──────────────────────────────────────────────

export async function getSessions(studentId?: string): Promise<StudySession[]> {
  const id = resolveId(studentId);
  const result = await dataRequest<StudySession[]>(`/student/${id}/sessions`);
  return result || [];
}

export async function logSession(
  data: Omit<StudySession, 'studentId'>,
  studentId?: string
): Promise<StudySession> {
  const id = resolveId(studentId);
  return dataRequest<StudySession>(`/student/${id}/sessions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Flashcard Reviews ─────────────────────────────────────

export async function getReviews(studentId?: string): Promise<FlashcardReview[]> {
  const id = resolveId(studentId);
  const result = await dataRequest<FlashcardReview[]>(`/student/${id}/reviews`);
  return result || [];
}

export async function getReviewsByCourse(
  courseId: string,
  studentId?: string
): Promise<FlashcardReview[]> {
  const id = resolveId(studentId);
  return dataRequest<FlashcardReview[]>(`/student/${id}/reviews/${courseId}`);
}

export async function saveReviews(
  reviews: FlashcardReview[],
  studentId?: string
): Promise<{ saved: number }> {
  const id = resolveId(studentId);
  return dataRequest<{ saved: number }>(`/student/${id}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ reviews }),
  });
}

// ── Study Summaries ───────────────────────────────────────

export async function getStudySummary(
  studentId: string,
  courseId: string,
  topicId: string
): Promise<StudySummary | null> {
  try {
    return await dataRequest<StudySummary>(
      `/student/${studentId}/summaries/${courseId}/${topicId}`
    );
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function getAllSummaries(studentId?: string): Promise<StudySummary[]> {
  const id = resolveId(studentId);
  return dataRequest<StudySummary[]>(`/student/${id}/summaries`);
}

export async function getCourseSummaries(
  courseId: string,
  studentId?: string
): Promise<StudySummary[]> {
  const id = resolveId(studentId);
  return dataRequest<StudySummary[]>(`/student/${id}/summaries/${courseId}`);
}

export async function saveStudySummary(
  studentId: string,
  courseId: string,
  topicId: string,
  data: Partial<StudySummary>
): Promise<StudySummary> {
  return dataRequest<StudySummary>(
    `/student/${studentId}/summaries/${courseId}/${topicId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function deleteStudySummary(
  studentId: string,
  courseId: string,
  topicId: string
): Promise<void> {
  await dataRequest(
    `/student/${studentId}/summaries/${courseId}/${topicId}`,
    { method: 'DELETE' }
  );
}

// ── Keywords ──────────────────────────────────────────────

export async function getKeywords(
  courseId: string,
  studentId?: string
): Promise<any> {
  const id = resolveId(studentId);
  return dataRequest(`/student/${id}/keywords/${courseId}`);
}

export async function getTopicKeywords(
  courseId: string,
  topicId: string,
  studentId?: string
): Promise<any> {
  const id = resolveId(studentId);
  return dataRequest(`/student/${id}/keywords/${courseId}/${topicId}`);
}

export async function saveKeywords(
  courseId: string,
  topicId: string,
  keywords: Record<string, any>,
  studentId?: string
): Promise<any> {
  const id = resolveId(studentId);
  return dataRequest(`/student/${id}/keywords/${courseId}/${topicId}`, {
    method: 'PUT',
    body: JSON.stringify({ keywords }),
  });
}

export async function saveCourseKeywords(
  courseId: string,
  keywords: Record<string, any>,
  studentId?: string
): Promise<any> {
  const id = resolveId(studentId);
  return dataRequest(`/student/${id}/keywords/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify({ keywords }),
  });
}

// ── Seed Demo Data ────────────────────────────────────────
// NOTE: Seed is a prototyping tool (Figma Make only).
// Always uses aiRequest (figmaRequest) regardless of toggle.

export async function seedDemoData(studentId?: string): Promise<void> {
  const qs = studentId ? `?studentId=${studentId}` : '';
  await aiRequest(`/seed${qs}`, { method: 'POST' });
}

// ── AI Features ───────────────────────────────────────────

export async function aiChat(
  messages: Array<{ role: string; content: string }>,
  context?: any
): Promise<{ reply: string }> {
  return aiRequest<{ reply: string }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, context }),
  });
}

export async function aiGenerateFlashcards(
  topic: string,
  count = 5,
  context?: any
): Promise<{ flashcards: any[] }> {
  return aiRequest<{ flashcards: any[] }>('/ai/flashcards', {
    method: 'POST',
    body: JSON.stringify({ topic, count, context }),
  });
}

export async function aiGenerateQuiz(
  topic: string,
  count = 3,
  difficulty = 'intermediate'
): Promise<{ questions: any[] }> {
  return aiRequest<{ questions: any[] }>('/ai/quiz', {
    method: 'POST',
    body: JSON.stringify({ topic, count, difficulty }),
  });
}

export async function aiExplain(
  concept: string,
  context?: any
): Promise<{ explanation: string }> {
  return aiRequest<{ explanation: string }>('/ai/explain', {
    method: 'POST',
    body: JSON.stringify({ concept, context }),
  });
}

// ── Backward Compatibility Aliases ────────────────────────
// These match the old function names used by existing components.

export const getCourseKeywords = getKeywords;
export const saveTopicKeywords = saveKeywords;

// Aliases used by useSummaryPersistence (courseId, topicId first; studentId last & optional)
export function getSummary(
  courseId: string,
  topicId: string,
  studentId?: string
): Promise<StudySummary | null> {
  return getStudySummary(resolveId(studentId), courseId, topicId);
}

export function saveSummary(
  courseId: string,
  topicId: string,
  data: Partial<StudySummary>,
  studentId?: string
): Promise<StudySummary> {
  return saveStudySummary(resolveId(studentId), courseId, topicId, data);
}