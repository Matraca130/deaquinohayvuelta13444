/**
 * @module @axon/design-system/brand
 * @version 1.0.0
 *
 * Identidad de marca: nombre, tagline, logo (tamanhos y temas).
 *
 * Standalone:  import { brand, LogoSize, LogoTheme } from '@/app/design-system/brand';
 * Barrel:      import { brand } from '@/app/design-system';
 */

// ─────────────────────────────────────────────
// BRAND TOKENS
// ─────────────────────────────────────────────

export const brand = {
  name: 'AXON',
  fullName: 'AxonPlataforma',
  version: '1.0.0',
  tagline: 'Plataforma de Estudos Medicos',
  logo: {
    sizes: {
      xs:        { svg: 'w-3 h-[14px]', text: 'text-[9px] tracking-[0.25em]', gap: 'gap-1' },
      sm:        { svg: 'w-[14px] h-4',  text: 'text-[10px] tracking-[0.3em]', gap: 'gap-1.5' },
      md:        { svg: 'w-[18px] h-[22px]', text: 'text-[clamp(1rem,2vw,1.3rem)] tracking-[0.2em]', gap: 'gap-2' },
      lg:        { svg: 'w-6 h-7',       text: 'text-[clamp(1.2rem,2.5vw,1.8rem)] tracking-[0.25em]', gap: 'gap-2.5' },
      watermark: { svg: 'w-14 h-16',     text: 'text-[72px] tracking-[0.15em]', gap: 'gap-3' },
    },
    themes: {
      light:    { svgColor: 'text-white',    textColor: 'text-white/90' },
      dark:     { svgColor: 'text-gray-800', textColor: 'text-gray-800' },
      gradient: { svgColor: 'text-teal-500', textColor: 'text-teal-600' },
    },
  },
} as const;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type LogoSize = keyof typeof brand.logo.sizes;
export type LogoTheme = keyof typeof brand.logo.themes;
