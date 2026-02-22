// ============================================================
// Axon — Platform Types v4.4 (FOCUSED)
//
// SCOPE: Professor summary editor + Student summary interaction
// Matches the real backend's Postgres schema for these entities.
// ============================================================

export type UUID = string;
export type ISODate = string;

export type MembershipRole = 'owner' | 'admin' | 'professor' | 'student';
export type SummaryStatus = 'draft' | 'published' | 'rejected';

// ── Institutions ──────────────────────────────────────────

export interface Institution {
  id: UUID;
  name: string;
  slug: string;
  logo_url?: string | null;
  owner_id?: UUID;
  is_active?: boolean;
  settings?: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

// ── Content Hierarchy ─────────────────────────────────────

export interface Course {
  id: UUID;
  institution_id: UUID;
  name: string;
  description?: string | null;
  color?: string;
  order_index?: number;
  is_active?: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Semester {
  id: UUID;
  course_id: UUID;
  name: string;
  order_index: number;
  is_active?: boolean;
  created_at?: ISODate;
}

export interface Section {
  id: UUID;
  semester_id: UUID;
  name: string;
  order_index: number;
  is_active?: boolean;
  created_at?: ISODate;
}

export interface Topic {
  id: UUID;
  section_id: UUID;
  name: string;
  order_index: number;
  is_active?: boolean;
  created_at?: ISODate;
}

// ── Summary & sub-entities ────────────────────────────────

export interface Summary {
  id: UUID;
  topic_id: UUID;
  title?: string | null;
  content_markdown?: string;
  status: SummaryStatus | string;
  order_index?: number;
  is_active?: boolean;
  version?: number;
  deleted_at?: ISODate | null;
  created_by?: string;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Keyword {
  id: UUID;
  summary_id: UUID;
  name: string;
  definition?: string | null;
  priority?: number;
  is_active?: boolean;
  deleted_at?: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
}

// ── Chunks ────────────────────────────────────────────────

export interface Chunk {
  id: UUID;
  summary_id: UUID;
  content: string;
  order_index: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ── Subtopics ─────────────────────────────────────────────

export interface Subtopic {
  id: UUID;
  keyword_id: UUID;
  name: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Keyword Connections ───────────────────────────────────

export interface KeywordConnection {
  id: UUID;
  keyword_a_id: UUID;
  keyword_b_id: UUID;
  relationship?: string;
  created_at: string;
}

// ── Professor Notes on Keywords ───────────────────────────

export interface KwProfNote {
  id: UUID;
  keyword_id: UUID;
  user_id: UUID;
  note: string;
  created_at: string;
  updated_at: string;
}

// ── Flashcards ────────────────────────────────────────────

export interface FlashcardCard {
  id: UUID;
  summary_id: UUID;
  keyword_id: UUID;
  front: string;
  back: string;
  source?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Quiz Questions ────────────────────────────────────────

export interface QuizQuestion {
  id: UUID;
  summary_id: UUID;
  keyword_id: UUID;
  question_type: string;
  question: string;
  correct_answer: string;
  options?: any;
  explanation?: string;
  difficulty?: string;
  source?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Videos ────────────────────────────────────────────────

export interface Video {
  id: UUID;
  summary_id: UUID;
  title: string;
  url: string;
  platform?: string;
  duration_seconds?: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Student Notes on Keywords ─────────────────────────────

export interface KwStudentNote {
  id: UUID;
  keyword_id: UUID;
  user_id: UUID;
  note: string;
  created_at: string;
  updated_at: string;
}

// ── Text Annotations ──────────────────────────────────────

export interface PlatformTextAnnotation {
  id: UUID;
  summary_id: UUID;
  user_id: UUID;
  start_offset: number;
  end_offset: number;
  color?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

// ── Video Notes ───────────────────────────────────────────

export interface VideoNote {
  id: UUID;
  video_id: UUID;
  user_id: UUID;
  timestamp_seconds?: number;
  note: string;
  created_at: string;
  updated_at: string;
}

// ── Reading State ─────────────────────────────────────────

export interface ReadingState {
  id?: UUID;
  summary_id: UUID;
  user_id?: UUID;
  scroll_position?: number;
  time_spent_seconds?: number;
  completed?: boolean;
  last_read_at?: string;
}