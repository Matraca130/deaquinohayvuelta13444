// ============================================================
// Axon — Owner: Subscriptions
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    subscription, plans, institutionId
//   Refresh:  refreshSubscription (after create/update/cancel)
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.getInstitutionSubscription(instId)
//   api.getSubscription(id)
//   api.createSubscription({ institution_id, plan_id, ... })
//   api.updateSubscription(id, data)
//   api.cancelSubscription(id)
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { ShieldCheck } from 'lucide-react';

export function OwnerSubscriptionsPage() {
  return (
    <PlaceholderPage
      title="Suscripciones"
      description="Monitorea las suscripciones activas y pagos"
      icon={<ShieldCheck size={22} />}
      accentColor="amber"
      features={[
        'Suscripciones activas',
        'Historial de pagos',
        'Renovaciones pendientes',
        'Cancelaciones',
      ]}
      backendRoutes={[
        'GET /server/subscriptions',
        'POST /server/subscriptions',
        'PUT /server/subscriptions/:id',
      ]}
    />
  );
}