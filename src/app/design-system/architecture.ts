/**
 * @AxonPlataforma — Architecture Reference
 *
 * Complemento del design-system/index.ts.
 * Mientras index.ts define COMO SE VE el app,
 * este archivo define COMO FUNCIONA: estructura, datos, estado,
 * convenciones de codigo y patrones de backend.
 *
 * USO:
 *   import { architecture, dataModels, apiEndpoints } from '@/app/design-system/architecture';
 *
 * Este archivo es DOCUMENTACION EJECUTABLE: los tipos son reales,
 * los endpoints son reales, las convenciones son las que usamos.
 */

// ─────────────────────────────────────────────
// 1. FILE STRUCTURE — Mapa completo del proyecto
// ─────────────────────────────────────────────

export const fileStructure = {
  /** Punto de entrada — SIEMPRE tiene default export */
  entrypoint: '/src/app/App.tsx',

  /** Estilos globales */
  styles: {
    entry:    '/src/styles/index.css',      // importa fonts + tailwind + theme
    fonts:    '/src/styles/fonts.css',       // Google Fonts (@import url)
    tailwind: '/src/styles/tailwind.css',    // Tailwind v4 + tw-animate-css
    theme:    '/src/styles/theme.css',       // @theme, @layer base, custom utilities
  },

  /** Contextos de estado global */
  contexts: {
    app:         '/src/app/context/AppContext.tsx',         // Navegacion, curso actual, tema, planes de estudio
    studentData: '/src/app/context/StudentDataContext.tsx', // Datos del estudiante via Supabase
  },

  /** Datos estaticos (cursos, contenido, lecciones) */
  data: {
    courses:      '/src/app/data/courses.ts',       // Cursos, semestres, secciones, topicos, flashcards, quizzes, modelos 3D
    lessons:      '/src/app/data/lessonData.ts',    // Datos de lecciones por topico
    studyContent: '/src/app/data/studyContent.ts',  // Contenido medico detallado (markdown)
    keywords:     '/src/app/data/keywords.ts',      // Palabras clave con mastery levels
    images:       '/src/app/data/sectionImages.ts', // URLs de imagenes por seccion
  },

  /** Servicios (comunicacion con backend) */
  services: {
    studentApi:     '/src/app/services/studentApi.ts',          // CRUD completo: perfil, stats, progreso, sesiones, flashcards, resumos, keywords
    aiService:      '/src/app/services/aiService.ts',           // Chat con Gemini, generacion de flashcards/quiz/explicaciones
    aiFlashcards:   '/src/app/services/aiFlashcardGenerator.ts', // Generacion inteligente de flashcards via IA
    spacedRep:      '/src/app/services/spacedRepetition.ts',    // Algoritmo SM-2 + keyword-level tracking
    keywordManager: '/src/app/services/keywordManager.ts',      // Gestion de keywords con spaced repetition V2
  },

  /** Tipos TypeScript */
  types: {
    student: '/src/app/types/student.ts', // StudentProfile, StudentStats, CourseProgress, FlashcardReview, StudySession, DailyActivity, StudySummary
  },

  /** Hooks personalizados */
  hooks: {
    useSmartPopup:          '/src/app/hooks/useSmartPopupPosition.ts',
    flashcardTypes:         '/src/app/hooks/flashcard-types.ts',          // Types, constants, pure utils for flashcards
    useFlashcardNavigation: '/src/app/hooks/useFlashcardNavigation.ts',   // View state machine (hub/section/deck)
    useFlashcardEngine:     '/src/app/hooks/useFlashcardEngine.ts',       // Session logic + backend persistence
    useSummaryPersistence:  '/src/app/hooks/useSummaryPersistence.ts',    // Summary save/load persistence
    useSummaryTimer:        '/src/app/hooks/useSummaryTimer.ts',          // Timer for study sessions
    useSummaryViewer:       '/src/app/hooks/useSummaryViewer.ts',         // Summary viewer state
    useTextAnnotations:     '/src/app/hooks/useTextAnnotations.ts',       // Text annotation/highlight system
    useKeywordMastery:      '/src/app/hooks/useKeywordMastery.ts',       // Keyword mastery tracking
  },

  /** Componentes — layout */
  layout: {
    StudentLayout:       '/src/app/components/roles/StudentLayout.tsx',   // Shell estudiante: providers + sidebar + header + <Outlet />
    Sidebar:             '/src/app/components/layout/Sidebar.tsx',            // Navegacion lateral oscura
    CourseSwitcher:      '/src/app/components/layout/CourseSwitcher.tsx',     // Dropdown de cursos en el header
    TopicSidebar:        '/src/app/components/layout/TopicSidebar.tsx',       // Panel lateral de topicos (study views)
    UserProfileDropdown: '/src/app/components/layout/UserProfileDropdown.tsx', // Menu de usuario top-right
  },

  /** Componentes — shared (reutilizables) */
  shared: {
    AxonLogo:       '/src/app/components/shared/AxonLogo.tsx',       // Logo + Badge + Brand + Watermark
    AxonPageHeader: '/src/app/components/shared/AxonPageHeader.tsx', // Header consistente para todas las paginas
  },

  /** Componentes — content views (una por vista) */
  views: {
    WelcomeView:          '/src/app/components/content/WelcomeView.tsx',          // Home: disciplinas + atalhos + performance
    DashboardView:        '/src/app/components/content/DashboardView.tsx',        // KPIs, graficos, progreso
    StudyHubView:         '/src/app/components/content/StudyHubView.tsx',         // Hub de estudio: navegacion por curso
    StudyView:            '/src/app/components/content/StudyView.tsx',            // Vista de estudio de un topico
    FlashcardView:        '/src/app/components/content/FlashcardView.tsx',        // Sesion de flashcards con SM-2
    QuizView:             '/src/app/components/content/QuizView.tsx',             // Quiz: multiple choice + write-in + fill-blank
    ThreeDView:           '/src/app/components/content/ThreeDView.tsx',           // Atlas 3D: modelos anatomicos
    ScheduleView:         '/src/app/components/content/ScheduleView.tsx',         // Cronograma de estudio
    SummarySessionNew:    '/src/app/components/content/SummarySessionNew.tsx',    // Lector de resumo + anotaciones + IA
    ReviewSessionView:    '/src/app/components/content/ReviewSessionView.tsx',    // Sesion de revision espaciada
    StudyDashboardsView:  '/src/app/components/content/StudyDashboardsView.tsx',  // Dashboards de estudio
    KnowledgeHeatmapView: '/src/app/components/content/KnowledgeHeatmapView.tsx', // Heatmap de conocimiento
    MasteryDashboardView: '/src/app/components/content/MasteryDashboardView.tsx', // Dashboard de dominio
    StudentDataPanel:     '/src/app/components/content/StudentDataPanel.tsx',     // Panel de datos del estudiante
    StudyOrganizerWizard: '/src/app/components/content/StudyOrganizerWizard.tsx', // Wizard para organizar estudio
    ModelViewer3D:        '/src/app/components/content/ModelViewer3D.tsx',        // Viewer 3D (three.js/R3F) — sub-componente de ThreeDView
    LessonGridView:       '/src/app/components/content/LessonGridView.tsx',      // Grid de lecciones — sub-componente de StudyView
  },

  /** Componentes — AI */
  ai: {
    AxonAIAssistant:        '/src/app/components/ai/AxonAIAssistant.tsx',         // Chat panel flotante (Gemini)
    SmartFlashcardGenerator: '/src/app/components/ai/SmartFlashcardGenerator.tsx', // Generador de flashcards con IA
  },

  /** Componentes — UI primitivos (shadcn/radix) */
  ui: '/src/app/components/ui/',

  /** Design System */
  designSystem: {
    barrel:       '/src/app/design-system/index.ts',         // Barrel re-export (backward compatible)
    brand:        '/src/app/design-system/brand.ts',         // Identidad de marca, logo
    colors:       '/src/app/design-system/colors.ts',        // Paleta completa
    typography:   '/src/app/design-system/typography.ts',    // Familias, reglas, headingStyle
    shapes:       '/src/app/design-system/shapes.ts',        // Border radius
    shadows:      '/src/app/design-system/shadows.ts',       // Niveles de sombra
    components:   '/src/app/design-system/components.ts',    // Recetas Tailwind + helpers
    sectionColors:'/src/app/design-system/section-colors.ts',// Paletas de acento
    navigation:   '/src/app/design-system/navigation.ts',   // Vistas, sidebar items
    layout:       '/src/app/design-system/layout.ts',        // Dimensiones, spacing
    animation:    '/src/app/design-system/animation.ts',     // Presets Motion
    rules:        '/src/app/design-system/rules.ts',         // Reglas obligatorias/prohibidas
    architecture: '/src/app/design-system/architecture.ts',  // Este archivo
  },
} as const;

