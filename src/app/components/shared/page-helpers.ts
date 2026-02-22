// ============================================================
// Axon — Page Helpers (shared utility functions)
//
// IMPORT: import { getInitials, formatDate, formatRelative } from '@/app/components/shared/page-helpers';
//
// Previously duplicated across OwnerDashboardPage, OwnerMembersPage.
// Centralizing here so parallel devs don't re-implement.
// ============================================================

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Extract initials from a name string (e.g., "Juan Perez" -> "JP")
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Format an ISO date string to a human-readable date (e.g., "5 ene 2026")
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '\u2014';
  try {
    return format(parseISO(iso), 'd MMM yyyy', { locale: es });
  } catch {
    return '\u2014';
  }
}

/**
 * Format an ISO date string to a relative string (e.g., "hace 2 dias")
 */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '\u2014';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es });
  } catch {
    return '\u2014';
  }
}

/**
 * Format a price in cents to a display string.
 * Supports MXN (default, for owner/admin/professor area) and BRL.
 * Returns 'Gratis' for 0 cents.
 */
export function formatPrice(cents: number, currency: 'MXN' | 'BRL' = 'MXN'): string {
  if (cents === 0) return 'Gratis';
  const value = cents / 100;
  if (currency === 'BRL') {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Truncate a string to maxLen characters with ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '\u2026';
}

/**
 * Search match: check if a member-like object matches a search query.
 * Searches name and email fields.
 */
export function matchesSearch(
  item: { name?: string | null; email?: string | null },
  query: string
): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (item.name?.toLowerCase().includes(q) ?? false) ||
    (item.email?.toLowerCase().includes(q) ?? false)
  );
}