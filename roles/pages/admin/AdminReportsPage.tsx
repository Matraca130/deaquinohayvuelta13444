// ============================================================
// Axon — Admin: Reports
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    dashboardStats, members, courses
//   Refresh:  refreshStats
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.getInstitutionDashboardStats(instId)
//   api.getAdminStudents(instId, opts)
//   api.getAdminStudentDetail(instId, userId)
//   (future analytics endpoints TBD)
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export function AdminReportsPage() {
  return (
    <PlaceholderPage
      title="Reportes"
      description="Analytics de uso y rendimiento academico"
      icon={<BarChart3 size={22} />}
      accentColor="blue"
      features={[
        'Engagement por curso',
        'Rendimiento de estudiantes',
        'Uso de flashcards y quizzes',
        'Exportar reportes',
      ]}
      backendRoutes={[]}
    />
  );
}