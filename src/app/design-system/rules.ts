/**
 * @module @axon/design-system/rules
 * @version 1.0.0
 *
 * Reglas de diseno obligatorias y prohibidas.
 * Referencia para desarrolladores — no contiene logica,
 * solo documentacion ejecutable de convenciones visuales.
 *
 * Standalone:  import { designRules } from '@/app/design-system/rules';
 * Barrel:      import { designRules } from '@/app/design-system';
 */

// ─────────────────────────────────────────────
// DESIGN RULES
// ─────────────────────────────────────────────

export const designRules = {
  /** OBRIGATORIO */
  mandatory: [
    'Titulos SEMPRE em Georgia, serif (fontFamily inline style)',
    'Corpo SEMPRE em Inter (font-sans via Tailwind)',
    'Cor primaria de interacao: teal (#14b8a6)',
    'Botoes solidos: pill-shaped com rounded-full',
    'Cards brancos: rounded-2xl com shadow-sm',
    'Icones: bg-teal-50 + text-teal-500 (sem gradientes)',
    'Filtros ativos: bg-teal-500 text-white',
  ],

  /** PROIBIDO */
  forbidden: [
    'Glassmorphism (backdrop-blur em cards de conteudo)',
    'Gradientes em botoes ou icones',
    'Cores azul/violeta em elementos interativos (substituir por teal)',
    'bg-blue-*, bg-violet-*, bg-purple-* em botoes ou badges de acao',
    'Font-size via Tailwind classes (text-2xl, etc.) — usar clamp() ou tokens',
  ],

  /** Arquivo de componentes */
  fileStructure: {
    shared:       '/src/app/components/shared/',
    layout:       '/src/app/components/layout/',
    content:      '/src/app/components/content/',
    ai:           '/src/app/components/ai/',
    ui:           '/src/app/components/ui/',
    context:      '/src/app/context/',
    data:         '/src/app/data/',
    styles:       '/src/styles/',
    designSystem: '/src/app/design-system/',
  },
} as const;
