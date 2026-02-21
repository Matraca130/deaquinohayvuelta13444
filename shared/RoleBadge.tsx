// ============================================================
// Axon — RoleBadge (displays a role with icon and color)
//
// IMPORT: import { RoleBadge } from '@/app/components/shared/RoleBadge';
//
// Usage:
//   <RoleBadge role="admin" />
//   <RoleBadge role="professor" size="sm" />
// ============================================================

import React from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Crown, Shield, BookOpen, GraduationCap } from 'lucide-react';
import { ROLE_CONFIG } from './role-helpers';
import type { MembershipRole } from '@/app/types/platform';

const ROLE_ICONS: Record<MembershipRole, React.ReactNode> = {
  owner:     <Crown size={12} />,
  admin:     <Shield size={12} />,
  professor: <BookOpen size={12} />,
  student:   <GraduationCap size={12} />,
};

interface RoleBadgeProps {
  role: MembershipRole;
  /** 'sm' uses smaller text, 'md' is default */
  size?: 'sm' | 'md';
  className?: string;
}

export function RoleBadge({ role, size = 'md', className = '' }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 ${config.badgeClass} ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
      } ${className}`}
    >
      {ROLE_ICONS[role]}
      {config.label}
    </Badge>
  );
}

// ── StatusBadge (active/inactive) ─────────────────────────

interface StatusBadgeProps {
  active: boolean;
  className?: string;
}

export function StatusBadge({ active, className = '' }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${
        active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-gray-50 text-gray-500 border-gray-200'
      } ${className}`}
    >
      {active ? 'Activo' : 'Inactivo'}
    </Badge>
  );
}
