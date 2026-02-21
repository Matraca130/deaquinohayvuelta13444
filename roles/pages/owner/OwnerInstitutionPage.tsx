// ============================================================
// Axon — Owner: Institution Management
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    institution, institutionId
//   Refresh:  refreshInstitution (after update)
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.updateInstitution(instId, data)
//   api.checkSlugAvailability(slug)
//   api.deleteInstitution(instId)       — danger zone
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { Building2 } from 'lucide-react';

export function OwnerInstitutionPage() {
  return (
    <PlaceholderPage
      title="Gestion de Institucion"
      description="Configuracion, branding, datos de la institucion"
      icon={<Building2 size={22} />}
      accentColor="amber"
      features={[
        'Editar nombre, logo, slug',
        'Configuracion de la institucion',
        'Integraciones',
        'Dominio personalizado',
      ]}
      backendRoutes={[
        'GET /server/institutions/:id',
        'PUT /server/institutions/:id',
        'PATCH /server/institutions/:id/settings',
      ]}
    />
  );
}