// ============================================================
// Axon — Professor: Courses
// PARALLEL-SAFE: This file is independent. Edit freely.
// Backend routes: GET /server/curriculum, GET /server/content/:courseId
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { BookOpen } from 'lucide-react';

export function ProfessorCoursesPage() {
  return (
    <PlaceholderPage
      title="Mis Cursos"
      description="Gestiona los cursos que dictas"
      icon={<BookOpen size={22} />}
      accentColor="purple"
      features={[
        'Ver cursos asignados',
        'Contenido por curso',
        'Progreso de estudiantes por curso',
        'Materiales de estudio',
      ]}
      backendRoutes={[
        'GET /server/curriculum',
        'GET /server/content/:courseId',
      ]}
    />
  );
}