// ─────────────────────────────────────────────
// 2. STATE MANAGEMENT — Como fluye el estado
// ────────────────────────────────────────────

export const stateManagement = {
  /** AppContext — estado de navegacion y UI (React Context + useState) */
  appContext: {
    file: '/src/app/context/AppContext.tsx',
    provider: 'AppProvider',
    hook: 'useApp()',
    state: {
      currentCourse:        'Course — el curso seleccionado en el CourseSwitcher',
      currentTopic:         'Topic | null — topico activo en el study view',
      activeView:           'ViewType — vista actual (home, dashboard, study-hub, etc.)',
      isSidebarOpen:        'boolean — sidebar expandido o colapsado',
      isStudySessionActive: 'boolean — true cuando hay sesion de estudio activa',
      studyPlans:           'StudyPlan[] — planes de estudio creados por el usuario',
      quizAutoStart:        'boolean — iniciar quiz automaticamente al entrar',
      flashcardAutoStart:   'boolean — iniciar flashcards automaticamente al entrar',
      theme:                "'dark' | 'light' — tema visual (actualmente solo light)",
    },
    actions: [
      'setCurrentCourse(course) — cambia el curso activo (trigger: CourseSwitcher)',
      'setCurrentTopic(topic)   — cambia el topico activo (trigger: TopicSidebar click)',
      'setActiveView(view)      — navega a otra vista (trigger: sidebar, botones)',
      'setSidebarOpen(bool)     — abre/cierra sidebar',
      'addStudyPlan(plan)       — agrega un plan de estudio al array',
      'toggleTaskComplete(planId, taskId) — marca tarea como completada',
    ],
  },

  /** StudentDataContext — datos del estudiante desde Supabase */
  studentDataContext: {
    file: '/src/app/context/StudentDataContext.tsx',
    provider: 'StudentDataProvider',
    hook: 'useStudentDataContext()',
    state: {
      profile:        'StudentProfile | null',
      stats:          'StudentStats | null',
      courseProgress:  'CourseProgress[]',
      dailyActivity:  'DailyActivity[]',
      sessions:       'StudySession[]',
      reviews:        'FlashcardReview[]',
      loading:        'boolean',
      error:          'string | null',
      isConnected:    'boolean — true si hay perfil cargado de Supabase',
    },
    actions: [
      'refresh()             — recarga todos los datos del backend',
      'seedAndLoad()         — siembra datos demo y recarga',
      'updateProfile(data)   — actualiza perfil parcialmente',
      'updateStats(data)     — actualiza estadisticas',
      'logSession(data)      — registra una sesion de estudio',
      'saveReviews(reviews)  — guarda revisiones de flashcards (SM-2)',
    ],
    autoSeed: 'Si no hay datos en el DB al cargar, auto-siembra datos demo',
  },

  /** Patron de Provider wrapping — React Router Data Mode */
  providerTree: `
    App.tsx
      └─ AuthProvider
          └─ RouterProvider (createBrowserRouter)
              └─ RequireAuth                    ← auth guard
                  ├─ StudentLayout              ← /student/*
                  │   └─ AppProvider
                  │       └─ StudentDataProvider
                  │           └─ StudentShell (sidebar + header + <Outlet />)
                  ├─ OwnerLayout                ← /owner/*
                  │   └─ PlatformDataProvider
                  │       └─ RoleShell (sidebar + header + <Outlet />)
                  ├─ AdminLayout                ← /admin/*
                  │   └─ PlatformDataProvider
                  │       └─ RoleShell
                  └─ ProfessorLayout            ← /professor/*
                      └─ PlatformDataProvider
                          └─ RoleShell
  `,
} as const;

