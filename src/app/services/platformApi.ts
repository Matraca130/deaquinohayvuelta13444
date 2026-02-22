// ============================================================
// Axon — Platform API Service v4.4 (FOCUSED)
//
// SCOPE: Professor summary editor + Student summary interaction
//
// Includes ONLY:
//   - Health, content-tree
//   - Institutions (basic), memberships
//   - Content hierarchy: courses, semesters, sections, topics
//   - Summary + sub-entities: chunks, keywords, subtopics,
//     keyword-connections, kw-prof-notes, flashcards,
//     quiz-questions, videos
//   - Student interaction: kw-student-notes, text-annotations,
//     video-notes, reading-states
//   - Reorder
//
// ALL routes use the REAL backend (make-server-6569f786).
// Route pattern: flat paths + query params for filtering.
// Response: { data: ... } envelope, unwrapped by realRequest.
// ============================================================

import { realRequest, ApiError } from '@/app/services/apiConfig';
import type {
  UUID,
  Institution,
  Course,
  Semester,
  Section,
  Topic,
  Summary,
  Keyword,
  Chunk,
  Subtopic,
  KeywordConnection,
  KwProfNote,
  FlashcardCard,
  QuizQuestion,
  Video,
  KwStudentNote,
  PlatformTextAnnotation,
  VideoNote,
  ReadingState,
} from '@/app/types/platform';

// Re-export types for consumers
export type {
  Chunk, Subtopic, KeywordConnection, KwProfNote,
  FlashcardCard, QuizQuestion, Video, KwStudentNote,
  PlatformTextAnnotation as TextAnnotation, VideoNote, ReadingState,
} from '@/app/types/platform';

// Re-export error class
export { ApiError as PlatformApiError } from '@/app/services/apiConfig';

// Shorthand
const request = realRequest;

// ── Pagination types ──────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

function paginationQs(opts?: { limit?: number; offset?: number }): string {
  const params = new URLSearchParams();
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.offset) params.set('offset', String(opts.offset));
  return params.toString() ? `&${params}` : '';
}

// ============================================================
// HEALTH
// ============================================================

export async function healthCheck(): Promise<any> {
  return request('/health');
}

// ============================================================
// CONTENT TREE (full hierarchy in one call)
// ============================================================

export async function getContentTree(institutionId: UUID): Promise<any> {
  return request(`/content-tree?institution_id=${institutionId}`);
}

// ============================================================
// INSTITUTIONS — needed for context loading
// ============================================================

export async function getInstitutions(): Promise<Institution[]> {
  return request<Institution[]>('/institutions');
}

export async function getInstitution(instId: UUID): Promise<Institution> {
  return request<Institution>(`/institutions/${instId}`);
}

export async function getInstitutionDashboardStats(instId: UUID): Promise<any> {
  return request(`/institutions/${instId}/dashboard-stats`);
}

// ============================================================
// MEMBERSHIPS — needed by authApi after login
// ============================================================

export async function getMemberships(): Promise<any[]> {
  return request<any[]>('/memberships');
}

// ============================================================
// MEMBERS — needed by PlatformDataContext
// ============================================================

export async function getMembers(institutionId: UUID): Promise<any[]> {
  return request<any[]>(`/members/${institutionId}`);
}

// ============================================================
// INSTITUTION PLANS — needed by PlatformDataContext
// ============================================================

export async function getInstitutionPlans(instId: UUID, opts?: { include_inactive?: boolean }): Promise<any> {
  const qs = opts?.include_inactive ? '?include_inactive=true' : '';
  return request(`/institutions/${instId}/plans${qs}`);
}

// ============================================================
// SUBSCRIPTION — needed by PlatformDataContext
// ============================================================

export async function getInstitutionSubscription(instId: UUID): Promise<any> {
  return request(`/institutions/${instId}/subscription`);
}

// ============================================================
// COURSES — paginated (requires institution_id)
// ============================================================

