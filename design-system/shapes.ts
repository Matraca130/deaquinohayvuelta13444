/**
 * @module @axon/design-system/shapes
 * @version 1.0.0
 *
 * Border radius para cada tipo de elemento:
 * cards, botones (pill/action/filter), iconos, avatars, inputs, badges.
 *
 * Standalone:  import { shapes } from '@/app/design-system/shapes';
 * Barrel:      import { shapes } from '@/app/design-system';
 */

// ─────────────────────────────────────────────
// SHAPE TOKENS
// ─────────────────────────────────────────────

export const shapes = {
  card:          'rounded-2xl',     // 16px — todos los cards
  button: {
    pill:        'rounded-full',    // botones de navegacion principales
    action:      'rounded-xl',      // botones de accion dentro de cards
    filter:      'rounded-lg',      // botones de filtro temporal
    filterAlt:   'rounded-md',      // filtros menores / tabs
  },
  icon:          'rounded-xl',      // contenedores de icono
  avatar:        'rounded-full',
  progress:      'rounded-full',    // barras de progresso
  input:         'rounded-xl',
  badge:         'rounded-full',
  sidebar: {
    navItem:     'rounded-xl',
    dropdown:    'rounded-2xl',
  },
} as const;
