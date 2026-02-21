// ============================================================
// ============================================================
//
//   AXON — STUDENT VIEW CONTRACT
//   Guia para desarrollo paralelo de vistas de estudiante
//
//   Cada desarrollador toma UNA vista y la construye de
//   forma independiente siguiendo este patron exacto.
//   NO se necesita editar archivos compartidos.
//
//   COMPLEMENTO de DEVELOPER_CONTRACT.tsx (que cubre
//   las paginas owner/admin/professor). Este contrato
//   cubre las 14 vistas de estudiante.
//
// ============================================================
// ============================================================
//
// ── ARQUITECTURA DE UNA VISTA DE ESTUDIANTE ───────────────
//
//   Cada vista es un archivo .tsx autocontenido en:
//     /src/app/components/content/{ViewName}.tsx
//
//   Se renderiza automaticamente via <Outlet /> dentro de
//   StudentLayout > StudentShell. El desarrollador NO necesita
//   saber nada de routing, auth, sidebar, header, ni providers.
//
//   Flujo completo (el dev solo toca el paso 3):
//
//     App.tsx
//       └─ AuthProvider
//           └─ RouterProvider
//               └─ RequireAuth          ← auth guard
//                   └─ StudentLayout     ← providers + shell
//                       ├─ AppProvider
//                       │   └─ StudentDataProvider
//                       │       └─ StudentShell
//                       │           ├─ Sidebar + Header
//                       │           └─ <Outlet />
//                       │               └─ TU VISTA AQUI  ← solo esto tocas
//
//
// ── DIFERENCIAS CON OWNER/ADMIN/PROFESSOR ─────────────────
//
//   | Aspecto         | Owner/Admin/Professor       | Student                        |
//   |─────────────────|─────────────────────────────|────────────────────────────────|
//   | Datos           | usePlatformData()           | useApp() + useStudentData()    |
//   | API             | platformApi.ts (realRequest) | studentApi.ts (figmaRequest)  |
//   | Types           | types/platform.ts           | types/student.ts               |
//   | Accent color    | amber/blue/purple           | teal                           |
//   | Idioma UI       | Espanol                     | Portugues BR                   |
//   | Header shared   | PageHeader (icon+title)     | AxonPageHeader (title+stats)   |
//   | Ubicacion       | roles/pages/{role}/         | content/                       |
//   | Toaster         | Si (cada pagina)            | No (no usar Toaster)           |
//   | Loading states  | LoadingPage/ErrorState      | Verificar isConnected/loading  |
//
//
// ── PATRON OBLIGATORIO ────────────────────────────────────
//
//   ```tsx
//   // 1. Imports
//   import React, { useState, useMemo } from 'react';
//   import { useApp } from '@/app/context/AppContext';
//   import { useStudentDataContext } from '@/app/context/StudentDataContext';
//
//   // 2. Shared components (STUDENT-SPECIFIC — usa estos)
//   import { AxonPageHeader } from '@/app/components/shared/AxonPageHeader';
//   import { KPICard, TrendBadge } from '@/app/components/shared/KPICard';
//   import { CourseCard } from '@/app/components/shared/CourseCard';
//   import { ActivityItem } from '@/app/components/shared/ActivityItem';
//
//   // 3. Design system tokens (SIEMPRE importar de aqui)
//   import { colors, components, headingStyle } from '@/app/design-system';
//
//   // 4. Datos estaticos (si necesitas cursos, lecciones, etc.)
//   import { courses } from '@/app/data/courses';
//
//   // 5. Icons (lucide-react)
//   import { Flame, Trophy, BookOpen, Clock } from 'lucide-react';
//
//   // 6. Charts (si tu vista tiene graficos)
//   import { BarChart, Bar, XAxis, YAxis, ... } from 'recharts';
//
//   // 7. Animaciones
//   import { motion } from 'motion/react';
//
//   // 8. Utilidades
//   import clsx from 'clsx';
//   import { format } from 'date-fns';
//   import { ptBR } from 'date-fns/locale';
//
//
//   export function MyView() {
//     // A. Contextos (NUNCA fetch directo — todo viene de los providers)
//     const { currentCourse, setActiveView } = useApp();
//     const { stats, courseProgress, dailyActivity, isConnected, loading } = useStudentDataContext();
//
//     // B. Local state (filtros, modals, UI interna)
//     const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
//
//     // C. Derived data (useMemo)
//     const kpiCards = useMemo(() =>
//       isConnected && stats ? stats.totalCardsReviewed.toLocaleString() : '0',
//       [stats, isConnected]
//     );
//
//     // D. Render
//     return (
//       <div className="h-full overflow-y-auto bg-surface-dashboard">
//         {/* ── Header ── */}
//         <AxonPageHeader
//           title="Mi Vista"
//           subtitle={currentCourse.name}
//           statsLeft={<p className="text-gray-500 text-sm">Descricao breve</p>}
//         />
//
//         {/* ── Content ── */}
//         <div className="px-6 py-6 bg-surface-dashboard">
//           <div className="max-w-7xl mx-auto space-y-8">
//             {/* ... tu contenido ... */}
//           </div>
//         </div>
//       </div>
//     );
//   }
//   ```
//
//
// ── DATOS DISPONIBLES EN useApp() ─────────────────────────
//
//   Campo                 | Tipo                  | Uso tipico
//   ──────────────────────┼───────────────────────┼──────────────────────────────
//   currentCourse         | Course                | Nombre, color, accentColor del curso activo
//   currentTopic          | Topic | null          | Topico seleccionado (study views)
//   setActiveView(view)   | (ViewType) => void    | Navegar a otra vista
//   setCurrentTopic(t)    | (Topic) => void       | Seleccionar un topico
//   isSidebarOpen         | boolean               | Estado del sidebar (raro usarlo)
//   isStudySessionActive  | boolean               | Si hay sesion activa de estudio
//   studyPlans            | StudyPlan[]           | Planes de estudio creados
//   quizAutoStart         | boolean               | Auto-iniciar quiz
//   flashcardAutoStart    | boolean               | Auto-iniciar flashcards
//
//
// ── DATOS DISPONIBLES EN useStudentDataContext() ──────────
//
//   Campo                 | Tipo                  | Uso tipico
//   ──────────────────────┼───────────────────────┼──────────────────────────────
//   profile               | StudentProfile | null | Nombre, email, avatar, universidad
//   stats                 | StudentStats | null   | totalStudyMinutes, totalCardsReviewed,
//                         |                       | currentStreak, longestStreak, averageDaily
//   courseProgress         | CourseProgress[]      | Por curso: mastery%, flashcards, quiz score
//   dailyActivity         | DailyActivity[]       | Por dia: studyMinutes, cardsReviewed, retentionRate
//   sessions              | StudySession[]        | Historial de sesiones de estudio
//   reviews               | FlashcardReview[]     | Revisiones individuales (SM-2)
//   loading               | boolean               | True mientras carga datos iniciales
//   error                 | string | null         | Error de fetch (raro)
//   isConnected           | boolean               | True si hay perfil cargado del backend
//   studentId             | string | null         | ID del estudiante actual
//   ──────────────────────┼───────────────────────┼──────────────────────────────
//   refresh()             | () => Promise         | Recargar todos los datos
//   updateProfile(data)   | (Partial) => Promise  | Actualizar perfil
//   updateStats(data)     | (Partial) => Promise  | Actualizar estadisticas
//   logSession(data)      | (session) => Promise  | Registrar sesion de estudio
//   saveReviews(reviews)  | (reviews) => Promise  | Guardar revisiones de flashcards
//
//
// ── COMPONENTES SHARED PARA STUDENT VIEWS ─────────────────
//
//   Componente                              | Descripcion
//   ────────────────────────────────────────┼──────────────────────────────────────────
//   AxonPageHeader                          | Header de pagina con title + subtitle +
//                                           | statsLeft + actionButton slots
//   KPICard + TrendBadge                    | Cards de KPI con icono, valor, tendencia
//   CourseCard                              | Card de disciplina con progreso circular
//   ActivityItem                            | Item de actividad reciente (icono + texto)
//   AxonLogo                                | Logo con variantes sm/md/lg + temas
//   FadeIn + STAGGER_DELAY                  | Wrapper de animacion fade-in escalonada
//
//
// ── DESIGN SYSTEM TOKENS PRINCIPALES ──────────────────────
//
//   Token                                   | Ejemplo de uso
//   ────────────────────────────────────────┼──────────────────────────────────────────
//   headingStyle                            | style={headingStyle} en todos los <h1>-<h4>
//   components.chartCard.base               | className para cards de graficos
//   components.filterButton.active/inactive  | Botones de filtro (semana/mes)
//   components.header.*                      | Tokens del header (NO lo usas, ya esta en Shell)
//   components.sidebar.*                     | Tokens del sidebar (NO lo usas, ya esta en Shell)
//   colors.chart.flashcards / .videos        | Colores para graficos
//   bg-surface-dashboard                    | Fondo principal de la vista (clase Tailwind)
//
//
// ── COMO AGREGAR UNA NUEVA VISTA ──────────────────────────
//
//   1. Crear: /src/app/components/content/MyNewView.tsx
//   2. Agregar a ViewType en AppContext.tsx:
//        | 'my-new-view'
//   3. Agregar UNA linea en routes.tsx:
//        { path: 'my-new-view', Component: MyNewView }
//   4. (Opcional) Agregar nav item en Sidebar.tsx:
//        { id: 'my-new-view', label: 'Mi Vista', icon: Sparkles }
//
//   Eso es todo. No tocar StudentLayout, AppProvider, ni nada mas.
//
//
// ── VISTAS EXISTENTES (14) ────────────────────────────────
//
//   Vista                  | Ruta               | Complejidad | Descripcion
//   ───────────────────────┼────────────────────┼─────────────┼────────────────────────────
//   WelcomeView            | /student           | Media       | Home: disciplinas + atajos + performance
//   DashboardView          | /student/dashboard | Alta        | KPIs, graficos, progreso por materia
//   StudyHubView           | /student/study-hub | Alta        | Hub de navegacion por curso/semestre/topico
//   StudyView              | /student/study     | Muy Alta    | Lector de resumo + anotaciones + sub-componentes
//   FlashcardView          | /student/flashcards| Alta        | Sesion de flashcards con SM-2
//   ThreeDView             | /student/3d        | Alta        | Atlas 3D con modelos anatomicos
//   QuizView               | /student/quiz      | Alta        | Quiz: multiple choice + write-in + fill-blank
//   ScheduleView           | /student/schedule  | Media       | Cronograma de estudio (drag & drop)
//   StudyOrganizerWizard   | /student/organize  | Media       | Wizard para crear plan de estudio
//   ReviewSessionView      | /student/review    | Media       | Sesion de revision espaciada
//   StudyDashboardsView    | /student/study-dash| Media       | Dashboards de estudio
//   KnowledgeHeatmapView   | /student/heatmap   | Media       | Heatmap de conocimiento
//   MasteryDashboardView   | /student/mastery   | Media       | Dashboard de dominio
//   StudentDataPanel       | /student/data      | Baja        | Panel de datos del estudiante
//
//
// ── REGLAS DE ORO PARA STUDENT VIEWS ─────────────────────
//
//   1. NO editar archivos compartidos. Nunca.
//   2. Datos SIEMPRE de contexto: useApp() + useStudentDataContext()
//   3. Si isConnected es false, mostrar datos placeholder (como hace DashboardView)
//   4. Navegar con setActiveView('vista'), NUNCA navigate() directo
//   5. Accent color: TEAL (bg-teal-600, text-teal-600, bg-teal-50)
//   6. Idioma de UI: Portugues BR (labels, placeholders, textos)
//   7. NUNCA montar <Toaster /> — no se usa en el area de estudiante
//   8. Siempre style={headingStyle} en headings (importar de design-system)
//   9. Siempre bg-surface-dashboard como fondo principal
//   10. Export named: `export function MyView() {}` (no default export)
//   11. Responsive: mobile-first con breakpoints sm/lg
//   12. Log errores: console.error('[ViewName] action:', err)
//
//
// ── MAPA DE DEPENDENCIAS ENTRE VISTAS ────────────────────
//
//   Cada vista SOLO se conecta con otras via setActiveView('string').
//   Eso significa que puedes editar una vista sin romper las demas.
//
//   UNICA EXCEPCION: imports directos entre componentes content/:
//
//   StudyView.tsx ──import──▶ SummarySessionNew.tsx   (embebe el resumen completo)
//   StudyView.tsx ──import──▶ LessonGridView.tsx      (sub-componente de study)
//   ThreeDView.tsx ──import──▶ ModelViewer3D.tsx       (sub-componente legitimo)
//
//   Todas las demas conexiones son via strings de navegacion:
//
//   OUTBOUND NAVIGATION (botones que llevan a otra vista):
//   ──────────────────────────────────────────────────────
//   SummarySessionNew  → 'quiz', '3d'              (botones "Ir al Quiz", "Ver 3D")
//   FlashcardView      → 'study'                   (boton "Voltar")
//   QuizView           → 'study'                   (boton "Voltar ao Estudo")
//   WelcomeView        → 'study-hub', 'study'      (cards de curso, atalhos)
//   StudyView          → 'study-hub'               (boton "Voltar")
//   StudyHubView       → 'study'                   (click en topico)
//   ScheduleView       → 'organize-study', 'review-session', 'study-dashboards',
//                         'knowledge-heatmap', 'mastery-dashboard'
//   ReviewSessionView  → 'flashcards', 'schedule'
//   StudyDashboardsView→ 'schedule'
//   KnowledgeHeatmapView→ 'review-session', 'schedule'
//   MasteryDashboardView→ 'review-session', 'study', 'schedule'
//   StudyOrganizerWizard→ 'schedule'
//
//   REGLA: Si editas solo UNA vista, verifica:
//     1. No cambiar la firma de export del componente
//     2. Si tu vista es IMPORTADA por otra (ver lista arriba), no romper props
//     3. Los strings de setActiveView son estables — no los cambies
//
//   MODULOS AISLADOS (se pueden editar 100% independiente):
//     - FlashcardView + flashcard/*  (modulo completo, solo depende de AppContext/StudentData)
//     - QuizView                     (autocontenido)
//     - ScheduleView                 (autocontenido)
//     - DashboardView                (autocontenido)
//     - WelcomeView                  (autocontenido)
//     - KnowledgeHeatmapView         (autocontenido)
//     - MasteryDashboardView         (autocontenido)
//     - StudentDataPanel             (autocontenido)
//
//   MODULOS ACOPLADOS (editar con cuidado):
//     - StudyView ←→ SummarySessionNew ←→ LessonGridView (tripleta acoplada)
//     - ThreeDView ←→ ModelViewer3D (par acoplado)
//
//   SERVICIOS COMPARTIDOS (si editas estos, verificar consumers):
//     - spacedRepetition.ts  ← ReviewSessionView, StudyDashboardsView, keywordManager
//     - keywordManager.ts    ← SmartFlashcardGenerator, SummaryScreen
//     - aiFlashcardGenerator ← SmartFlashcardGenerator
//     - studentApi.ts        ← TODOS (no tocar firma de funciones existentes)
//
// ============================================================

// Este archivo es solo documentacion. No exporta nada.
export {};