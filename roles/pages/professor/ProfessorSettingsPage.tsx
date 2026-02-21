// ============================================================
// Axon — Professor: Settings
// PARALLEL-SAFE: This file is independent. Edit freely.
// Backend routes: (TBD)
// API: import * as api from '@/app/services/platformApi'
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { Settings } from 'lucide-react';

export function ProfessorSettingsPage() {
  return (
    <PlaceholderPage
      title="Configuracion"
      description="Ajustes del profesor"
      icon={<Settings size={22} />}
      accentColor="purple"
      features={[
        'Perfil',
        'Notificaciones',
        'Preferencias de IA',
        'Tema de la interfaz',
      ]}
      backendRoutes={[]}
    />
  );
}
