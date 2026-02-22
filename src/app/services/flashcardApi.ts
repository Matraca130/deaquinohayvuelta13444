// ============================================================
// Axon — Flashcard API Service
// Handles all flashcard CRUD, FSRS states, reviews, sessions
// ============================================================

import { realRequest } from '@/app/services/apiConfig';

// ── Types ─────────────────────────────────────────────────

export interface Flashcard {
  id: string;
  summary_id: string;
  keyword_id: string | null;
  front: string;
  back: string;
  source: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FSRSStateRecord {
  id: string;
  student_id: string;
  flashcard_id: string;
  stability: number;
  difficulty: number;
  due_at: string;
  last_review_at: string | null;
  reps: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  created_at: string;
  updated_at: string;
}

export interface ReviewRecord {
  id: string;
  session_id: string;
  item_id: string;
  instrument_type: string;
  grade: number;
  created_at: string;
}

export interface StudySessionRecord {
  id: string;
  student_id: string;
  session_type: string;
  course_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  total_reviews: number | null;
  correct_reviews: number | null;
}

export interface CourseItem {
  id: string;
  institution_id: string;
  name: string;
  code: string | null;
  description: string | null;
  color: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface SemesterItem {
  id: string;
  course_id: string;
  name: string;
  order_index: number;
}

export interface SectionItem {
  id: string;
  semester_id: string;
  name: string;
  order_index: number;
}

export interface TopicItem {
  id: string;
  section_id: string;
  name: string;
  order_index: number;
}

export interface SummaryItem {
  id: string;
  topic_id: string;
  title: string;
  body_markdown: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface KeywordItem {
  id: string;
  summary_id: string;
  term: string;
  definition: string | null;
  order_index: number;
}

// ── Paginated response shape ──────────────────────────────

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ── R3 — Common options for cancellable requests ──────────

export interface RequestOptions {
  signal?: AbortSignal;
}

// ── Hierarchy browsing (Professor) ────────────────────────

export async function getCourses(institutionId?: string, opts?: RequestOptions): Promise<PaginatedResponse<CourseItem>> {
  const qs = institutionId ? `?institution_id=${institutionId}` : '';
  return realRequest<PaginatedResponse<CourseItem>>(`/courses${qs}`, { signal: opts?.signal });
}

export async function getSemesters(courseId: string, opts?: RequestOptions): Promise<PaginatedResponse<SemesterItem>> {
  return realRequest<PaginatedResponse<SemesterItem>>(`/semesters?course_id=${courseId}`, { signal: opts?.signal });
}

export async function getSections(semesterId: string, opts?: RequestOptions): Promise<PaginatedResponse<SectionItem>> {
  return realRequest<PaginatedResponse<SectionItem>>(`/sections?semester_id=${semesterId}`, { signal: opts?.signal });
}

export async function getTopics(sectionId: string, opts?: RequestOptions): Promise<PaginatedResponse<TopicItem>> {
  return realRequest<PaginatedResponse<TopicItem>>(`/topics?section_id=${sectionId}`, { signal: opts?.signal });
}

export async function getSummaries(topicId: string, opts?: RequestOptions): Promise<PaginatedResponse<SummaryItem>> {
  return realRequest<PaginatedResponse<SummaryItem>>(`/summaries?topic_id=${topicId}`, { signal: opts?.signal });
}

export async function getKeywords(summaryId: string, opts?: RequestOptions): Promise<PaginatedResponse<KeywordItem>> {
  return realRequest<PaginatedResponse<KeywordItem>>(`/keywords?summary_id=${summaryId}`, { signal: opts?.signal });
}

// ── Flashcard CRUD (Professor) ────────────────────────────

export async function getFlashcards(summaryId: string, keywordId?: string, opts?: RequestOptions): Promise<PaginatedResponse<Flashcard>> {
  let qs = `?summary_id=${summaryId}`;
  if (keywordId) qs += `&keyword_id=${keywordId}`;
  return realRequest<PaginatedResponse<Flashcard>>(`/flashcards${qs}`, { signal: opts?.signal });
}

export async function getFlashcard(id: string): Promise<Flashcard> {
  return realRequest<Flashcard>(`/flashcards/${id}`);
}

export async function createFlashcard(data: {
  summary_id: string;
  keyword_id?: string | null;
  front: string;
  back: string;
  source?: string;
}): Promise<Flashcard> {
  return realRequest<Flashcard>('/flashcards', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFlashcard(
  id: string,
  data: { front?: string; back?: string; source?: string; is_active?: boolean }
): Promise<Flashcard> {
  return realRequest<Flashcard>(`/flashcards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFlashcard(id: string): Promise<void> {
  await realRequest(`/flashcards/${id}`, { method: 'DELETE' });
}

export async function restoreFlashcard(id: string): Promise<Flashcard> {
  return realRequest<Flashcard>(`/flashcards/${id}/restore`, { method: 'PUT' });
}

// ── FSRS States (Student) ─────────────────────────────────

export async function getFSRSStates(params?: {
  flashcard_id?: string;
  state?: string;
  due_before?: string;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}): Promise<FSRSStateRecord[]> {
  const qs = new URLSearchParams();
  if (params?.flashcard_id) qs.set('flashcard_id', params.flashcard_id);
  if (params?.state) qs.set('state', params.state);
  if (params?.due_before) qs.set('due_before', params.due_before);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const query = qs.toString();
  return realRequest<FSRSStateRecord[]>(`/fsrs-states${query ? '?' + query : ''}`, { signal: params?.signal });
}

export async function upsertFSRSState(data: {
  flashcard_id: string;
  stability?: number;
  difficulty?: number;
  due_at?: string;
  last_review_at?: string;
  reps?: number;
  lapses?: number;
  state?: string;
}): Promise<FSRSStateRecord> {
  return realRequest<FSRSStateRecord>('/fsrs-states', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Reviews (Student) ─────────────────────────────────────

export async function createReview(data: {
  session_id: string;
  item_id: string;
  instrument_type: 'flashcard';
  grade: number;
}): Promise<ReviewRecord> {
  return realRequest<ReviewRecord>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Study Sessions (Student) ──────────────────────────────

export async function createStudySession(data: {
  session_type: 'flashcard';
  course_id?: string;
}): Promise<StudySessionRecord> {
  return realRequest<StudySessionRecord>('/study-sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStudySession(
  id: string,
  data: {
    ended_at?: string;
    duration_seconds?: number;
    total_reviews?: number;
    correct_reviews?: number;
  }
): Promise<StudySessionRecord> {
  return realRequest<StudySessionRecord>(`/study-sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// D2 — getFlashcardsByIds removed: was never imported (N+1 anti-pattern, dead code)