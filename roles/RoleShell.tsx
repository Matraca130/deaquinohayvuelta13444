// ============================================================
// Axon — Role Shell (shared layout for owner/admin/professor)
// Provides sidebar + header + content area
// ============================================================
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { AxonLogo } from '@/app/components/shared/AxonLogo';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, LogOut, ChevronDown, ChevronRight, Building2,
  Crown, Shield, GraduationCap, BookOpen, ArrowLeftRight,
} from 'lucide-react';

export interface NavItemConfig {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface RoleShellProps {
  role: 'owner' | 'admin' | 'professor';
  roleLabel: string;
  roleIcon: React.ReactNode;
  accentColor: string;       // e.g. 'amber', 'blue', 'purple'
  navItems: NavItemConfig[];
}

const ACCENT_CLASSES: Record<string, { sidebar: string; activeNav: string; badge: string; headerBadge: string }> = {
  amber: {
    sidebar: 'from-amber-950 via-slate-900 to-slate-950',
    activeNav: 'bg-amber-500/15 text-amber-400 border-l-amber-500',
    badge: 'bg-amber-500/20 text-amber-400',
    headerBadge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  blue: {
    sidebar: 'from-blue-950 via-slate-900 to-slate-950',
    activeNav: 'bg-blue-500/15 text-blue-400 border-l-blue-500',
    badge: 'bg-blue-500/20 text-blue-400',
    headerBadge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  purple: {
    sidebar: 'from-purple-950 via-slate-900 to-slate-950',
    activeNav: 'bg-purple-500/15 text-purple-400 border-l-purple-500',
    badge: 'bg-purple-500/20 text-purple-400',
    headerBadge: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
};

export function RoleShell({ role, roleLabel, roleIcon, accentColor, navItems }: RoleShellProps) {
  const { user, activeMembership, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const accent = ACCENT_CLASSES[accentColor] || ACCENT_CLASSES.blue;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleSwitchRole = () => {
    navigate('/select-role', { replace: true });
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`h-full bg-gradient-to-b ${accent.sidebar} flex flex-col shrink-0 overflow-hidden`}
          >
            {/* Logo */}
            <div className="h-14 flex items-center px-5 shrink-0 border-b border-white/[0.06]">
              <AxonLogo size="sm" theme="light" />
            </div>

            {/* Role indicator */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent.badge}`}>
                  {roleIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{roleLabel}</p>
                  <p className="text-[10px] text-white/40 truncate">
                    {activeMembership?.institution?.name || 'Institucion'}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path.split('/').length <= 2}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all border-l-2 ${
                      isActive
                        ? `${accent.activeNav}`
                        : 'border-l-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${accent.badge}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Bottom: Switch Role + User */}
            <div className="border-t border-white/[0.06] p-3 space-y-1">
              <button
                onClick={handleSwitchRole}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all text-[12px]"
              >
                <ArrowLeftRight size={14} />
                <span>Cambiar rol</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] transition-all text-[12px]"
              >
                <LogOut size={14} />
                <span>Cerrar sesion</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <Menu size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${accent.headerBadge}`}>
              {roleIcon}
              {roleLabel}
            </span>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                <p className="text-[10px] text-gray-400">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