// ─────────────────────────────────────────────
// 3. NAVIGATION — Como funciona la navegacion
// ─────────────────────────────────────────────

export const navigationFlow = {
  /** Navegacion usa React Router (Data Mode) + AppContext bridge */
  method: 'React Router (createBrowserRouter) + AppContext.setActiveView() como wrapper',

  /** Como funciona:
   *  - routes.tsx define createBrowserRouter con sub-archivos por area
   *  - AppContext.setActiveView(view) llama navigate() internamente
   *  - Sidebar.tsx usa setActiveView() para navegar entre vistas
   *  - Cada vista es un componente renderizado via <Outlet /> en su Layout
   */
  routeFiles: {
    assembler:  '/src/app/routes.tsx',                  // Thin assembler — imports sub-files
    student:    '/src/app/routes/student-routes.ts',    // /student/* children
    owner:      '/src/app/routes/owner-routes.ts',      // /owner/* children
    admin:      '/src/app/routes/admin-routes.ts',      // /admin/* children
    professor:  '/src/app/routes/professor-routes.ts',  // /professor/* children
  },

  /** Todas las vistas de estudiante disponibles (match ViewType en AppContext) */
  viewTypes: [
    'home',               // WelcomeView — pagina principal (index route)
    'dashboard',          // DashboardView — KPIs y graficos
    'study-hub',          // StudyHubView — navegacion por curso
    'study',              // StudyView — vista de estudio de un topico
    'flashcards',         // FlashcardView — sesion de flashcards
    'quiz',               // QuizView — quiz interactivo
    '3d',                 // ThreeDView — atlas 3D
    'schedule',           // ScheduleView — cronograma
    'organize-study',     // StudyOrganizerWizard — wizard
    'review-session',     // ReviewSessionView — revision espaciada
    'study-dashboards',   // StudyDashboardsView
    'knowledge-heatmap',  // KnowledgeHeatmapView
    'mastery-dashboard',  // MasteryDashboardView
    'student-data',       // StudentDataPanel
  ] as const,

  /** Layout rendering: StudentLayout > StudentShell > <Outlet /> renderiza la ruta activa */
  renderFlow: 'React Router <Outlet /> renderiza el componente que matchea la ruta actual',

  /** Para agregar una nueva vista de estudiante:
   *  1. Crear el componente en /src/app/components/content/
   *  2. Agregar import + ruta en routes/student-routes.ts
   *  3. (Opcional) Agregar a ViewType en AppContext.tsx
   *  4. (Opcional) Agregar nav item en Sidebar.tsx
   *  Solo se tocan archivos del area student.
   */
  addingNewView: 'Solo editar routes/student-routes.ts + (opcional) AppContext ViewType + Sidebar nav item',

  /** TopicSidebar se muestra solo en study-hub y study (cuando no hay sesion activa) */
  topicSidebarCondition: "(activeView === 'study-hub' || activeView === 'study') && !isStudySessionActive",

  /** Cada vista se anima con Motion al entrar */
  pageAnimation: '{ opacity: 0, y: 10 } → { opacity: 1, y: 0 } en 0.2s',
} as const;

