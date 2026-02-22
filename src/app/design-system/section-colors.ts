/**
 * @module @axon/design-system/section-colors
 * @version 1.0.0
 *
 * Paletas de acento para secciones de contenido:
 * teal-only (estandar), multi-color (por seccion), y por disciplina.
 *
 * Standalone:  import { sectionColors } from '@/app/design-system/section-colors';
 * Barrel:      import { sectionColors } from '@/app/design-system';
 */

// ─────────────────────────────────────────────
// SECTION ACCENT COLORS
// ─────────────────────────────────────────────

export const sectionColors = {
  /** Teal-only palette (ThreeDView, standardized) */
  teal: [
    { bg: 'from-teal-500 to-teal-600', light: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', dot: 'bg-teal-500', badge: 'bg-teal-100 text-teal-700' },
  ],

  /** Multi-color palette (FlashcardView, per-section) */
  multi: [
    { bg: 'from-teal-500 to-teal-600',    glow: 'shadow-teal-500/15',    light: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-200',    ring: 'ring-teal-500/20',    dot: 'bg-teal-500' },
    { bg: 'from-emerald-500 to-teal-600',  glow: 'shadow-emerald-500/15', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: 'ring-emerald-500/20', dot: 'bg-emerald-500' },
    { bg: 'from-sky-500 to-cyan-600',      glow: 'shadow-sky-500/15',     light: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-200',     ring: 'ring-sky-500/20',     dot: 'bg-sky-500' },
    { bg: 'from-amber-500 to-orange-600',  glow: 'shadow-amber-500/15',   light: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   ring: 'ring-amber-500/20',   dot: 'bg-amber-500' },
  ],

  /** Disciplina-specific colors (WelcomeView course data) */
  disciplines: {
    microbiology: { icon: '\u{1F9A0}', iconBg: 'bg-purple-100', progressColor: 'bg-purple-500', percentColor: 'text-purple-600' },
    cellBiology:  { icon: '\u{1F33F}', iconBg: 'bg-teal-100',   progressColor: 'bg-teal-500',   percentColor: 'text-teal-600' },
    histology:    { icon: '\u{1F52C}', iconBg: 'bg-teal-100',   progressColor: 'bg-teal-500',   percentColor: 'text-teal-600' },
    anatomy:      { icon: '\u{2764}\u{FE0F}', iconBg: 'bg-pink-100',   progressColor: 'bg-pink-500',   percentColor: 'text-pink-600' },
  },
} as const;
