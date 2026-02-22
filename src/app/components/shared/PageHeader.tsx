// ============================================================
// Axon — PageHeader (standardized page header for all role pages)
//
// IMPORT: import { PageHeader } from '@/app/components/shared/PageHeader';
//
// Usage:
//   <PageHeader
//     icon={<Users size={22} />}
//     title="Miembros"
//     subtitle="Administra los miembros de tu institucion"
//     accent="amber"
//     actions={<Button>Invitar</Button>}
//   />
//
// Every page in owner/admin/professor should use this for
// consistent look and spacing.
// ============================================================

import React from 'react';
import { FadeIn } from './FadeIn';

interface PageHeaderProps {
  /** Icon component (e.g., <Users size={22} />) */
  icon: React.ReactNode;
  /** Page title */
  title: string;
  /** Subtitle / description (optional) */
  subtitle?: string;
  /** Accent color: 'amber' | 'blue' | 'purple' | 'teal' (default: 'blue') */
  accent?: 'amber' | 'blue' | 'purple' | 'teal';
  /** Right-side actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Extra content below title (badges, stats, etc.) */
  children?: React.ReactNode;
}

const ACCENT_CLASSES: Record<string, { iconBg: string; iconText: string }> = {
  amber:  { iconBg: 'bg-amber-50',  iconText: 'text-amber-500' },
  blue:   { iconBg: 'bg-blue-50',   iconText: 'text-blue-500' },
  purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-500' },
  teal:   { iconBg: 'bg-teal-50',   iconText: 'text-teal-500' },
};

export function PageHeader({
  icon,
  title,
  subtitle,
  accent = 'blue',
  actions,
  children,
}: PageHeaderProps) {
  const c = ACCENT_CLASSES[accent] || ACCENT_CLASSES.blue;

  return (
    <FadeIn>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-xl ${c.iconBg} ${c.iconText} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </FadeIn>
  );
}
