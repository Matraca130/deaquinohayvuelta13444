/**
 * @module @axon/design-system/shadows
 * @version 1.0.0
 *
 * Niveles de sombra: cards, hovers, charts, dropdowns, tooltips.
 * Sin glassmorphism — siempre sombras suaves y solidas.
 *
 * Standalone:  import { shadows } from '@/app/design-system/shadows';
 * Barrel:      import { shadows } from '@/app/design-system';
 */

// ─────────────────────────────────────────────
// SHADOW TOKENS
// ─────────────────────────────────────────────

export const shadows = {
  card:        'shadow-sm',
  cardHover:   'shadow-md',
  chart:       'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
  performance: 'shadow-lg',
  dropdown:    'shadow-2xl',
  tooltip:     'shadow-[0_4px_12px_rgba(0,0,0,0.1)]',
} as const;
