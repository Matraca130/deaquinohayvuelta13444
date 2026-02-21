// ============================================================
// Axon — Owner Routes (children of OwnerLayout)
//
// ADDING A NEW OWNER PAGE:
//   1. Create the component in /src/app/components/roles/pages/owner/
//   2. Import it here
//   3. Add { path: 'my-slug', Component: MyPage }
//   That's it — no other files need changes.
//
// PARALLEL-SAFE: Only owner-area devs touch this file.
// ============================================================
import type { RouteObject } from 'react-router';

import { OwnerDashboardPage } from '@/app/components/roles/pages/owner/OwnerDashboardPage';
import { OwnerInstitutionPage } from '@/app/components/roles/pages/owner/OwnerInstitutionPage';
import { OwnerMembersPage } from '@/app/components/roles/pages/owner/OwnerMembersPage';
import { OwnerPlansPage } from '@/app/components/roles/pages/owner/OwnerPlansPage';
import { OwnerSubscriptionsPage } from '@/app/components/roles/pages/owner/OwnerSubscriptionsPage';
import { OwnerAccessRulesPage } from '@/app/components/roles/pages/owner/OwnerAccessRulesPage';
import { OwnerReportsPage } from '@/app/components/roles/pages/owner/OwnerReportsPage';
import { OwnerSettingsPage } from '@/app/components/roles/pages/owner/OwnerSettingsPage';

export const ownerChildren: RouteObject[] = [
  { index: true,           Component: OwnerDashboardPage },
  { path: 'institution',   Component: OwnerInstitutionPage },
  { path: 'members',       Component: OwnerMembersPage },
  { path: 'plans',         Component: OwnerPlansPage },
  { path: 'subscriptions', Component: OwnerSubscriptionsPage },
  { path: 'access-rules',  Component: OwnerAccessRulesPage },
  { path: 'reports',       Component: OwnerReportsPage },
  { path: 'settings',      Component: OwnerSettingsPage },
];
