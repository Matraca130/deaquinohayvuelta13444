// ============================================================
// Axon — Platform API Service (Frontend -> Real Backend)
// Covers: institutions, members, plans, subscriptions, admin
// scopes, access rules, content hierarchy, flashcards, reviews.
//
// Uses centralized config from apiConfig.ts
// ============================================================

import { realRequest, REAL_BACKEND_URL, getRealToken, ApiError } from '@/app/services/apiConfig';
import type {
  UUID,
  ApiResponse,
  Institution,
  InstitutionDashboardStats,
  MemberListItem,
  CreateMemberPayload,
  PlatformPlan,
  InstitutionPlan,
  InstitutionSubscription,
  AdminScope,
  PlanAccessRule,
  AccessCheckResult,
  Course,
  Semester,
  Section,
  Topic,
  Summary,
  SummaryStatus,
  Keyword,
  ContentHierarchy,
  MembershipRole,
  ISODate,
} from '@/app/types/platform';

// Re-export error class from config for backward compatibility
export { ApiError as PlatformApiError } from '@/app/services/apiConfig';

// Use centralized request helper
const request = realRequest;

// ============================================================
// INSTITUTIONS
// ============================================================

export async function getInstitutions(): Promise<Institution[]> {
  return request<Institution[]>('/institutions');
}

export async function getInstitution(instId: UUID): Promise<Institution> {
  return request<Institution>(`/institutions/${instId}`);
}

export async function getInstitutionBySlug(slug: string): Promise<Institution> {
  return request<Institution>(`/institutions/by-slug/${slug}`);
}

export async function checkSlugAvailability(slug: string): Promise<{ available: boolean; suggestion?: string }> {
  return request(`/institutions/check-slug/${slug}`);
}

export async function getInstitutionDashboardStats(instId: UUID): Promise<InstitutionDashboardStats> {
  return request<InstitutionDashboardStats>(`/institutions/${instId}/dashboard-stats`);
}

