// ============================================================
// Axon — Owner Layout (wraps RoleShell with PlatformDataProvider)
// ============================================================
import React from 'react';
import { RoleShell, type NavItemConfig } from './RoleShell';
import { PlatformDataProvider } from '@/app/context/PlatformDataContext';
import {
  LayoutDashboard, Building2, Users, CreditCard,
  ShieldCheck, Key, Settings, BarChart3, Crown,
} from 'lucide-react';

const NAV_ITEMS: NavItemConfig[] = [
  { label: 'Dashboard', path: '/owner', icon: <LayoutDashboard size={16} /> },
  { label: 'Institucion', path: '/owner/institution', icon: <Building2 size={16} /> },
  { label: 'Miembros', path: '/owner/members', icon: <Users size={16} /> },
  { label: 'Planes', path: '/owner/plans', icon: <CreditCard size={16} /> },
  { label: 'Suscripciones', path: '/owner/subscriptions', icon: <ShieldCheck size={16} /> },
  { label: 'Reglas de Acceso', path: '/owner/access-rules', icon: <Key size={16} /> },
  { label: 'Reportes', path: '/owner/reports', icon: <BarChart3 size={16} /> },
  { label: 'Configuracion', path: '/owner/settings', icon: <Settings size={16} /> },
];

export function OwnerLayout() {
  return (
    <PlatformDataProvider>
      <RoleShell
        role="owner"
        roleLabel="Propietario"
        roleIcon={<Crown size={16} />}
        accentColor="amber"
        navItems={NAV_ITEMS}
      />
    </PlatformDataProvider>
  );
}