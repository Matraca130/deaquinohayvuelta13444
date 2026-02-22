// Images that appear alongside study content sections in summaries
// Maps topicId → sectionTitle → image data

export interface SectionImage {
  url: string;
  caption: string;
  alt: string;
  credit?: string;
}

export const SECTION_IMAGES: Record<string, Record<string, SectionImage>> = {
  // ═══ SHOULDER (Ombro e Axila) ═══
  shoulder: {
    'Introdução': {
      url: 'https://images.unsplash.com/photo-1763198302535-265c44183bcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG91bGRlciUyMGpvaW50JTIwYW5hdG9teSUyMG1lZGljYWx8ZW58MXx8fHwxNzcwNDk3MjA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 1 — Articulação glenoumeral: a cabeça do úmero articula-se com a cavidade glenoidal da escápula, formando uma das articulações mais móveis do corpo.',
      alt: 'Articulação do ombro - vista anatômica',
    },
    'Anatomia Óssea': {
      url: 'https://images.unsplash.com/photo-1508387027939-27cccde53673?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2VsZXRvbiUyMHNob3VsZGVyJTIwYm9uZSUyMHNjYXB1bGF8ZW58MXx8fHwxNzcwNDk3MjA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 2 — Esqueleto do ombro: escápula, clavícula e úmero proximal. Note o acrômio e o processo coracoide como pontos de referência fundamentais.',
      alt: 'Esqueleto do ombro com escápula e clavícula',
    },
    'Cápsula e Ligamentos': {
      url: 'https://images.unsplash.com/photo-1582380375444-275b280990a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmF0b215JTIwbGlnYW1lbnQlMjBqb2ludCUyMG1lZGljYWwlMjBtb2RlbHxlbnwxfHx8fDE3NzA0OTcyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 3 — Modelo articular: os ligamentos glenoumerais reforçam a cápsula articular e limitam a amplitude de movimento em diferentes posições.',
      alt: 'Modelo anatômico de articulação com ligamentos',
    },
    'Manguito Rotador': {
      url: 'https://images.unsplash.com/photo-1759354250893-1010d8da2078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGFuYXRvbXklMjBtdXNjbGVzJTIwdXBwZXIlMjBib2R5fGVufDF8fHx8MTc3MDQ5NzIwNXww&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 4 — Musculatura do ombro: o manguito rotador (SITS) estabiliza dinamicamente a articulação glenoumeral durante os movimentos do membro superior.',
      alt: 'Musculatura do ombro e manguito rotador',
    },
    'Anatomia da Axila': {
      url: 'https://images.unsplash.com/photo-1716996236807-a45afca9957a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzdCUyMHRvcnNvJTIwYW5hdG9teSUyMG11c2NsZSUyMHJpYmNhZ2V8ZW58MXx8fHwxNzcwNDk3MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 5 — Região axilar: espaço piramidal entre a parede torácica e o membro superior, contendo a artéria axilar, plexo braquial e linfonodos axilares.',
      alt: 'Região axilar e parede torácica',
    },
    'Vascularização e Inervação': {
      url: 'https://images.unsplash.com/photo-1729339983367-770c2527ce75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmF0b215JTIwbmVydmVzJTIwdmVzc2VscyUyMG1lZGljYWx8ZW58MXx8fHwxNzcwNDk3MjA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 6 — Vascularização e inervação: rede anastomótica da artéria axilar e fascículos do plexo braquial ao redor dos vasos axilares.',
      alt: 'Vascularização e inervação do ombro',
    },
    'Correlações Clínicas': {
      url: 'https://images.unsplash.com/photo-1632054229377-c5c47de2af5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG91bGRlciUyMGV4YW1pbmF0aW9uJTIwb3J0aG9wZWRpYyUyMGNsaW5pY2FsfGVufDF8fHx8MTc3MDQ5NzIwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 7 — Exame clínico do ombro: a avaliação da luxação glenoumeral e das lesões do manguito rotador é essencial na prática ortopédica.',
      alt: 'Exame clínico do ombro',
    },
  },

  // ═══ ARM (Braço) ═══
  arm: {
    'Introdução': {
      url: 'https://images.unsplash.com/photo-1770119001890-32147fab8d65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMHNrZWxldG9uJTIwYW5hdG9teSUyMG1vZGVsJTIwbWVkaWNhbHxlbnwxfHx8fDE3NzA0OTcyMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 1 — Visão geral do membro superior: o braço conecta a articulação do ombro ao cotovelo, contendo o úmero e compartimentos musculares anterior e posterior.',
      alt: 'Modelo anatômico do esqueleto humano',
    },
    'Anatomia Óssea - O Úmero': {
      url: 'https://images.unsplash.com/photo-1748712308129-1d200044113d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1lcnVzJTIwYXJtJTIwYm9uZSUyMHNrZWxldG9uJTIwYW5hdG9teXxlbnwxfHx8fDE3NzA0OTcyMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 2 — O úmero: osso mais longo do membro superior, com o sulco do nervo radial percorrendo sua face posterior.',
      alt: 'Osso úmero - anatomia',
    },
    'Compartimento Anterior do Braço': {
      url: 'https://images.unsplash.com/photo-1627063383848-990b09ca1617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWNlcHMlMjB0cmljZXBzJTIwYXJtJTIwbXVzY2xlcyUyMGFuYXRvbXl8ZW58MXx8fHwxNzcwNDk3MjA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 3 — Compartimento anterior do braço: bíceps braquial, braquial e coracobraquial, todos inervados pelo nervo musculocutâneo.',
      alt: 'Músculos do braço - bíceps e tríceps',
    },
    'Vascularização do Braço': {
      url: 'https://images.unsplash.com/photo-1705292820194-8262fd9644d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcm0lMjBibG9vZCUyMHZlc3NlbHMlMjB2YXNjdWxhciUyMGFuYXRvbXl8ZW58MXx8fHwxNzcwNDk3MjEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Fig. 5 — Vascularização do braço: a artéria braquial é o principal suprimento arterial, acompanhada por nervos mediano, ulnar e radial.',
      alt: 'Vascularização do braço',
    },
  },
};

// Helper to get the image for a specific section
export function getSectionImage(topicId: string, sectionTitle: string): SectionImage | null {
  return SECTION_IMAGES[topicId]?.[sectionTitle] ?? null;
}
