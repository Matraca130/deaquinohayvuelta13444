/**
 * @module @axon/design-system/layout
 * @version 1.0.0
 *
 * Dimensiones y espaciado del layout: sidebar, header, content area,
 * grids responsivos y panel lateral.
 *
 * Standalone:  import { layout } from '@/app/design-system/layout';
 * Barrel:      import { layout } from '@/app/design-system';
 */

// ─────────────────────────────────────────────
// LAYOUT TOKENS
// ─────────────────────────────────────────────

export const layout = {
  sidebar: {
    width: 260,
    collapsedWidth: 0,
  },
  header: {
    height: 48, // h-12 = 3rem = 48px
  },
  content: {
    paddingX:  'px-6',
    paddingY:  'py-6',
    gap:       'gap-6',
    maxWidth:  'max-w-7xl',
  },
  grid: {
    stats:   'grid grid-cols-2 lg:grid-cols-4 gap-4',
    courses: 'grid grid-cols-1 lg:grid-cols-2 gap-5',
    kpi:     'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  },
  rightPanel: {
    width: 'w-[360px]',
  },
} as const;