export async function createInstitution(data: {
  name: string;
  slug: string;
  logo_url?: string;
  settings?: Record<string, any>;
}): Promise<Institution> {
  return request<Institution>('/institutions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInstitution(instId: UUID, data: Partial<Institution>): Promise<Institution> {
  return request<Institution>(`/institutions/${instId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteInstitution(instId: UUID): Promise<{ id: UUID; is_active: boolean }> {
  return request(`/institutions/${instId}`, { method: 'DELETE' });
}

// ============================================================
// MEMBERS
// ============================================================

export async function getMembers(institutionId: UUID): Promise<MemberListItem[]> {
  return request<MemberListItem[]>(`/members/${institutionId}`);
}

export async function createMember(data: CreateMemberPayload): Promise<MemberListItem> {
  return request<MemberListItem>('/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function changeMemberRole(memberId: UUID, role: MembershipRole): Promise<MemberListItem> {
  return request<MemberListItem>(`/members/${memberId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function changeMemberPlan(memberId: UUID, institutionPlanId: UUID | null): Promise<MemberListItem> {
  return request<MemberListItem>(`/members/${memberId}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({ institution_plan_id: institutionPlanId }),
  });
}

export async function toggleMemberActive(memberId: UUID, isActive: boolean): Promise<MemberListItem> {
  return request<MemberListItem>(`/members/${memberId}/toggle-active`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function deleteMember(memberId: UUID): Promise<{ id: UUID; deleted: boolean }> {
  return request(`/members/${memberId}`, { method: 'DELETE' });
}

// ============================================================
// PLATFORM PLANS (Axon sells to institutions)
// ============================================================

export async function getPlatformPlans(includeInactive = false): Promise<PlatformPlan[]> {
  const qs = includeInactive ? '?include_inactive=true' : '';
  return request<PlatformPlan[]>(`/platform-plans${qs}`);
}

export async function getPlatformPlan(id: UUID): Promise<PlatformPlan> {
  return request<PlatformPlan>(`/platform-plans/${id}`);
}

export async function createPlatformPlan(data: Partial<PlatformPlan>): Promise<PlatformPlan> {
  return request<PlatformPlan>('/platform-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePlatformPlan(id: UUID, data: Partial<PlatformPlan>): Promise<PlatformPlan> {
  return request<PlatformPlan>(`/platform-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePlatformPlan(id: UUID): Promise<{ id: UUID; is_active: boolean }> {
  return request(`/platform-plans/${id}`, { method: 'DELETE' });
}

// ============================================================
// INSTITUTION PLANS (institutions sell to students)
// ============================================================

export async function getInstitutionPlans(instId: UUID, includeInactive = false): Promise<InstitutionPlan[]> {
  const qs = includeInactive ? '?include_inactive=true' : '';
  return request<InstitutionPlan[]>(`/institutions/${instId}/plans${qs}`);
}

export async function getInstitutionPlan(id: UUID): Promise<InstitutionPlan> {
  return request<InstitutionPlan>(`/institution-plans/${id}`);
}

export async function createInstitutionPlan(data: {
  institution_id: UUID;
  name: string;
  description?: string;
  price_cents?: number;
  billing_cycle?: string;
  is_default?: boolean;
}): Promise<InstitutionPlan> {
  return request<InstitutionPlan>('/institution-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInstitutionPlan(id: UUID, data: Partial<InstitutionPlan>): Promise<InstitutionPlan> {
  return request<InstitutionPlan>(`/institution-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteInstitutionPlan(id: UUID): Promise<{ id: UUID; is_active: boolean }> {
  return request(`/institution-plans/${id}`, { method: 'DELETE' });
}

export async function setDefaultInstitutionPlan(id: UUID): Promise<InstitutionPlan> {
  return request<InstitutionPlan>(`/institution-plans/${id}/set-default`, {
    method: 'PATCH',
  });
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export async function getInstitutionSubscription(instId: UUID): Promise<InstitutionSubscription | null> {
  return request<InstitutionSubscription | null>(`/institutions/${instId}/subscription`);
}

export async function getSubscription(id: UUID): Promise<InstitutionSubscription> {
  return request<InstitutionSubscription>(`/institution-subscriptions/${id}`);
}

export async function createSubscription(data: {
  institution_id: UUID;
  plan_id: UUID;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
}): Promise<InstitutionSubscription> {
  return request<InstitutionSubscription>('/institution-subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSubscription(id: UUID, data: Partial<InstitutionSubscription>): Promise<InstitutionSubscription> {
  return request<InstitutionSubscription>(`/institution-subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function cancelSubscription(id: UUID): Promise<{ id: UUID; status: string }> {
  return request(`/institution-subscriptions/${id}`, { method: 'DELETE' });
}

// ============================================================
// ADMIN SCOPES
// ============================================================

export async function getAdminScopes(membershipId: UUID): Promise<AdminScope[]> {
  return request<AdminScope[]>(`/admin-scopes/membership/${membershipId}`);
}

export async function getAdminScope(id: UUID): Promise<AdminScope> {
  return request<AdminScope>(`/admin-scopes/${id}`);
}

export async function getAllAdminScopes(): Promise<AdminScope[]> {
  return request<AdminScope[]>('/admin-scopes');
}

export async function getInstitutionAdminScopes(instId: UUID): Promise<AdminScope[]> {
  return request<AdminScope[]>(`/institutions/${instId}/admin-scopes`);
}

export async function createAdminScope(data: {
  membership_id: UUID;
  scope_type: 'full' | 'course' | 'semester' | 'section';
  scope_id?: UUID;
}): Promise<AdminScope> {
  return request<AdminScope>('/admin-scopes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminScope(id: UUID): Promise<{ id: UUID; deleted: boolean }> {
  return request(`/admin-scopes/${id}`, { method: 'DELETE' });
}

export async function bulkReplaceAdminScopes(
  membershipId: UUID,
  scopes: Array<{ scope_type: string; scope_id?: UUID }>
): Promise<AdminScope[]> {
  return request<AdminScope[]>(`/admin-scopes/membership/${membershipId}`, {
    method: 'PUT',
    body: JSON.stringify({ scopes }),
  });
}

// ============================================================
// ACCESS RULES
// ============================================================

export async function getPlanAccessRules(planId: UUID): Promise<PlanAccessRule[]> {
  return request<PlanAccessRule[]>(`/institution-plans/${planId}/access-rules`);
}

export async function createAccessRules(data: {
  plan_id: UUID;
  rules?: Array<{ scope_type: string; scope_id: UUID }>;
  scope_type?: string;
  scope_id?: UUID;
}): Promise<PlanAccessRule[]> {
  return request<PlanAccessRule[]>('/plan-access-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAccessRule(id: UUID): Promise<{ id: UUID; deleted: boolean }> {
  return request(`/plan-access-rules/${id}`, { method: 'DELETE' });
}

export async function bulkReplaceAccessRules(
  planId: UUID,
  rules: Array<{ scope_type: string; scope_id: UUID }>
): Promise<PlanAccessRule[]> {
  return request<PlanAccessRule[]>(`/institution-plans/${planId}/access-rules`, {
    method: 'PUT',
    body: JSON.stringify({ rules }),
  });
}

export async function checkAccess(
  userId: UUID,
  scopeType: string,
  scopeId: UUID,
  institutionId: UUID
): Promise<AccessCheckResult> {
  return request<AccessCheckResult>(
    `/check-access/${userId}/${scopeType}/${scopeId}?institution_id=${institutionId}`
  );
}

// ============================================================
// CONTENT — Courses (KV-based on real backend)
// ============================================================

export async function getContentHierarchy(): Promise<ContentHierarchy> {
  return request<ContentHierarchy>('/content/hierarchy');
}

export async function getCourses(institutionId?: UUID): Promise<Course[]> {
  const qs = institutionId ? `?institution_id=${institutionId}` : '';
  return request<Course[]>(`/courses${qs}`);
}

export async function createCourse(data: {
  name: string;
  institution_id: UUID;
  description?: string;
  color?: string;
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
// CONTENT — Semesters
// ============================================================

export async function getSemesters(courseId: UUID): Promise<Semester[]> {
  return request<Semester[]>(`/courses/${courseId}/semesters`);
}

export async function createSemester(courseId: UUID, data: { name: string; order_index?: number }): Promise<Semester> {
  return request<Semester>(`/courses/${courseId}/semesters`, {
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
// CONTENT — Sections
// ============================================================

export async function getSections(semesterId: UUID): Promise<Section[]> {
  return request<Section[]>(`/semesters/${semesterId}/sections`);
}

export async function createSection(semesterId: UUID, data: { name: string; order_index?: number }): Promise<Section> {
  return request<Section>(`/semesters/${semesterId}/sections`, {
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
// CONTENT — Topics
// ============================================================

export async function getTopics(sectionId: UUID): Promise<Topic[]> {
  return request<Topic[]>(`/sections/${sectionId}/topics`);
}

export async function createTopic(sectionId: UUID, data: { name: string; order_index?: number }): Promise<Topic> {
  return request<Topic>(`/sections/${sectionId}/topics`, {
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
// CONTENT — Summaries (content summaries, professor-authored)
// ============================================================

export async function getTopicSummaries(topicId: UUID): Promise<Summary[]> {
  return request<Summary[]>(`/topics/${topicId}/summaries`);
}

export async function createSummary(topicId: UUID, data: {
  institution_id?: UUID;
  title?: string;
  content_markdown: string;
  status?: SummaryStatus;
}): Promise<Summary> {
  return request<Summary>(`/topics/${topicId}/summaries`, {
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

// ============================================================
// CONTENT — Keywords
// ============================================================

export async function getKeywords(institutionId?: UUID): Promise<Keyword[]> {
  const qs = institutionId ? `?institution_id=${institutionId}` : '';
  return request<Keyword[]>(`/keywords${qs}`);
}

export async function createKeyword(data: {
  institution_id: UUID;
  term: string;
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

// ============================================================
// HEALTH CHECK
// ============================================================

export async function healthCheck(): Promise<{
  status: string;
  version: string;
  migration_status: string;
  sql_routes: string[];
  kv_routes: string[];
}> {
  return request('/health');
}

// ============================================================
// ADMIN — Student Management (SQL + KV hybrid)
// NOTE: routes-admin-students.tsx must be mounted in index.ts
// for these to work. Verify deployment status.
// ============================================================

export interface AdminStudentListItem {
  membership_id: UUID;
  user_id: UUID;
  institution_id: UUID;
  is_active: boolean;
  joined_at: ISODate;
  updated_at: ISODate;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  plan: { id: UUID; name: string; is_default?: boolean } | null;
  stats: {
    total_study_minutes: number;
    total_sessions: number;
    total_cards_reviewed: number;
    total_quizzes_completed: number;
    current_streak: number;
    last_study_date: string | null;
  } | null;
  strengths_count: number;
  weaknesses_count: number;
}

export interface AdminStudentDetail extends AdminStudentListItem {
  role: MembershipRole;
  stats: any;
  course_progress: any[];
  daily_activity: any[];
  learning_profile: any | null;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export async function getAdminStudents(
  institutionId: UUID,
  options?: { page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }
): Promise<PaginatedResponse<AdminStudentListItem[]>> {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.sort) params.set('sort', options.sort);
  if (options?.order) params.set('order', options.order);
  const qs = params.toString() ? `?${params}` : '';

  // This endpoint returns { success, data, pagination } — we need to handle it specially
  const url = `${REAL_BACKEND_URL}/admin/students/${institutionId}${qs}`;
  const token = getRealToken();
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new ApiError(
      body?.error?.message || `API error ${res.status}`,
      body?.error?.code || 'UNKNOWN',
      res.status
    );
  }
  return { data: body.data, pagination: body.pagination };
}

export async function searchAdminStudents(
  institutionId: UUID,
  query: string
): Promise<AdminStudentListItem[]> {
  return request<AdminStudentListItem[]>(
    `/admin/students/${institutionId}/search?q=${encodeURIComponent(query)}`
  );
}

export async function getAdminStudentDetail(
  institutionId: UUID,
  userId: UUID
): Promise<AdminStudentDetail> {
  return request<AdminStudentDetail>(`/admin/students/${institutionId}/${userId}`);
}

export async function toggleStudentStatus(
  memberId: UUID,
  isActive: boolean
): Promise<any> {
  return request(`/admin/students/${memberId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function changeStudentPlan(
  memberId: UUID,
  institutionPlanId: UUID | null
): Promise<any> {
  return request(`/admin/students/${memberId}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({ institution_plan_id: institutionPlanId }),
  });
}

// ============================================================
// FLASHCARDS — Professor Management (KV-based on real backend)
// ============================================================

export interface FlashcardCard {
  id: UUID;
  summary_id: UUID;
  keyword_id: UUID;
  subtopic_id?: UUID;
  institution_id?: UUID;
  front: string;
  back: string;
  image_url?: string | null;
  status: 'draft' | 'published' | 'active' | 'suspended' | 'deleted';
  source: 'ai' | 'manual' | 'imported' | 'professor';
  created_by?: string;
  created_at: ISODate;
}

export async function getFlashcardsBySummary(summaryId: UUID): Promise<FlashcardCard[]> {
  return request<FlashcardCard[]>(`/summaries/${summaryId}/flashcards`);
}

export async function getFlashcardsByKeyword(keywordId: UUID): Promise<FlashcardCard[]> {
  return request<FlashcardCard[]>(`/keywords/${keywordId}/flashcards`);
}

export async function getFlashcard(cardId: UUID): Promise<FlashcardCard> {
  return request<FlashcardCard>(`/flashcards/${cardId}`);
}

export async function createFlashcard(data: Partial<FlashcardCard>): Promise<FlashcardCard> {
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

// ============================================================
// REVIEWS & SPACED REPETITION (KV-based on real backend)
// ============================================================

export interface ReviewRequest {
  session_id: UUID;
  item_id: UUID;
  instrument_type: 'flashcard' | 'quiz';
  subtopic_id: UUID;
  keyword_id: UUID;
  grade: 1 | 2 | 3 | 4;
  response_time_ms?: number;
}

export interface ReviewResponse {
  review_log: any;
  updated_bkt: any;
  updated_card_fsrs: any | null;
  feedback: {
    delta_before: number;
    delta_after: number;
    color_before: string;
    color_after: string;
    mastery: number;
    stability: number | null;
    next_due: string | null;
  };
}

export async function submitReview(data: ReviewRequest): Promise<ReviewResponse> {
  return request<ReviewResponse>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getBktStates(options?: {
  subtopic_id?: UUID;
  keyword_id?: UUID;
}): Promise<any> {
  const params = new URLSearchParams();
  if (options?.subtopic_id) params.set('subtopic_id', options.subtopic_id);
  if (options?.keyword_id) params.set('keyword_id', options.keyword_id);
  const qs = params.toString() ? `?${params}` : '';
  return request(`/bkt${qs}`);
}

export async function getFsrsStates(cardId?: UUID): Promise<any> {
  const qs = cardId ? `?card_id=${cardId}` : '';
  return request(`/fsrs${qs}`);
}