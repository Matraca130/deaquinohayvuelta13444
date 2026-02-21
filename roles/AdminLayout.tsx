// ============================================================
// Axon — Admin Layout (wraps RoleShell with PlatformDataProvider)
// ============================================================
import React from 'react';
import { RoleShell, type NavItemConfig } from './RoleShell';
import { PlatformDataProvider } from '@/app/context/PlatformDataContext';
import {
  LayoutDashboard, Users, FileText, ShieldCheck,
  Settings, BarChart3, Shield,
} from 'lucide-react';

const NAV_ITEMS: NavItemConfig[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={16} /> },
  { label: 'Miembros', path: '/admin/members', icon: <Users size={16} /> },
  { label: 'Contenido', path: '/admin/content', icon: <FileText size={16} /> },
  { label: 'Permisos', path: '/admin/scopes', icon: <ShieldCheck size={16} /> },
  { label: 'Reportes', path: '/admin/reports', icon: <BarChart3 size={16} /> },
  { label: 'Configuracion', path: '/admin/settings', icon: <Settings size={16} /> },
];

export function AdminLayout() {
  return (
    <PlatformDataProvider>
      <RoleShell
        role="admin"
        roleLabel="Administrador"
        roleIcon={<Shield size={16} />}
        accentColor="blue"
        navItems={NAV_ITEMS}
      />
    </PlatformDataProvider>
  );
}