// ─────────────────────────────────────────────
// 4. DATA MODELS — Tipos principales
// ─────────────────────────────────────────────

export const dataModels = {
  /** Modelo del curso (estatico, en courses.ts) */
  courseHierarchy: `
    Course
    ├── id, name, color (bg-*), accentColor (text-*)
    └── semesters: Semester[]
        ├── id, title
        └── sections: Section[]
            ├── id, title, imageUrl?
            └── topics: Topic[]
                ├── id, title, summary, videoUrl?
                ├── flashcards?: Flashcard[] — { id, question, answer, mastery (1-5), image? }
                ├── quizzes?: QuizQuestion[] — { id, type, question, options?, correctAnswer?, etc. }
                ├── model3D?: Model3D — { id, name, description, available }
                └── lessons?: Lesson[] — { id, title, duration, completed, hasVideo, hasSummary }
  `,

  /** Quiz question types */
  quizTypes: [
    "multiple-choice — options[] + correctAnswer (index)",
    "write-in       — correctText + acceptedVariations[]",
    "fill-blank     — blankSentence (con ___) + blankAnswer",
  ],

  /** Flashcard mastery scale (SM-2) */
  masteryScale: {
    1: 'Nao sei — repetir imediatamente (rose-500)',
    2: 'Dificil — repetir em breve (orange-500)',
    3: 'Medio — duvida razoavel (yellow-400)',
    4: 'Facil — entendi bem (lime-500)',
    5: 'Perfeito — memorizado (emerald-500)',
  },

  /** Student data types (en /src/app/types/student.ts) */
  studentTypes: [
    'StudentProfile     — perfil: nome, email, avatar, universidade, semestre, preferencias',
    'StudentStats       — agregados: minutos, sessoes, cards revisados, streak, media diaria',
    'CourseProgress      — por curso: mastery%, lecciones, flashcards, quiz score, topic progress',
    'TopicProgress       — por topico: mastery%, flashcards pendientes, keywords',
    'FlashcardReview     — log individual: rating 1-5, tempo, SM-2 fields (ease, interval, reps)',
    'StudySession        — sesion: tipo, duracion, cards revisados, quiz score',
    'DailyActivity       — por dia: minutos, sessoes, cards, retencao',
    'StudySummary        — resumo: contenido markdown, anotaciones, keywords, tags',
  ],

  /** Keyword state (Spaced Repetition V2) */
  keywordState: {
    fields: 'keyword, mastery (0-1), stability_days, due_at, lapses, exposures, card_coverage, color (red|yellow|green)',
    algorithm: 'SM-2 adaptado con hysteresis de color para evitar flickering',
  },
} as const;

