// ============================================================
// Axon — Admin: Dashboard
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    institution, dashboardStats, members, courses
//   Refresh:  refreshStats
//   Wrappers: (none — read-only view)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.getAdminScopes(membershipId)    — scope-limited view
//   api.getAdminStudents(instId, opts)  — student metrics
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { LayoutDashboard } from 'lucide-react';

export function AdminDashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard del Administrador"
      description="Vision general de la gestion: usuarios, contenido, permisos"
      icon={<LayoutDashboard size={22} />}
      accentColor="blue"
      features={[
        'Resumen de miembros activos',
        'Contenido pendiente de aprobacion',
        'Actividad reciente',
        'Alertas del sistema',
        'Metricas de uso',
      ]}
      backendRoutes={[
        'GET /server/members',
        'GET /server/admin-scopes',
      ]}
    />
  );
}