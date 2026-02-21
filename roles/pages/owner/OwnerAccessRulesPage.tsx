// ============================================================
// Axon — Owner: Access Rules
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    plans, courses, institutionId
//   Refresh:  refreshPlans (rules are tied to plans)
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.getPlanAccessRules(planId)
//   api.createAccessRules({ plan_id, rules })
//   api.deleteAccessRule(id)
//   api.bulkReplaceAccessRules(planId, rules)
//   api.checkAccess(userId, scopeType, scopeId, instId)
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { Key } from 'lucide-react';

export function OwnerAccessRulesPage() {
  return (
    <PlaceholderPage
      title="Reglas de Acceso"
      description="Define que puede hacer cada plan y rol"
      icon={<Key size={22} />}
      accentColor="amber"
      features={[
        'Reglas por plan',
        'Reglas por rol',
        'Limites de uso (flashcards/dia, quizzes, etc)',
        'Feature flags por plan',
      ]}
      backendRoutes={[
        'GET /server/access-rules',
        'POST /server/access-rules',
        'PUT /server/access-rules/:id',
        'POST /server/check-access',
      ]}
    />
  );
}