// ============================================================
// Axon — Owner: Settings
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    institution, institutionId
//   Refresh:  refreshInstitution (after settings update)
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.updateInstitution(instId, { settings: {...} })
//   (auth settings via AuthContext, not platformApi)
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { Settings } from 'lucide-react';

export function OwnerSettingsPage() {
  return (
    <PlaceholderPage
      title="Configuracion"
      description="Ajustes generales del propietario"
      icon={<Settings size={22} />}
      accentColor="amber"
      features={[
        'Perfil del propietario',
        'Seguridad (2FA)',
        'API keys',
        'Webhooks',
      ]}
      backendRoutes={[]}
    />
  );
}