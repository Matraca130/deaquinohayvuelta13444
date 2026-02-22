// ============================================================
// Axon — Placeholder Page for roles
// Reusable "coming soon" page with role context
// ============================================================
import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'motion/react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor?: string; // tailwind color name: amber, blue, purple, teal
  features?: string[];
  /** Which backend routes this page will consume */
  backendRoutes?: string[];
}

export function PlaceholderPage({
  title,
  description,
  icon,
  accentColor = 'teal',
  features = [],
  backendRoutes = [],
}: PlaceholderPageProps) {
  const { user, activeMembership } = useAuth();

  const colorMap: Record<string, { iconBg: string; iconText: string; border: string; featureDot: string }> = {
    amber: { iconBg: 'bg-amber-50', iconText: 'text-amber-500', border: 'border-amber-100', featureDot: 'bg-amber-400' },
    blue: { iconBg: 'bg-blue-50', iconText: 'text-blue-500', border: 'border-blue-100', featureDot: 'bg-blue-400' },
    purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-500', border: 'border-purple-100', featureDot: 'bg-purple-400' },
    teal: { iconBg: 'bg-teal-50', iconText: 'text-teal-500', border: 'border-teal-100', featureDot: 'bg-teal-400' },
  };
  const c = colorMap[accentColor] || colorMap.teal;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-xl ${c.iconBg} ${c.iconText} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Context Card */}
        <div className={`bg-white rounded-xl border ${c.border} p-5 mb-6`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Usuario</p>
              <p className="text-sm font-medium text-gray-900">{user?.name || '—'}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Institucion</p>
              <p className="text-sm font-medium text-gray-900">{activeMembership?.institution?.name || '—'}</p>
              <p className="text-xs text-gray-400">@{activeMembership?.institution?.slug || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Rol activo</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{activeMembership?.role || '—'}</p>
              <p className="text-xs text-gray-400">ID: {activeMembership?.id?.slice(0, 8) || '—'}</p>
            </div>
          </div>
        </div>

        {/* Features list */}
        {features.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Construction size={14} className="text-gray-400" />
              Funcionalidades planificadas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${c.featureDot} shrink-0`} />
                  <span className="text-sm text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backend routes reference */}
        {backendRoutes.length > 0 && (
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Rutas del backend conectadas
            </h2>
            <div className="flex flex-wrap gap-2">
              {backendRoutes.map((r, i) => (
                <code key={i} className="text-xs px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-600 font-mono">
                  {r}
                </code>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