// ─────────────────────────────────────────────
// 5. BACKEND / API — Supabase Edge Functions
// ─────────────────────────────────────────────

export const apiEndpoints = {
  /** Todas las llamadas pasan por studentApi.ts */
  serviceFile: '/src/app/services/studentApi.ts',

  /** Base URL */
  baseUrl: 'https://{projectId}.supabase.co/functions/v1/make-server-{hash}',

  /** Auth: Bearer token con publicAnonKey de Supabase */
  auth: "Authorization: Bearer {publicAnonKey}",

  /** Student ID por defecto para demo */
  defaultStudentId: 'demo-student-001',

  /** Endpoints disponibles */
  endpoints: {
    // ── Profile ──
    'GET    /student/:id/profile':     'Obtener perfil del estudiante',
    'PUT    /student/:id/profile':     'Actualizar perfil (parcial)',

    // ── Stats ──
    'GET    /student/:id/stats':       'Obtener estadisticas agregadas',
    'PUT    /student/:id/stats':       'Actualizar estadisticas',

    // ── Course Progress ──
    'GET    /student/:id/progress':          'Listar progreso de todos los cursos',
    'GET    /student/:id/progress/:courseId': 'Progreso de un curso especifico',
    'PUT    /student/:id/progress/:courseId': 'Actualizar progreso de un curso',

    // ── Study Sessions ──
    'GET    /student/:id/sessions':    'Listar sesiones de estudio',
    'POST   /student/:id/sessions':    'Registrar nueva sesion',

    // ── Flashcard Reviews ──
    'GET    /student/:id/reviews':           'Todas las revisiones',
    'GET    /student/:id/reviews/:courseId':  'Revisiones de un curso',
    'POST   /student/:id/reviews':           'Guardar batch de revisiones',

    // ── Daily Activity ──
    'GET    /student/:id/activity':    'Actividad diaria (heatmap/calendario)',

    // ── Content (generic key-value) ──
    'GET    /content/:courseId':            'Todo el contenido de un curso',
    'GET    /content/:courseId/:key':       'Contenido especifico por key',
    'PUT    /content/:courseId/:key':       'Guardar/actualizar contenido',

    // ── Summaries (Resumos) ──
    'GET    /student/:id/summaries':                    'Todos los resumos',
    'GET    /student/:id/summaries/:courseId':           'Resumos de un curso',
    'GET    /student/:id/summaries/:courseId/:topicId':  'Resumo especifico',
    'PUT    /student/:id/summaries/:courseId/:topicId':  'Guardar/actualizar resumo',
    'DELETE /student/:id/summaries/:courseId/:topicId':  'Eliminar resumo',

    // ── Keywords (Spaced Rep V2) ──
    'GET    /student/:id/keywords/:courseId':            'Keywords de un curso',
    'PUT    /student/:id/keywords/:courseId':            'Guardar keywords del curso',
    'GET    /student/:id/keywords/:courseId/:topicId':   'Keywords de un topico',
    'PUT    /student/:id/keywords/:courseId/:topicId':   'Guardar keywords del topico',

    // ── Seed ──
    'POST   /seed':                    'Sembrar datos demo (auto-llamado si DB vacio)',
  },

  /** AI Service endpoints (via aiService.ts) */
  aiEndpoints: {
    'POST   /ai/chat':        'Chat conversacional con Gemini',
    'POST   /ai/flashcards':  'Generar flashcards a partir de contenido',
    'POST   /ai/quiz':        'Generar preguntas de quiz',
    'POST   /ai/explain':     'Explicar un concepto medico',
    'POST   /ai/summarize':   'Resumir contenido de estudio',
  },
} as const;

