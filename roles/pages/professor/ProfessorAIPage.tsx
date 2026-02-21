// ============================================================
// Axon — Professor: AI Tools
// PARALLEL-SAFE: This file is independent. Edit freely.
// Backend routes: POST /server/ai/generate-flashcards|generate-quiz|feedback|smart-study
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { Brain } from 'lucide-react';

export function ProfessorAIPage() {
  return (
    <PlaceholderPage
      title="IA Pedagogica"
      description="Herramientas de IA para crear contenido y analizar rendimiento"
      icon={<Brain size={22} />}
      accentColor="purple"
      features={[
        'Generar flashcards desde texto/PDF',
        'Generar quizzes adaptativos',
        'Feedback automatizado por IA',
        'Sugerencias de mejora curricular',
        'Smart Study recommendations',
      ]}
      backendRoutes={[
        'POST /server/ai/generate-flashcards',
        'POST /server/ai/generate-quiz',
        'POST /server/ai/feedback',
        'POST /server/ai/smart-study',
      ]}
    />
  );
}
