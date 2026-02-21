// ============================================================
// Axon — Professor: Quizzes
// PARALLEL-SAFE: This file is independent. Edit freely.
// Backend routes: GET /server/quiz, POST /server/quiz/generate, POST /server/quiz/submit, GET /server/quiz-content
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { ClipboardList } from 'lucide-react';

export function ProfessorQuizzesPage() {
  return (
    <PlaceholderPage
      title="Quizzes"
      description="Crea evaluaciones para tus estudiantes"
      icon={<ClipboardList size={22} />}
      accentColor="purple"
      features={[
        'Crear quizzes manuales',
        'Generar preguntas con IA',
        'Tipos: multiple choice, V/F, completar',
        'Programar quizzes',
        'Resultados y analytics',
      ]}
      backendRoutes={[
        'GET /server/quiz',
        'POST /server/quiz/generate',
        'POST /server/quiz/submit',
        'GET /server/quiz-content',
      ]}
    />
  );
}
