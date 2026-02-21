// ============================================================
// Axon — Admin Routes (children of AdminLayout)
//
// ADDING A NEW ADMIN PAGE:
//   1. Create the component in /src/app/components/roles/pages/admin/
//   2. Import it here
//   3. Add { path: 'my-slug', Component: MyPage }
//   That's it — no other files need changes.
//
// PARALLEL-SAFE: Only admin-area devs touch this file.
// ============================================================
import type { RouteObject } from 'react-router';

import { AdminDashboardPage } from '@/app/components/roles/pages/admin/AdminDashboardPage';
import { AdminMembersPage } from '@/app/components/roles/pages/admin/AdminMembersPage';
import { AdminContentPage } from '@/app/components/roles/pages/admin/AdminContentPage';
import { AdminScopesPage } from '@/app/components/roles/pages/admin/AdminScopesPage';
import { AdminReportsPage } from '@/app/components/roles/pages/admin/AdminReportsPage';
import { AdminSettingsPage } from '@/app/components/roles/pages/admin/AdminSettingsPage';

export const adminChildren: RouteObject[] = [
  { index: true,      Component: AdminDashboardPage },
  { path: 'members',  Component: AdminMembersPage },
  { path: 'content',  Component: AdminContentPage },
  { path: 'scopes',   Component: AdminScopesPage },
  { path: 'reports',  Component: AdminReportsPage },
  { path: 'settings', Component: AdminSettingsPage },
];
