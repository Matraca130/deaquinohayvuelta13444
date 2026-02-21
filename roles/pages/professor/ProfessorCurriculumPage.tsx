// ============================================================
// Axon — Professor: Curriculum
// PARALLEL-SAFE: This file is independent. Edit freely.
// Backend routes: GET/POST/PUT /server/curriculum
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { ListTree } from 'lucide-react';

export function ProfessorCurriculumPage() {
  return (
    <PlaceholderPage
      title="Curriculum"
      description="Estructura de temas y subtemas por curso"
      icon={<ListTree size={22} />}
      accentColor="purple"
      features={[
        'Crear/editar topicos y subtopicos',
        'Ordenar curriculum',
        'Asociar keywords',
        'Mapear objetivos de aprendizaje',
      ]}
      backendRoutes={[
        'GET /server/curriculum',
        'POST /server/curriculum',
        'PUT /server/curriculum/:id',
      ]}
    />
  );
}
