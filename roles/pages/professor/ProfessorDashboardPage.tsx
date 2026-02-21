// ============================================================
// Axon — Professor: Dashboard
// PARALLEL-SAFE: This file is independent. Edit freely.
// Backend routes: GET /server/flashcards/stats, GET /server/quiz/stats, GET /server/admin-students
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { LayoutDashboard } from 'lucide-react';

export function ProfessorDashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard del Profesor"
      description="Vision general: cursos, estudiantes, contenido creado"
      icon={<LayoutDashboard size={22} />}
      accentColor="purple"
      features={[
        'Cursos activos',
        'Estudiantes inscritos',
        'Flashcards creadas vs aprobadas',
        'Rendimiento promedio de estudiantes',
        'Reviews pendientes',
        'Proximos quizzes programados',
      ]}
      backendRoutes={[
        'GET /server/flashcards/stats',
        'GET /server/quiz/stats',
        'GET /server/admin-students',
      ]}
    />
  );
}
