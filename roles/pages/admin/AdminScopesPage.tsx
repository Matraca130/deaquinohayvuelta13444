// ============================================================
// Axon — Admin: Scopes & Permissions
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    members, courses, institutionId
//   Refresh:  refreshMembers (scopes affect member capabilities)
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.getInstitutionAdminScopes(instId)
//   api.getAdminScopes(membershipId)
//   api.createAdminScope({ membership_id, scope_type, scope_id })
//   api.deleteAdminScope(id)
//   api.bulkReplaceAdminScopes(membershipId, scopes)
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { ShieldCheck } from 'lucide-react';

export function AdminScopesPage() {
  return (
    <PlaceholderPage
      title="Permisos y Scopes"
      description="Define los alcances de administracion"
      icon={<ShieldCheck size={22} />}
      accentColor="blue"
      features={[
        'Ver admin scopes asignados',
        'Solicitar nuevos scopes',
        'Delegacion de permisos',
      ]}
      backendRoutes={[
        'GET /server/admin-scopes',
        'GET /server/admin-scopes/my',
        'POST /server/admin-scopes',
      ]}
    />
  );
}