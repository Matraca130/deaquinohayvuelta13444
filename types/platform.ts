// ============================================================
// Axon — Platform Types (mirrors shared-types.ts from real backend)
// Source of truth: supabase/functions/server/shared-types.ts
// ============================================================

export type UUID = string;
export type ISODate = string;
export type DateOnly = string;

export type MembershipRole = 'owner' | 'admin' | 'professor' | 'student';
export type SummaryStatus = 'draft' | 'published' | 'rejected';
export type FlashcardStatus = 'active' | 'suspended' | 'deleted';
export type FlashcardSource = 'ai' | 'manual' | 'imported';
export type QuizType = 'mcq' | 'true_false' | 'fill_blank' | 'open';
export type QuizStatus = 'active' | 'suspended' | 'deleted';
export type BktColor = 'red' | 'orange' | 'yellow' | 'green';
export type FsrsState = 0 | 1 | 2 | 3;
export type FsrsGrade = 1 | 2 | 3 | 4;
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

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
  owner?: {
    id: UUID;
    email: string;
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface InstitutionDashboardStats {
  institutionName: string;
  hasInstitution: boolean;
  totalMembers: number;
  totalPlans: number;
  activeStudents: number;
  inactiveMembers: number;
  membersByRole: Record<string, number>;
  subscription: {
    id: UUID;
    status: string;
    plan: { name: string; slug: string } | null;
  } | null;
}

// ── Memberships ───────────────────────────────────────────

export interface MemberListItem {
  id: UUID;
  user_id: UUID;
  institution_id: UUID;
  role: MembershipRole;
  institution_plan_id: UUID | null;
  is_active: boolean;
  created_at: ISODate;
  updated_at: ISODate;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  plan: {
    id: UUID;
    name: string;
    description: string | null;
    price_cents: number;
    billing_cycle?: string;
    is_default?: boolean;
  } | null;
}

export interface CreateMemberPayload {
  user_id?: UUID;
  email?: string;
  name?: string;
  institution_id: UUID;
  role: MembershipRole;
  institution_plan_id?: UUID;
}

// ── Plans ─────────────────────────────────────────────────

export interface PlatformPlan {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  billing_cycle: string;
  max_students: number | null;
  max_courses: number | null;
  max_storage_mb: number | null;
  features: Record<string, any>;
  is_active: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface InstitutionPlan {
  id: UUID;
  institution_id: UUID;
  name: string;
  description: string | null;
  price_cents: number;
  billing_cycle: string;
  is_default: boolean;
  is_active: boolean;
  member_count?: number;
  created_at: ISODate;
  updated_at: ISODate;
  access_rules?: PlanAccessRule[];
}

// ── Subscriptions ─────────────────────────────────────────

export interface InstitutionSubscription {
  id: UUID;
  institution_id: UUID;
  plan_id: UUID;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  current_period_start: ISODate;
  current_period_end: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
  plan?: PlatformPlan;
}

// ── Admin Scopes ──────────────────────────────────────────

export interface AdminScope {
  id: UUID;
  membership_id: UUID;
  scope_type: 'full' | 'course' | 'semester' | 'section';
  scope_id: UUID | null;
  created_at: ISODate;
  membership?: {
    id: UUID;
    user_id: UUID;
    institution_id: UUID;
    role: MembershipRole;
  };
}

// ── Access Rules ──────────────────────────────────────────

export interface PlanAccessRule {
  id: UUID;
  plan_id: UUID;
  scope_type: 'course' | 'semester' | 'section' | 'topic' | 'summary';
  scope_id: UUID;
  created_at: ISODate;
}

export interface AccessCheckResult {
  has_access: boolean;
  reason: string;
  plan_id?: UUID;
}

// ── Content Hierarchy ─────────────────────────────────────

export interface Course {
  id: UUID;
  institution_id: UUID;
  name: string;
  description?: string | null;
  color: string;
  sort_order?: number;
  created_at: ISODate;
  updated_at: ISODate;
  created_by?: string;
}

export interface Semester {
  id: UUID;
  course_id: UUID;
  name: string;
  order_index: number;
  created_at?: ISODate;
}

export interface Section {
  id: UUID;
  semester_id: UUID;
  name: string;
  image_url?: string | null;
  order_index: number;
  created_at?: ISODate;
}

export interface Topic {
  id: UUID;
  section_id: UUID;
  name: string;
  order_index: number;
  created_at?: ISODate;
}

export interface Summary {
  id: UUID;
  topic_id: UUID;
  institution_id?: UUID;
  course_id?: UUID;
  title?: string | null;
  content_markdown: string;
  status: SummaryStatus;
  created_by?: string;
  version?: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Keyword {
  id: UUID;
  institution_id: UUID;
  term: string;
  definition: string | null;
  priority: number;
  status?: string;
  source?: string;
  created_by?: string;
  created_at: ISODate;
  updated_at: ISODate;
}

// ── Content Hierarchy (full tree) ─────────────────────────

export interface ContentHierarchy {
  courses: Course[];
  semesters: Semester[];
  sections: Section[];
  topics: Topic[];
  summaries: Summary[];
  keywords: Keyword[];
}

// ── API Response Wrappers ─────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
