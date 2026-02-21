// ============================================================
// Axon — Owner: Reports & Analytics
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    dashboardStats, members, subscription
//   Refresh:  refreshStats
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.getInstitutionDashboardStats(instId)  — main metrics
//   api.getAdminStudents(instId, opts)         — student-level data
//   (future analytics endpoints TBD)
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export function OwnerReportsPage() {
  return (
    <PlaceholderPage
      title="Reportes"
      description="Analytics y reportes de la institucion"
      icon={<BarChart3 size={22} />}
      accentColor="amber"
      features={[
        'Metricas de engagement',
        'Reportes de retencion',
        'Uso por curso',
        'Exportar a CSV/PDF',
      ]}
      backendRoutes={[]}
    />
  );
}