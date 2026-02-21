// ============================================================
// Axon — Page State Components (Loading, Empty, Error)
//
// IMPORT:
//   import { LoadingPage, EmptyState, ErrorState } from '@/app/components/shared/PageStates';
//
// Every page should use these for consistent UX:
//
//   if (loading) return <LoadingPage />;
//   if (error)   return <ErrorState message={error} onRetry={refresh} />;
//   if (!data.length) return <EmptyState ... />;
// ============================================================

import React from 'react';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Button } from '@/app/components/ui/button';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { FadeIn } from './FadeIn';

// ── LoadingPage ───────────────────────────────────────────

interface LoadingPageProps {
  /** Number of skeleton rows (default: 4) */
  rows?: number;
  /** Show KPI card skeletons (default: true) */
  showCards?: boolean;
}

export function LoadingPage({ rows = 4, showCards = true }: LoadingPageProps) {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start gap-3.5">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      {showCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {/* Table/content skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────

interface EmptyStateProps {
  /** Icon component (default: <Inbox />) */
  icon?: React.ReactNode;
  /** Main message */
  title: string;
  /** Secondary description */
  description?: string;
  /** CTA button label */
  actionLabel?: string;
  /** CTA button callback */
  onAction?: () => void;
  /** Accent color for icon bg */
  accent?: 'amber' | 'blue' | 'purple' | 'teal';
}

const EMPTY_ACCENT: Record<string, string> = {
  amber:  'bg-amber-50 text-amber-400',
  blue:   'bg-blue-50 text-blue-400',
  purple: 'bg-purple-50 text-purple-400',
  teal:   'bg-teal-50 text-teal-400',
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  accent = 'blue',
}: EmptyStateProps) {
  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${EMPTY_ACCENT[accent]}`}>
          {icon || <Inbox size={24} />}
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        )}
      </div>
    </FadeIn>
  );
}

// ── ErrorState ────────────────────────────────────────────

interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Retry callback */
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <FadeIn>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-800 mb-0.5">
              Error al cargar datos
            </h3>
            <p className="text-sm text-red-600 break-words">{message}</p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-red-200 text-red-700 hover:bg-red-100 shrink-0"
            >
              <RefreshCw size={14} className="mr-1.5" />
              Reintentar
            </Button>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