export async function getCourses(institutionId: UUID, opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Course>> {
  return request<PaginatedResult<Course>>(`/courses?institution_id=${institutionId}${paginationQs(opts)}`);
}

export async function getCourse(courseId: UUID): Promise<Course> {
  return request<Course>(`/courses/${courseId}`);
}

export async function createCourse(data: {
  institution_id: UUID;
  name: string;
  description?: string;
  order_index?: number;
}): Promise<Course> {
  return request<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCourse(courseId: UUID, data: Partial<Course>): Promise<Course> {
  return request<Course>(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(courseId: UUID): Promise<void> {
  return request(`/courses/${courseId}`, { method: 'DELETE' });
}

// ============================================================
// SEMESTERS — paginated (requires course_id)
// ============================================================

export async function getSemesters(courseId: UUID, opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Semester>> {
  return request<PaginatedResult<Semester>>(`/semesters?course_id=${courseId}${paginationQs(opts)}`);
}

export async function getSemester(semesterId: UUID): Promise<Semester> {
  return request<Semester>(`/semesters/${semesterId}`);
}

export async function createSemester(data: { course_id: UUID; name: string; order_index?: number }): Promise<Semester> {
  return request<Semester>('/semesters', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSemester(semesterId: UUID, data: Partial<Semester>): Promise<Semester> {
  return request<Semester>(`/semesters/${semesterId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSemester(semesterId: UUID): Promise<void> {
  return request(`/semesters/${semesterId}`, { method: 'DELETE' });
}

// ============================================================
// SECTIONS — paginated (requires semester_id)
// ============================================================

export async function getSections(semesterId: UUID, opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Section>> {
  return request<PaginatedResult<Section>>(`/sections?semester_id=${semesterId}${paginationQs(opts)}`);
}

export async function getSection(sectionId: UUID): Promise<Section> {
  return request<Section>(`/sections/${sectionId}`);
}

export async function createSection(data: { semester_id: UUID; name: string; order_index?: number }): Promise<Section> {
  return request<Section>('/sections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSection(sectionId: UUID, data: Partial<Section>): Promise<Section> {
  return request<Section>(`/sections/${sectionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSection(sectionId: UUID): Promise<void> {
  return request(`/sections/${sectionId}`, { method: 'DELETE' });
}

// ============================================================
// TOPICS — paginated (requires section_id)
// ============================================================

export async function getTopics(sectionId: UUID, opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Topic>> {
  return request<PaginatedResult<Topic>>(`/topics?section_id=${sectionId}${paginationQs(opts)}`);
}

export async function getTopic(topicId: UUID): Promise<Topic> {
  return request<Topic>(`/topics/${topicId}`);
}

export async function createTopic(data: { section_id: UUID; name: string; order_index?: number }): Promise<Topic> {
  return request<Topic>('/topics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTopic(topicId: UUID, data: Partial<Topic>): Promise<Topic> {
  return request<Topic>(`/topics/${topicId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTopic(topicId: UUID): Promise<void> {
  return request(`/topics/${topicId}`, { method: 'DELETE' });
}

// ============================================================
// SUMMARIES — paginated, SACRED soft-delete (requires topic_id)
// ============================================================

export async function getSummaries(topicId: UUID, opts?: { limit?: number; offset?: number; include_deleted?: boolean }): Promise<PaginatedResult<Summary>> {
  let qs = `?topic_id=${topicId}`;
  if (opts?.include_deleted) qs += '&include_deleted=true';
  qs += paginationQs(opts);
  return request<PaginatedResult<Summary>>(`/summaries${qs}`);
}

export const getTopicSummaries = async (topicId: UUID): Promise<Summary[]> => {
  const result = await getSummaries(topicId);
  return result.items || [];
};

export async function getSummary(summaryId: UUID): Promise<Summary> {
  return request<Summary>(`/summaries/${summaryId}`);
}

export async function createSummary(data: {
  topic_id: UUID;
  title: string;
  content_markdown?: string;
  status?: string;
  order_index?: number;
}): Promise<Summary> {
  return request<Summary>('/summaries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSummary(summaryId: UUID, data: Partial<Summary>): Promise<Summary> {
  return request<Summary>(`/summaries/${summaryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSummary(summaryId: UUID): Promise<void> {
  return request(`/summaries/${summaryId}`, { method: 'DELETE' });
}

export async function restoreSummary(summaryId: UUID): Promise<Summary> {
  return request<Summary>(`/summaries/${summaryId}/restore`, { method: 'PUT' });
}

// ============================================================
// CHUNKS — paginated, hard delete (requires summary_id)
// ============================================================

export async function getChunks(summaryId: UUID, opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Chunk>> {
  return request<PaginatedResult<Chunk>>(`/chunks?summary_id=${summaryId}${paginationQs(opts)}`);
}

export async function createChunk(data: {
  summary_id: UUID;
  content: string;
  order_index?: number;
  metadata?: Record<string, any>;
}): Promise<Chunk> {
  return request<Chunk>('/chunks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateChunk(chunkId: UUID, data: Partial<Chunk>): Promise<Chunk> {
  return request<Chunk>(`/chunks/${chunkId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteChunk(chunkId: UUID): Promise<void> {
  return request(`/chunks/${chunkId}`, { method: 'DELETE' });
}

// ============================================================
// KEYWORDS — paginated, SACRED soft-delete (requires summary_id)
// ============================================================

export async function getKeywords(summaryId: UUID, opts?: { limit?: number; offset?: number; include_deleted?: boolean }): Promise<PaginatedResult<Keyword>> {
  let qs = `?summary_id=${summaryId}`;
  if (opts?.include_deleted) qs += '&include_deleted=true';
  qs += paginationQs(opts);
  return request<PaginatedResult<Keyword>>(`/keywords${qs}`);
}

export async function getKeyword(keywordId: UUID): Promise<Keyword> {
  return request<Keyword>(`/keywords/${keywordId}`);
}

export async function createKeyword(data: {
  summary_id: UUID;
  name: string;
  definition?: string;
  priority?: number;
}): Promise<Keyword> {
  return request<Keyword>('/keywords', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateKeyword(keywordId: UUID, data: Partial<Keyword>): Promise<Keyword> {
  return request<Keyword>(`/keywords/${keywordId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteKeyword(keywordId: UUID): Promise<void> {
  return request(`/keywords/${keywordId}`, { method: 'DELETE' });
}

export async function restoreKeyword(keywordId: UUID): Promise<Keyword> {
  return request<Keyword>(`/keywords/${keywordId}/restore`, { method: 'PUT' });
}

// ============================================================
// SUBTOPICS — paginated, SACRED soft-delete (requires keyword_id)
// ============================================================

export async function getSubtopics(keywordId: UUID, opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Subtopic>> {
  return request<PaginatedResult<Subtopic>>(`/subtopics?keyword_id=${keywordId}${paginationQs(opts)}`);
}

export async function createSubtopic(data: { keyword_id: UUID; name: string; order_index?: number }): Promise<Subtopic> {
  return request<Subtopic>('/subtopics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSubtopic(subtopicId: UUID, data: Partial<Subtopic>): Promise<Subtopic> {
  return request<Subtopic>(`/subtopics/${subtopicId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSubtopic(subtopicId: UUID): Promise<void> {
  return request(`/subtopics/${subtopicId}`, { method: 'DELETE' });
}

export async function restoreSubtopic(subtopicId: UUID): Promise<Subtopic> {
  return request<Subtopic>(`/subtopics/${subtopicId}/restore`, { method: 'PUT' });
}

// ============================================================
// KEYWORD CONNECTIONS — custom list (array plano)
// ============================================================

export async function getKeywordConnections(keywordId: UUID): Promise<KeywordConnection[]> {
  return request<KeywordConnection[]>(`/keyword-connections?keyword_id=${keywordId}`);
}

export async function createKeywordConnection(data: {
  keyword_a_id: UUID;
  keyword_b_id: UUID;
  relationship?: string;
}): Promise<KeywordConnection> {
  return request<KeywordConnection>('/keyword-connections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteKeywordConnection(connectionId: UUID): Promise<void> {
  return request(`/keyword-connections/${connectionId}`, { method: 'DELETE' });
}

// ============================================================
// PROFESSOR NOTES ON KEYWORDS — custom list, upsert
// ============================================================

export async function getKwProfNotes(keywordId: UUID): Promise<KwProfNote[]> {
  return request<KwProfNote[]>(`/kw-prof-notes?keyword_id=${keywordId}`);
}

export async function createKwProfNote(data: { keyword_id: UUID; note: string }): Promise<KwProfNote> {
  return request<KwProfNote>('/kw-prof-notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteKwProfNote(noteId: UUID): Promise<void> {
  return request(`/kw-prof-notes/${noteId}`, { method: 'DELETE' });
}

// ============================================================
// FLASHCARDS — paginated, SACRED soft-delete (requires summary_id)
// ============================================================

export async function getFlashcards(summaryId: UUID, opts?: { keyword_id?: UUID; limit?: number; offset?: number }): Promise<PaginatedResult<FlashcardCard>> {
  let qs = `?summary_id=${summaryId}`;
  if (opts?.keyword_id) qs += `&keyword_id=${opts.keyword_id}`;
  qs += paginationQs(opts);
  return request<PaginatedResult<FlashcardCard>>(`/flashcards${qs}`);
}

export async function createFlashcard(data: {
  summary_id: UUID;
  keyword_id: UUID;
  front: string;
  back: string;
  source?: string;
}): Promise<FlashcardCard> {
  return request<FlashcardCard>('/flashcards', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFlashcard(cardId: UUID, data: Partial<FlashcardCard>): Promise<FlashcardCard> {
  return request<FlashcardCard>(`/flashcards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFlashcard(cardId: UUID): Promise<void> {
  return request(`/flashcards/${cardId}`, { method: 'DELETE' });
}

export async function restoreFlashcard(cardId: UUID): Promise<FlashcardCard> {
  return request<FlashcardCard>(`/flashcards/${cardId}/restore`, { method: 'PUT' });
}

// ============================================================
// QUIZ QUESTIONS — paginated, SACRED soft-delete
// ============================================================

export async function getQuizQuestions(summaryId: UUID, opts?: {
  keyword_id?: UUID;
  question_type?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResult<QuizQuestion>> {
  let qs = `?summary_id=${summaryId}`;
  if (opts?.keyword_id) qs += `&keyword_id=${opts.keyword_id}`;
  if (opts?.question_type) qs += `&question_type=${opts.question_type}`;
  if (opts?.difficulty) qs += `&difficulty=${opts.difficulty}`;
  qs += paginationQs(opts);
  return request<PaginatedResult<QuizQuestion>>(`/quiz-questions${qs}`);
}

export async function createQuizQuestion(data: {
  summary_id: UUID;
  keyword_id: UUID;
  question_type: string;
  question: string;
  correct_answer: string;
  options?: any;
  explanation?: string;
  difficulty?: string;
  source?: string;
}): Promise<QuizQuestion> {
  return request<QuizQuestion>('/quiz-questions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuizQuestion(questionId: UUID, data: Partial<QuizQuestion>): Promise<QuizQuestion> {
  return request<QuizQuestion>(`/quiz-questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteQuizQuestion(questionId: UUID): Promise<void> {
  return request(`/quiz-questions/${questionId}`, { method: 'DELETE' });
}

export async function restoreQuizQuestion(questionId: UUID): Promise<QuizQuestion> {
  return request<QuizQuestion>(`/quiz-questions/${questionId}/restore`, { method: 'PUT' });
}

// ============================================================
// VIDEOS — paginated, SACRED soft-delete (requires summary_id)
// ============================================================

export async function getVideos(summaryId: UUID, opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Video>> {
  return request<PaginatedResult<Video>>(`/videos?summary_id=${summaryId}${paginationQs(opts)}`);
}

export async function createVideo(data: {
  summary_id: UUID;
  title: string;
  url: string;
  platform?: string;
  duration_seconds?: number;
  order_index?: number;
}): Promise<Video> {
  return request<Video>('/videos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVideo(videoId: UUID, data: Partial<Video>): Promise<Video> {
  return request<Video>(`/videos/${videoId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteVideo(videoId: UUID): Promise<void> {
  return request(`/videos/${videoId}`, { method: 'DELETE' });
}

export async function restoreVideo(videoId: UUID): Promise<Video> {
  return request<Video>(`/videos/${videoId}/restore`, { method: 'PUT' });
}

// ============================================================
// STUDENT NOTES ON KEYWORDS — paginated, scopeToUser
// ============================================================

export async function getKwStudentNotes(keywordId: UUID): Promise<PaginatedResult<KwStudentNote>> {
  return request<PaginatedResult<KwStudentNote>>(`/kw-student-notes?keyword_id=${keywordId}`);
}

export async function createKwStudentNote(data: { keyword_id: UUID; note: string }): Promise<KwStudentNote> {
  return request<KwStudentNote>('/kw-student-notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateKwStudentNote(noteId: UUID, data: { note?: string }): Promise<KwStudentNote> {
  return request<KwStudentNote>(`/kw-student-notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteKwStudentNote(noteId: UUID): Promise<void> {
  return request(`/kw-student-notes/${noteId}`, { method: 'DELETE' });
}

export async function restoreKwStudentNote(noteId: UUID): Promise<KwStudentNote> {
  return request<KwStudentNote>(`/kw-student-notes/${noteId}/restore`, { method: 'PUT' });
}

// ============================================================
// TEXT ANNOTATIONS — paginated, scopeToUser
// ============================================================

export async function getTextAnnotations(summaryId: UUID): Promise<PaginatedResult<PlatformTextAnnotation>> {
  return request<PaginatedResult<PlatformTextAnnotation>>(`/text-annotations?summary_id=${summaryId}`);
}

export async function createTextAnnotation(data: {
  summary_id: UUID;
  start_offset: number;
  end_offset: number;
  color?: string;
  note?: string;
}): Promise<PlatformTextAnnotation> {
  return request<PlatformTextAnnotation>('/text-annotations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTextAnnotation(annotationId: UUID, data: { color?: string; note?: string }): Promise<PlatformTextAnnotation> {
  return request<PlatformTextAnnotation>(`/text-annotations/${annotationId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTextAnnotation(annotationId: UUID): Promise<void> {
  return request(`/text-annotations/${annotationId}`, { method: 'DELETE' });
}

// ============================================================
// VIDEO NOTES — paginated, scopeToUser
// ============================================================

export async function getVideoNotes(videoId: UUID): Promise<PaginatedResult<VideoNote>> {
  return request<PaginatedResult<VideoNote>>(`/video-notes?video_id=${videoId}`);
}

export async function createVideoNote(data: {
  video_id: UUID;
  timestamp_seconds?: number;
  note: string;
}): Promise<VideoNote> {
  return request<VideoNote>('/video-notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVideoNote(noteId: UUID, data: { timestamp_seconds?: number; note?: string }): Promise<VideoNote> {
  return request<VideoNote>(`/video-notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteVideoNote(noteId: UUID): Promise<void> {
  return request(`/video-notes/${noteId}`, { method: 'DELETE' });
}

// ============================================================
// READING STATE — upsert (one per student+summary)
// ============================================================

export async function getReadingState(summaryId: UUID): Promise<ReadingState | null> {
  return request<ReadingState | null>(`/reading-states?summary_id=${summaryId}`);
}

export async function upsertReadingState(data: {
  summary_id: UUID;
  scroll_position?: number;
  time_spent_seconds?: number;
  completed?: boolean;
  last_read_at?: string;
}): Promise<ReadingState> {
  return request<ReadingState>('/reading-states', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================================
// REORDER — bulk reorder any orderable table
// ============================================================

export async function reorder(table: string, items: Array<{ id: UUID; order_index: number }>): Promise<void> {
  return request('/reorder', {
    method: 'PUT',
    body: JSON.stringify({ table, items }),
  });
}