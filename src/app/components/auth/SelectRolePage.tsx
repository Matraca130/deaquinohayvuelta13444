// ============================================================
// Axon — Select Institution / Role Page
// When a user has multiple memberships, they pick which
// institution and role to use for this session.
// ============================================================
import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { Membership } from '@/app/services/authApi';
import { AxonLogo } from '@/app/components/shared/AxonLogo';
import { motion } from 'motion/react';
import {
  Crown, Shield, GraduationCap, BookOpen,
  ChevronRight, LogOut,
} from 'lucide-react';

const ROLE_ROUTES: Record<string, string> = {
  owner: '/professor',       // owner/admin areas removed — redirect to professor
  admin: '/professor',
  professor: '/professor',
  student: '/student',
};

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  owner: {
    icon: <Crown size={20} />,
    label: 'Propietario',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  admin: {
    icon: <Shield size={20} />,
    label: 'Administrador',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  professor: {
    icon: <GraduationCap size={20} />,
    label: 'Profesor',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  student: {
    icon: <BookOpen size={20} />,
    label: 'Estudiante',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10 border-teal-500/20',
  },
};

export function SelectRolePage() {
  const { user, memberships, setActiveMembership, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (membership: Membership) => {
    setActiveMembership(membership);
    const route = ROLE_ROUTES[membership.role] || '/student';
    navigate(route, { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  // Auto-redirect if 0 or 1 membership
  if (memberships.length === 0) {
    return <Navigate to="/" replace />;
  }
  if (memberships.length === 1) {
    // Can't call setActiveMembership during render, so redirect to root
    // PostLoginRouter will handle it since activeMembership is already set from restore
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <AxonLogo size="md" theme="gradient" />
          <h1 className="text-2xl font-bold text-gray-900 mt-6">
            Hola, {user?.name?.split(' ')[0] || 'Usuario'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona la institucion y el rol para esta sesion
          </p>
        </div>

        {/* Membership Cards */}
        <div className="space-y-3">
          {memberships.map((m, i) => {
            const config = ROLE_CONFIG[m.role] || ROLE_CONFIG.student;
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSelect(m)}
                className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${config.bg} ${config.color} shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {m.institution?.name || 'Institucion'}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {m.institution?.slug ? `@${m.institution.slug}` : m.institution_id}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-500 transition-colors shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Sign Out */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}