// ============================================================
// Axon — Role Helpers (shared constants for all role-based pages)
//
// IMPORT: import { ROLE_CONFIG, ROLE_FILTERS, getRoleBadgeClasses, ... } from '@/app/components/shared/role-helpers';
//
// Previously duplicated across OwnerDashboardPage, OwnerMembersPage, etc.
// Centralizing here so parallel devs don't copy-paste.
// ============================================================

import type { MembershipRole } from '@/app/types/platform';

// ── Role visual config ────────────────────────────────────

export interface RoleVisual {
  label: string;
  labelPlural: string;
  color: string;          // hex for charts
  badgeClass: string;     // Tailwind classes for Badge component
  iconBg: string;         // icon badge background
}

export const ROLE_CONFIG: Record<MembershipRole, RoleVisual> = {
  owner: {
    label: 'Owner',
    labelPlural: 'Propietarios',
    color: '#f59e0b',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-500',
  },
  admin: {
    label: 'Admin',
    labelPlural: 'Administradores',
    color: '#3b82f6',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-50 text-blue-500',
  },
  professor: {
    label: 'Profesor',
    labelPlural: 'Profesores',
    color: '#8b5cf6',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-50 text-purple-500',
  },
  student: {
    label: 'Estudiante',
    labelPlural: 'Estudiantes',
    color: '#14b8a6',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    iconBg: 'bg-teal-50 text-teal-500',
  },
};

// ── Role filter options (for Select dropdowns) ────────────

export type RoleFilter = MembershipRole | 'all';

export const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all',       label: 'Todos' },
  { value: 'owner',     label: 'Owners' },
  { value: 'admin',     label: 'Admins' },
  { value: 'professor', label: 'Profesores' },
  { value: 'student',   label: 'Estudiantes' },
];

// Roles that owner can assign (not owner itself)
export const ASSIGNABLE_ROLES: MembershipRole[] = ['admin', 'professor', 'student'];

// ── Subscription status config ────────────────────────────

export interface StatusVisual {
  label: string;
  className: string;
}

export const SUBSCRIPTION_STATUS: Record<string, StatusVisual> = {
  active:   { label: 'Activa',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  trialing: { label: 'Prueba',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  past_due: { label: 'Vencida',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
  canceled: { label: 'Cancelada', className: 'bg-red-50 text-red-700 border-red-200' },
};

// ── Accent colors by role area ────────────────────────────

export const ACCENT_BY_AREA: Record<string, string> = {
  owner: 'amber',
  admin: 'blue',
  professor: 'purple',
  student: 'teal',
};
