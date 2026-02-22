/**
 * @module @axon/design-system/typography
 * @version 1.0.0
 *
 * Sistema tipografico: familias (Georgia heading, Inter body),
 * reglas de uso por contexto, y helpers de inline style.
 *
 * Standalone:  import { typography, headingStyle, bodyStyle } from '@/app/design-system/typography';
 * Barrel:      import { headingStyle } from '@/app/design-system';
 */

import type { CSSProperties } from 'react';

// ─────────────────────────────────────────────
// TYPOGRAPHY TOKENS
// ─────────────────────────────────────────────

export const typography = {
  /** Familias tipograficas */
  families: {
    heading: 'Georgia, serif',
    body:    '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: '"Space Grotesk", sans-serif',
    mono:    '"JetBrains Mono", monospace',
  },

  /** Google Fonts import URLs */
  imports: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
  ],

  /** Tailwind CSS variable name */
  cssVariable: '--font-sans',

  /** Regras de uso */
  rules: {
    pageTitle:     { family: 'heading' as const, style: "fontFamily: 'Georgia, serif'", size: 'text-[clamp(2rem,4vw,3rem)]', weight: 'font-bold', tracking: 'tracking-tight' },
    sectionTitle:  { family: 'heading' as const, style: "fontFamily: 'Georgia, serif'", size: 'text-lg',  weight: 'font-semibold' },
    sectionLabel:  { family: 'heading' as const, style: "fontFamily: 'Georgia, serif'", size: 'text-sm',  weight: 'font-semibold', extra: 'uppercase tracking-wide' },
    cardTitle:     { family: 'heading' as const, style: "fontFamily: 'Georgia, serif'", size: 'default',  weight: 'font-bold' },
    body:          { family: 'body' as const,    style: "fontFamily: 'Inter'",          size: 'text-sm',  weight: 'font-medium' },
    caption:       { family: 'body' as const,    style: "fontFamily: 'Inter'",          size: 'text-xs',  weight: 'font-medium' },
    label:         { family: 'body' as const,    style: "fontFamily: 'Inter'",          size: 'text-[10px]', weight: 'font-medium', extra: 'uppercase tracking-wider' },
  },
} as const;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Returns the inline style object for heading typography (Georgia, serif) */
export const headingStyle: CSSProperties = { fontFamily: typography.families.heading };

/** Returns the inline style object for body typography (Inter) */
export const bodyStyle: CSSProperties = { fontFamily: typography.families.body };