// ─────────────────────────────────────────────
// 6. THIRD-PARTY DEPENDENCIES
// ─────────────────────────────────────────────

export const dependencies = {
  /** Framework */
  react: '18.3.1',

  /** Styling */
  tailwindcss: '4.x (v4, JIT, no tailwind.config.js)',
  clsx: 'Composicion condicional de clases',
  tailwindMerge: 'Merge de clases Tailwind sin conflictos',

  /** Animation */
  motion: "12.x — import { motion } from 'motion/react' (NO framer-motion)",

  /** Icons */
  lucideReact: "0.487 — icono por icono: import { Home } from 'lucide-react'",

  /** Charts */
  recharts: '2.15 — BarChart, PieChart, AreaChart, ResponsiveContainer',

  /** 3D */
  three: '0.182 — raw Three.js (no @react-three/fiber or drei; ModelViewer3D uses vanilla three + OrbitControls)',

  /** Dates */
  dateFns: "3.6 — format, subDays, etc. Locale: ptBR from 'date-fns/locale'",

  /** UI Primitives */
  radixUi: 'Accordion, Dialog, Dropdown, Popover, Select, Tabs, Tooltip, etc.',
  shadcnUi: 'Componentes en /src/app/components/ui/ basados en Radix',

  /** Backend */
  supabase: 'Edge Functions — no hay client SDK directo, todo via fetch + Bearer token',

  /** Drag & Drop */
  reactDnd: '16.x + react-dnd-html5-backend',

  /** Forms */
  reactHookForm: '7.55',
} as const;

// ─────────────────────────────────────────────
// 7. CODE CONVENTIONS
// ─────────────────────────────────────────────

export const conventions = {
  /** Naming */
  naming: {
    components:    'PascalCase — WelcomeView.tsx, AxonLogo.tsx',
    hooks:         'camelCase con "use" prefix — useStudentData.ts',
    services:      'camelCase — studentApi.ts, aiService.ts',
    types:         'PascalCase interfaces — StudentProfile, CourseProgress',
    dataFiles:     'camelCase — courses.ts, keywords.ts',
    cssFiles:      'kebab-case — fonts.css, theme.css',
    viewSuffix:    'Siempre termina en "View" — DashboardView, FlashcardView',
    contextSuffix: 'Siempre termina en "Context" — AppContext, StudentDataContext',
  },

  /** Imports */
  imports: {
    pathAlias:    "@/ → src/ (configurado en tsconfig, vite)",
    react:        "import React, { useState, useEffect } from 'react'",
    motion:       "import { motion, AnimatePresence } from 'motion/react'",
    lucide:       "import { Home, BookOpen, Layers } from 'lucide-react'",
    designSystem: "import { colors, components, headingStyle } from '@/app/design-system'",
    designSystemModular: "import { colors } from '@axon/design-system/colors' — para proyectos externos que instalan el paquete",
    context:      "import { useApp } from '@/app/context/AppContext'",
  },

  /** Component patterns */
  componentPatterns: {
    pageStructure: `
      function MyView() {
        return (
          <div className="h-full overflow-y-auto bg-surface-dashboard">
            <AxonPageHeader title="..." subtitle="..." />
            <div className="px-6 py-6 space-y-6">
              {/* content */}
            </div>
          </div>
        );
      }
    `,
    headingStyle: "style={headingStyle} — nunca hardcodear fontFamily: 'Georgia, serif' directamente",
    surfaceDashboard: "bg-surface-dashboard — registrado en theme.css como --color-surface-dashboard: #f5f2ea",
    iconPattern:  "bg-teal-50 + text-teal-500 en un div rounded-xl de w-10 h-10",
    cardPattern:  "bg-white rounded-2xl border border-gray-200 p-5 shadow-sm",
    buttonPattern: "bg-teal-600 hover:bg-teal-700 text-white rounded-xl (action) o rounded-full (pill)",
  },

  /** Migration status — 26/27 componentes migrados al design system (solo ModelViewer3D no aplica: es codigo Three.js puro) */
  migrationStatus: 'COMPLETE — todos los componentes importan de @/app/design-system',

  /** Deep token usage — componentes que usan helpers del design system */
  deepTokenUsage: {
    iconClasses: ['ThreeDView', 'SummarySessionNew', 'FlashcardView'],
    ctaButtonClasses: ['ThreeDView', 'FlashcardView'],
    kpiCardClasses: ['ReviewSessionView'],
    iconBadgeClasses: ['ReviewSessionView', 'QuizView', 'StudyHubView'],
    cardClasses: ['ThreeDView', 'StudyOrganizerWizard'],
    headingStyle: 'ALL views — 0 instancias de fontFamily hardcodeado',
    surfaceDashboard: '8 archivos, 20 instancias migradas de bg-[#f5f2ea] → bg-surface-dashboard',
    sectionColors: ['FlashcardView (sectionColors.multi)', 'ThreeDView (sectionColors.teal)'],
    colorsTokens: ['ThreeDView (colors.primary, colors.border)'],
    componentTokens: ['ReviewSessionView (components.kpiCard.trend, components.progressBar)'],
  },

  /** Language */
  uiLanguage: 'Portugues Brasileiro (pt-BR) para todo el texto de UI',
  codeLanguage: 'Ingles para nombres de variables, funciones y componentes',
  commentsLanguage: 'Ingles o Espanol para comentarios internos',
} as const;

