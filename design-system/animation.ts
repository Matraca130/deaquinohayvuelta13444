/**
 * @module @axon/design-system/animation
 * @version 1.0.0
 *
 * Presets de animacion para Motion (ex Framer Motion):
 * transiciones de pagina, entrada de cards, progress bars,
 * sidebar toggle y dropdowns.
 *
 * Standalone:  import { animation } from '@/app/design-system/animation';
 * Barrel:      import { animation } from '@/app/design-system';
 */

// ─────────────────────────────────────────────
// ANIMATION TOKENS
// ─────────────────────────────────────────────

export const animation = {
  pageTransition: {
    initial:  { opacity: 0, y: 10 },
    animate:  { opacity: 1, y: 0 },
    duration: 0.2,
  },
  cardEntrance: {
    initial:  { opacity: 0, y: 10 },
    animate:  { opacity: 1, y: 0 },
    staggerDelay: 0.1,
  },
  progressBar: {
    initial:  { width: 0 },
    duration: 1,
  },
  sidebar: {
    initial: { width: 260 },
    collapsed: { width: 0 },
  },
  dropdown: {
    initial:  { opacity: 0, y: 8, scale: 0.96 },
    animate:  { opacity: 1, y: 0, scale: 1 },
    exit:     { opacity: 0, y: 8, scale: 0.96 },
    duration: 0.15,
    ease:     'easeOut',
  },
} as const;
