// ============================================================
// Axon — Route Configuration (React Router Data Mode)
//
// ACTIVE AREAS:
//   routes/student-routes.ts    → /student/* (session de estudo)
//   routes/professor-routes.ts  → /professor/* (area del profesor)
// LAST REBUILD: forced recompile
// ============================================================
import React from 'react';
import { createBrowserRouter } from 'react-router';

// Auth (shared)
import { LoginPage } from '@/app/components/auth/LoginPage';
import { RequireAuth } from '@/app/components/auth/RequireAuth';
import { RequireRole } from '@/app/components/auth/RequireRole';
import { PostLoginRouter } from '@/app/components/auth/PostLoginRouter';
import { SelectRolePage } from '@/app/components/auth/SelectRolePage';

// Diagnostics (TEMPORARY)
import { DatabaseDiagnostics } from '@/app/components/DatabaseDiagnostics';

// Role Layouts
import { ProfessorLayout } from '@/app/components/roles/ProfessorLayout';
import { StudentLayout } from '@/app/components/roles/StudentLayout';

// Per-role children
import { studentChildren } from '@/app/routes/student-routes';
import { professorChildren } from '@/app/routes/professor-routes';

export const router = createBrowserRouter([
  // ── Public ─────────────────────────────────────────────
  {
    path: '/login',
    Component: LoginPage,
  },

  // ── TEMPORARY: Database diagnostics (no auth required) ──
  {
    path: '/diagnostics',
    Component: DatabaseDiagnostics,
  },

  // ── Protected (require authentication) ─────────────────
  {
    path: '/',
    Component: RequireAuth,
    children: [
      // Root → redirect by role
      { index: true, Component: PostLoginRouter },

      // Role / institution picker
      { path: 'select-role', Component: SelectRolePage },

      // ── PROFESSOR (/professor/*) ───────────────────────
      {
        element: <RequireRole roles={['professor', 'admin', 'owner']} />,
        children: [
          {
            path: 'professor',
            Component: ProfessorLayout,
            children: professorChildren,
          },
        ],
      },

      // ── STUDENT (/student/*) ───────────────────────────
      // Any authenticated role can view the student experience.
      {
        path: 'student',
        Component: StudentLayout,
        children: studentChildren,
      },

      // ── Catch-all → redirect by role ───────────────────
      { path: '*', Component: PostLoginRouter },
    ],
  },
]);