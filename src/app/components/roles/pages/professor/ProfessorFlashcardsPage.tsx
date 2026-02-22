// ============================================================
// Axon — Professor: Flashcards
// PARALLEL-SAFE: This file is independent. Edit freely.
// Backend routes: GET/POST/PUT /server/flashcards, GET /server/flashcards/due
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { CreditCard } from 'lucide-react';

export function ProfessorFlashcardsPage() {
  return (
    <PlaceholderPage
      title="Flashcards"
      description="Crea y gestiona flashcards para tus cursos"
      icon={<CreditCard size={22} />}
      accentColor="purple"
      features={[
        'Crear flashcards manuales',
        'Generar flashcards con IA (Gemini)',
        'Asociar keywords y subtopicos',
        'Aprobar/rechazar flashcards de IA',
        'Estadisticas de rendimiento',
      ]}
      backendRoutes={[
        'GET /server/flashcards',
        'POST /server/flashcards',
        'PUT /server/flashcards/:id',
        'GET /server/flashcards/due',
      ]}
    />
  );
}