// ─────────────────────────────────────────────
// 8. SPACED REPETITION SYSTEM
// ─────────────────────────────────────────────

export const spacedRepetitionSystem = {
  algorithm: 'SM-2 (SuperMemo) adaptado',
  file: '/src/app/services/spacedRepetition.ts',

  /** Quality ratings (1-5) */
  ratings: {
    1: { label: 'Nao sei',   action: 'Repetir imediatamente',  color: 'rose-500' },
    2: { label: 'Dificil',   action: 'Repetir em breve',       color: 'orange-500' },
    3: { label: 'Medio',     action: 'Intervalo curto',        color: 'yellow-400' },
    4: { label: 'Facil',     action: 'Intervalo medio',        color: 'lime-500' },
    5: { label: 'Perfeito',  action: 'Intervalo largo',        color: 'emerald-500' },
  },

  /** SM-2 formula */
  formula: {
    easeMin: 1.3,
    easeDefault: 2.5,
    easeUpdate: 'EF = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))',
    intervals: 'q >= 3: rep=0→1d, rep=1→6d, rep>1→prev*EF | q < 3: reset reps, interval=1',
  },

  /** Keyword-level tracking (V2) */
  keywordTracking: {
    masteryRange: '0 to 1 (0=novice, 1=expert)',
    colorSystem: 'red (< 0.4) | yellow (0.4-0.7) | green (> 0.7)',
    hysteresis: 'Color only changes after 2 consecutive ratings in new zone (prevents flickering)',
    needScore: 'Combines: overdue factor + inverse mastery + lapse penalty + low coverage bonus',
  },
} as const;

// ─────────────────────────────────────────────
// 9. AI INTEGRATION
// ─────────────────────────────────────────────

export const aiIntegration = {
  provider: 'Google Gemini (via Supabase Edge Functions)',
  serviceFile: '/src/app/services/aiService.ts',

  capabilities: [
    'Chat conversacional — responde preguntas medicas en contexto',
    'Generacion de flashcards — crea cards a partir de contenido de topico',
    'Generacion de quiz — crea preguntas multiple-choice, write-in, fill-blank',
    'Explicaciones — explica conceptos medicos de forma didactica',
    'Resumos — genera resumen de contenido de estudio',
  ],

  uiComponent: '/src/app/components/ai/AxonAIAssistant.tsx',

  /** Smart Flashcard Generator */
  smartGenerator: {
    file: '/src/app/components/ai/SmartFlashcardGenerator.tsx',
    description: 'Genera flashcards inteligentes basadas en keywords con bajo mastery',
  },

  /** Rate limiting */
  rateLimitHandling: 'User-friendly error message en portugues cuando Gemini devuelve 429',
} as const;