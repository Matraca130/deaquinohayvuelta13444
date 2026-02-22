/**
 * @module @axon/design-system/colors
 * @version 1.0.0
 *
 * Paleta completa de colores: primarios (teal), superficies, bordes,
 * texto, semanticos, mastery, ratings, acentos de disciplina y charts.
 *
 * Standalone:  import { colors } from '@/app/design-system/colors';
 * Barrel:      import { colors } from '@/app/design-system';
 */

// ─────────────────────────────────────────────
// COLOR TOKENS
// ─────────────────────────────────────────────

export const colors = {
  /** Cor primaria de interacao — usada em botoes, links, icones ativos */
  primary: {
    50:  '#f0fdfa',   // bg-teal-50  — fundo de icones
    100: '#ccfbf1',   // bg-teal-100
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',   // bg-teal-500 — botoes, badges, progresso
    600: '#0d9488',   // bg-teal-600 — botoes hover, texto ativo
    700: '#0f766e',   // bg-teal-700 — botoes pressed
    800: '#115e59',
    900: '#134e4a',
  },

  /** Sidebar e header escuro */
  dark: {
    navBar:       '#1e293b',   // Header top bar
    sidebarBase:  '#1c1c1e',   // Sidebar outer shell
    sidebarBody:  '#2d3e50',   // Sidebar content area
    cardDark:     '#2c3e50',   // Performance card, filter active
  },

  /** Backgrounds de pagina */
  surface: {
    page:       '#f9fafb',     // bg-gray-50  — fundo geral
    dashboard:  '#f5f2ea',     // fundo bege do dashboard
    card:       '#ffffff',     // bg-white — cards
    hover:      '#f3f4f6',     // bg-gray-100 — hover states
  },

  /** Bordas e divisores */
  border: {
    card:     '#e5e7eb',       // border-gray-200
    subtle:   'rgba(229,231,235,0.6)', // border-gray-200/60
    dark:     'rgba(255,255,255,0.1)', // border overlay on dark
    darkAlt:  'rgba(255,255,255,0.05)',
  },

  /** Texto */
  text: {
    primary:   '#111827',      // text-gray-900
    secondary: '#6b7280',      // text-gray-500
    tertiary:  '#9ca3af',      // text-gray-400
    disabled:  '#d1d5db',      // text-gray-300
    inverse:   '#ffffff',      // text-white
  },

  /** Semantic / status */
  semantic: {
    success:  '#10b981',       // emerald-500
    warning:  '#f59e0b',       // amber-500
    error:    '#ef4444',       // red-500
    info:     '#06b6d4',       // cyan-500
  },

  /** Mastery / spaced repetition levels */
  mastery: {
    notStarted: '#d1d5db',     // gray-300
    learning:   '#fbbf24',     // yellow-400
    reviewing:  '#14b8a6',     // teal-500
    mastered:   '#0d9488',     // teal-600
  },

  /** Rating scale (flashcard self-assessment) */
  ratings: {
    1: '#f43f5e',  // rose-500     — Nao sei
    2: '#f97316',  // orange-500   — Dificil
    3: '#facc15',  // yellow-400   — Medio
    4: '#84cc16',  // lime-500     — Facil
    5: '#10b981',  // emerald-500  — Perfeito
  } as Record<number, string>,

  /** Cores de acento por disciplina (bg-*) */
  courseAccents: {
    anatomy:   { bg: 'bg-rose-400',   text: 'text-rose-400' },
    histology: { bg: 'bg-indigo-500', text: 'text-indigo-500' },
  } as Record<string, { bg: string; text: string }>,

  /** Chart palette */
  chart: {
    flashcards: '#14b8a6',     // teal-500
    videos:     '#06b6d4',     // cyan-500
    bar:        '#0d9488',     // teal-600
    grid:       '#f3f4f6',     // gray-100
  },
} as const;
