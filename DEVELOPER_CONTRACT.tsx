// ============================================================
// ============================================================
//
//   AXON — DEVELOPER CONTRACT
//   Guia para desarrollo paralelo de paginas
//
//   Cada desarrollador toma UNA pagina y la construye de
//   forma independiente siguiendo este patron exacto.
//   NO se necesita editar archivos compartidos.
//
// ============================================================
// ============================================================
//
// ── ARQUITECTURA DE UNA PAGINA ────────────────────────────
//
//   Cada pagina es un archivo .tsx autocontenido en:
//     /src/app/components/roles/pages/{role}/{PageName}.tsx
//
//   El header de cada placeholder es su SPEC. Documenta:
//     - Que campos leer de usePlatformData()
//     - Que refresh functions llamar despues de mutations
//     - Que funciones de platformApi.ts importar
//
//
// ── PATRON OBLIGATORIO ────────────────────────────────────
//
//   ```tsx
//   // 1. Imports
//   import React, { useState, useMemo, useCallback } from 'react';
//   import { usePlatformData } from '@/app/context/PlatformDataContext';
//   import { useAuth } from '@/app/context/AuthContext';
//   import * as api from '@/app/services/platformApi';
//   import { toast, Toaster } from 'sonner';
//
//   // 2. Shared components (USE THESE, don't re-invent)
//   import { PageHeader } from '@/app/components/shared/PageHeader';
//   import { FadeIn, STAGGER_DELAY } from '@/app/components/shared/FadeIn';
//   import { LoadingPage, EmptyState, ErrorState } from '@/app/components/shared/PageStates';
//   import { ConfirmDialog } from '@/app/components/shared/ConfirmDialog';
//   import { SearchFilterBar } from '@/app/components/shared/SearchFilterBar';
//   import { RoleBadge, StatusBadge } from '@/app/components/shared/RoleBadge';
//   import { getInitials, formatDate, formatRelative, matchesSearch } from '@/app/components/shared/page-helpers';
//   import { ROLE_CONFIG, ROLE_FILTERS } from '@/app/components/shared/role-helpers';
//
//   // 3. UI components (shadcn/radix — pick what you need)
//   import { Button } from '@/app/components/ui/button';
//   import { Input } from '@/app/components/ui/input';
//   import { Dialog, DialogContent, ... } from '@/app/components/ui/dialog';
//   // etc.
//
//   // 4. Icons (lucide-react)
//   import { Users, Plus, Trash2, ... } from 'lucide-react';
//
//   // 5. Types
//   import type { MemberListItem, ... } from '@/app/types/platform';
//
//
//   export function MyPage() {
//     // A. Context data (cached, read-only from perspective of this page)
//     const { members, plans, institutionId, loading, error, refreshMembers } = usePlatformData();
//     const { user } = useAuth();
//
//     // B. Local state (modals, forms, filters)
//     const [showCreate, setShowCreate] = useState(false);
//     const [search, setSearch] = useState('');
//
//     // C. Derived data (useMemo)
//     const filtered = useMemo(() =>
//       members.filter(m => matchesSearch(m, search)),
//       [members, search]
//     );
//
//     // D. Loading / Error / Empty states
//     if (loading) return <LoadingPage />;
//     if (error) return <ErrorState message={error} onRetry={refreshMembers} />;
//
//     // E. Mutation handlers
//     const handleCreate = async (data: any) => {
//       try {
//         await api.createSomething(data);       // API direct
//         await refreshMembers();                  // Refresh cache
//         toast.success('Creado exitosamente');    // Feedback
//         setShowCreate(false);                    // Close modal
//       } catch (err: any) {
//         console.error('[MyPage] create error:', err);
//         toast.error(err.message || 'Error al crear');
//       }
//     };
//
//     return (
//       <div className="p-6 lg:p-8 max-w-6xl mx-auto">
//         <Toaster position="top-right" richColors />
//
//         <PageHeader
//           icon={<Users size={22} />}
//           title="Mi Pagina"
//           subtitle="Descripcion breve"
//           accent="amber"         // amber=owner, blue=admin, purple=professor
//           actions={<Button onClick={() => setShowCreate(true)}>Crear</Button>}
//         />
//
//         {/* ... page content ... */}
//
//         {filtered.length === 0 && (
//           <EmptyState
//             title="Sin datos"
//             description="Crea el primero para comenzar"
//             actionLabel="Crear nuevo"
//             onAction={() => setShowCreate(true)}
//             accent="amber"
//           />
//         )}
//       </div>
//     );
//   }
//   ```
//
//
// ── COLORES POR AREA ──────────────────────────────────────
//
//   Owner pages:     accent="amber"
//   Admin pages:     accent="blue"
//   Professor pages: accent="purple"
//   Student pages:   accent="teal"
//
//
// ── ARCHIVOS COMPARTIDOS (NO EDITAR) ──────────────────────
//
//   Estos archivos son consumidos read-only por todas las paginas.
//   Si necesitas algo que no existe, crea un helper local en tu pagina
//   o pidelo al lead para agregarlo a shared/.
//
//   /src/app/context/PlatformDataContext.tsx   — datos cacheados + refresh
//   /src/app/services/platformApi.ts           — 80+ funciones API
//   /src/app/services/apiConfig.ts             — URL + auth helpers
//   /src/app/types/platform.ts                 — todos los types
//   /src/app/data/courses.ts                   — datos estaticos de cursos
//   /src/app/services/studentApi.ts            — API de estudiante (toggle)
//
//
// ── COMPONENTES SHARED DISPONIBLES ────────────────────────
//
//   @/app/components/shared/PageHeader.tsx      — header de pagina con icon+title+actions
//   @/app/components/shared/FadeIn.tsx          — wrapper de animacion fade-in
//   @/app/components/shared/PageStates.tsx      — LoadingPage, EmptyState, ErrorState
//   @/app/components/shared/ConfirmDialog.tsx   — dialogo de confirmacion reutilizable
//   @/app/components/shared/SearchFilterBar.tsx — barra de busqueda + filtros
//   @/app/components/shared/RoleBadge.tsx       — badges de rol y estado
//   @/app/components/shared/KPICard.tsx         — card de KPI para dashboards
//   @/app/components/shared/page-helpers.ts     — getInitials, formatDate, formatRelative, matchesSearch
//   @/app/components/shared/role-helpers.ts     — ROLE_CONFIG, ROLE_FILTERS, ASSIGNABLE_ROLES
//
//
// ── UI COMPONENTS (shadcn/radix) ──────────────────────────
//
//   Todos en @/app/components/ui/:
//     button, input, label, textarea, select, switch, checkbox,
//     dialog, alert-dialog, dropdown-menu, badge, avatar, skeleton,
//     table, tabs, card, progress, separator, tooltip, popover,
//     sheet, scroll-area, accordion, breadcrumb, pagination, ...
//
//
// ── DATOS DISPONIBLES EN PlatformDataContext ──────────────
//
//   Slice             │ Tipo                        │ Refresh Function
//   ──────────────────┼─────────────────────────────┼──────────────────
//   institution       │ Institution | null           │ refreshInstitution()
//   dashboardStats    │ InstitutionDashboardStats    │ refreshStats()
//   members           │ MemberListItem[]             │ refreshMembers()
//   plans             │ InstitutionPlan[]            │ refreshPlans()
//   subscription      │ InstitutionSubscription      │ refreshSubscription()
//   courses           │ Course[]                     │ refreshCourses()
//   ──────────────────┼─────────────────────────────┼──────────────────
//   loading           │ boolean                      │ —
//   error             │ string | null                │ —
//   institutionId     │ string | null                │ —
//   refresh()         │ — reload ALL slices —        │ —
//
//   Mutation Wrappers (API call + local state update):
//     inviteMember(payload)
//     removeMember(memberId)
//     toggleMember(memberId, active)
//     changeRole(memberId, role)
//
//
// ── DATOS NO CACHEADOS (fetch local en tu pagina) ─────────
//
//   Estas funciones de platformApi.ts devuelven datos que
//   NO estan en el contexto. Tu pagina debe hacer su propio
//   fetch en un useEffect y manejar loading/error local:
//
//   - api.getInstitutionAdminScopes(instId)  → para AdminScopesPage
//   - api.getPlanAccessRules(planId)          → para OwnerAccessRulesPage
//   - api.getAdminStudents(instId, opts)      → para AdminMembersPage (paginado)
//   - api.getSemesters(courseId)              → para AdminContentPage
//   - api.getSections(semesterId)            → para AdminContentPage
//   - api.getTopics(sectionId)               → para AdminContentPage
//   - api.getTopicSummaries(topicId)         → para AdminContentPage
//   - api.getContentHierarchy()              → arbol completo, para AdminContentPage
//   - api.getPlatformPlans()                 → para OwnerSubscriptionsPage
//
//   Patron para fetch local:
//   ```tsx
//   const [scopes, setScopes] = useState<AdminScope[]>([]);
//   const [scopesLoading, setScopesLoading] = useState(true);
//
//   useEffect(() => {
//     if (!institutionId) return;
//     setScopesLoading(true);
//     api.getInstitutionAdminScopes(institutionId)
//       .then(setScopes)
//       .catch(err => console.error('[AdminScopesPage]', err))
//       .finally(() => setScopesLoading(false));
//   }, [institutionId]);
//   ```
//
//
// ── ASIGNACION DE PAGINAS (11 pendientes) ─────────────────
//
//   OWNER (5 pendientes — accent="amber"):
//   ┌─────────────────────────────┬──────────────┬─────────────────────────────┐
//   │ Pagina                      │ Complejidad  │ Dependencias especiales     │
//   ├─────────────────────────────┼──────────────┼─────────────────────────────┤
//   │ OwnerInstitutionPage        │ Media        │ Ninguna extra               │
//   │ OwnerSubscriptionsPage      │ Media        │ api.getPlatformPlans()      │
//   │ OwnerAccessRulesPage        │ Alta         │ api.getPlanAccessRules()    │
//   │ OwnerReportsPage            │ Media        │ recharts (ya instalado)     │
//   │ OwnerSettingsPage           │ Baja         │ Ninguna extra               │
//   └─────────────────────────────┴──────────────┴─────────────────────────────┘
//
//   ADMIN (6 pendientes — accent="blue"):
//   ┌─────────────────────────────┬──────────────┬─────────────────────────────┐
//   │ Pagina                      │ Complejidad  │ Dependencias especiales     │
//   ├─────────────────────────────┼──────────────┼─────────────────────────────┤
//   │ AdminDashboardPage          │ Media        │ Ninguna (read-only)         │
//   │ AdminMembersPage            │ Alta         │ api.getAdminStudents (pag.) │
//   │ AdminContentPage            │ Muy alta     │ Jerarquia 5 niveles         │
//   │ AdminScopesPage             │ Alta         │ api.getInstAdminScopes()    │
//   │ AdminReportsPage            │ Media        │ recharts (ya instalado)     │
//   │ AdminSettingsPage           │ Baja         │ Ninguna extra               │
//   └─────────────────────────────┴──────────────┴─────────────────────────────┘
//
//
// ── REGLAS DE ORO ─────────────────────────────────────────
//
//   1. NO editar archivos compartidos. Nunca.
//   2. Toda mutation: api.xxx() → refresh*() → toast.success/error
//   3. Usar los shared components (PageHeader, FadeIn, etc.)
//   4. Loading, Error, Empty states son OBLIGATORIOS
//   5. Accent colors: owner=amber, admin=blue, professor=purple
//   6. Siempre <Toaster position="top-right" richColors /> en el JSX
//   7. Nombre de export: `export function XxxPage() {}`
//   8. Log errores: console.error('[PageName] action error:', err)
//   9. Responsive: mobile-first con breakpoints sm/lg
//   10. Spanish UI text (labels, placeholders, toasts, errors)
//
// ============================================================

// Este archivo es solo documentacion. No exporta nada.
export {};
