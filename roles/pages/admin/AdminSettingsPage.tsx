// ============================================================
// Axon — Admin: Settings
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    institution
//   Refresh:  (none — personal settings only)
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   (personal settings managed via AuthContext, not platformApi)
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { Settings } from 'lucide-react';

export function AdminSettingsPage() {
  return (
    <PlaceholderPage
      title="Configuracion"
      description="Ajustes del administrador"
      icon={<Settings size={22} />}
      accentColor="blue"
      features={[
        'Perfil',
        'Notificaciones',
        'Preferencias de interfaz',
      ]}
      backendRoutes={[]}
    />
  );
}