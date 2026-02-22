// ============================================================
// Axon — Professor: Students
// PARALLEL-SAFE: This file is independent. Edit freely.
// Backend routes: GET /server/admin-students, GET /server/admin-students/:id/progress|stats
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { Users } from 'lucide-react';

export function ProfessorStudentsPage() {
  return (
    <PlaceholderPage
      title="Estudiantes"
      description="Monitorea el progreso de tus estudiantes"
      icon={<Users size={22} />}
      accentColor="purple"
      features={[
        'Lista de estudiantes por curso',
        'Progreso individual',
        'Mastery por topico',
        'Flashcards due / completadas',
        'Rendimiento en quizzes',
        'Alertas de bajo rendimiento',
      ]}
      backendRoutes={[
        'GET /server/admin-students',
        'GET /server/admin-students/:id/progress',
        'GET /server/admin-students/:id/stats',
      ]}
    />
  );
}
