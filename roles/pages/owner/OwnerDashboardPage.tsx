// ============================================================
// Axon — Owner: Dashboard
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    institution, dashboardStats, members, subscription
//   Refresh:  refreshStats (after any action that changes metrics)
//   Wrappers: (none — read-only view)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   (none — all data comes from context cache)
// ============================================================

import React, { useMemo } from 'react';
import { usePlatformData } from '@/app/context/PlatformDataContext';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'motion/react';
import {
  getInitials, formatDate, formatRelative,
} from '@/app/components/shared/page-helpers';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import { KPICard, TrendBadge } from '@/app/components/shared/KPICard';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/app/components/ui/table';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  Users, GraduationCap, UserX, CreditCard,
  LayoutDashboard, AlertCircle, RefreshCw,
  Crown, Shield, BookOpen, Building2,
  CheckCircle2, Clock, XCircle, Sparkles,
} from 'lucide-react';
import type { MemberListItem } from '@/app/types/platform';

// ── Constants ─────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  owner:     '#f59e0b', // amber-500
  admin:     '#3b82f6', // blue-500
  professor: '#8b5cf6', // purple-500
  student:   '#14b8a6', // teal-500
};

const ROLE_LABELS: Record<string, string> = {
  owner:     'Propietarios',
  admin:     'Administradores',
  professor: 'Profesores',
  student:   'Estudiantes',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner:     <Crown size={12} />,
  admin:     <Shield size={12} />,
  professor: <BookOpen size={12} />,
  student:   <GraduationCap size={12} />,
};

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  active:   { label: 'Activa',     className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={12} /> },
  trialing: { label: 'Prueba',     className: 'bg-blue-50 text-blue-700 border-blue-200',         icon: <Sparkles size={12} /> },
  past_due: { label: 'Vencida',    className: 'bg-amber-50 text-amber-700 border-amber-200',      icon: <Clock size={12} /> },
  canceled: { label: 'Cancelada',  className: 'bg-red-50 text-red-700 border-red-200',            icon: <XCircle size={12} /> },
};

const STAGGER_DELAY = 0.06;

// ── Helpers (local to this page) ──────────────────────────

function getRoleBadgeClasses(role: string): string {
  const map: Record<string, string> = {
    owner:     'bg-amber-50 text-amber-700 border-amber-200',
    admin:     'bg-blue-50 text-blue-700 border-blue-200',
    professor: 'bg-purple-50 text-purple-700 border-purple-200',
    student:   'bg-teal-50 text-teal-700 border-teal-200',
  };
  return map[role] ?? 'bg-gray-50 text-gray-700 border-gray-200';
}

// ── Animated container ────────────────────────────────────

function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────

/** Loading skeleton layout matching the real dashboard structure */
function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6" aria-label="Cargando dashboard">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* KPI row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Cards row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-8 pt-2">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-44" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Error state with retry */
function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-6 lg:p-8">
      <FadeIn>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el dashboard</h2>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw size={14} />
            Reintentar
          </button>
        </div>
      </FadeIn>
    </div>
  );
}

/** Empty state when no institution exists */
function DashboardEmpty() {
  return (
    <div className="p-6 lg:p-8">
      <FadeIn>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Building2 size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sin institucion configurada</h2>
          <p className="text-sm text-gray-500">
            Tu cuenta aun no tiene una institucion asociada. Contacta al soporte para configurarla.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}

/** Subscription status card */
function SubscriptionCard({ subscription, planName }: {
  subscription: { id: string; status: string; plan: { name: string; slug: string } | null } | null;
  planName?: string;
}) {
  if (!subscription) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CreditCard size={15} className="text-gray-400" />
          Suscripcion
        </h3>
        <div className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sin suscripcion activa</p>
            <p className="text-xs text-gray-400">Configura un plan para comenzar</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[subscription.status] ?? STATUS_CONFIG.active;
  const name = planName ?? subscription.plan?.name ?? 'Plan';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CreditCard size={15} className="text-gray-400" />
          Suscripcion
        </h3>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${statusConfig.className}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
          <Crown size={20} />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{subscription.plan?.slug ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}

/** Custom tooltip for the pie chart */
function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.fill }} />
        <span className="font-medium text-gray-900">{item.name}</span>
      </div>
      <p className="text-gray-500 text-xs mt-0.5">{item.value} {item.value === 1 ? 'miembro' : 'miembros'}</p>
    </div>
  );
}

/** Role distribution donut chart */
function RoleDistributionChart({ membersByRole, totalMembers }: {
  membersByRole: Record<string, number>;
  totalMembers: number;
}) {
  const chartData = useMemo(() => {
    return Object.entries(membersByRole)
      .filter(([, count]) => count > 0)
      .map(([role, count]) => ({
        name: ROLE_LABELS[role] ?? role,
        value: count,
        fill: ROLE_COLORS[role] ?? '#9ca3af',
      }))
      .sort((a, b) => b.value - a.value);
  }, [membersByRole]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Users size={15} className="text-gray-400" />
          Distribucion por rol
        </h3>
        <div className="flex items-center justify-center h-40 text-sm text-gray-400">
          Sin datos de miembros
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
        <Users size={15} className="text-gray-400" />
        Distribucion por rol
      </h3>
      <div className="flex items-center gap-6">
        {/* Chart */}
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, idx) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {chartData.map((entry) => {
            const pct = totalMembers > 0 ? Math.round((entry.value / totalMembers) * 100) : 0;
            return (
              <div key={entry.name} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                <span className="text-sm text-gray-700 truncate flex-1">{entry.name}</span>
                <span className="text-sm font-semibold text-gray-900 tabular-nums">{entry.value}</span>
                <span className="text-xs text-gray-400 tabular-nums w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Recent members table */
function RecentMembersTable({ members }: { members: MemberListItem[] }) {
  const recentMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [members]);

  if (recentMembers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Clock size={15} className="text-gray-400" />
          Miembros recientes
        </h3>
        <div className="flex items-center justify-center py-8 text-sm text-gray-400">
          Aun no hay miembros registrados
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Clock size={15} className="text-gray-400" />
        Miembros recientes
      </h3>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Miembro</TableHead>
            <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">Rol</TableHead>
            <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider hidden md:table-cell">Plan</TableHead>
            <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">Estado</TableHead>
            <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-right">Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentMembers.map((member) => (
            <TableRow key={member.id} className="border-gray-50">
              {/* Member info */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-[11px] font-semibold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.name || 'Sin nombre'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {member.email || '—'}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Role */}
              <TableCell className="hidden sm:table-cell">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold capitalize ${getRoleBadgeClasses(member.role)}`}>
                  {ROLE_ICONS[member.role]}
                  {member.role}
                </span>
              </TableCell>

              {/* Plan */}
              <TableCell className="hidden md:table-cell">
                <span className="text-sm text-gray-600">
                  {member.plan?.name ?? '—'}
                </span>
              </TableCell>

              {/* Active status */}
              <TableCell className="hidden sm:table-cell">
                {member.is_active ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    Inactivo
                  </span>
                )}
              </TableCell>

              {/* Joined date */}
              <TableCell className="text-right">
                <span className="text-xs text-gray-500" title={formatDate(member.created_at)}>
                  {formatRelative(member.created_at)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────

export function OwnerDashboardPage() {
  const {
    institution,
    dashboardStats,
    members,
    subscription,
    loading,
    error,
    refresh,
  } = usePlatformData();

  const { activeMembership } = useAuth();

  // ── Derived values (memoized) ─────────────────────────
  const stats = useMemo(() => {
    if (!dashboardStats) return null;
    return {
      totalMembers: dashboardStats.totalMembers,
      activeStudents: dashboardStats.activeStudents,
      inactiveMembers: dashboardStats.inactiveMembers,
      totalPlans: dashboardStats.totalPlans,
      membersByRole: dashboardStats.membersByRole,
      subscription: dashboardStats.subscription,
    };
  }, [dashboardStats]);

  const activeRate = useMemo(() => {
    if (!stats || stats.totalMembers === 0) return null;
    return Math.round((stats.activeStudents / stats.totalMembers) * 100);
  }, [stats]);

  // ── Render states ─────────────────────────────────────
  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError message={error} onRetry={refresh} />;
  if (!institution && !dashboardStats) return <DashboardEmpty />;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Page header ──────────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <LayoutDashboard size={18} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <p className="text-sm text-gray-500">
              Vision general de{' '}
              <span className="font-medium text-gray-700">
                {institution?.name ?? activeMembership?.institution?.name ?? 'tu institucion'}
              </span>
            </p>
          </div>

          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors self-start sm:self-auto"
            aria-label="Actualizar datos del dashboard"
          >
            <RefreshCw size={12} />
            Actualizar
          </button>
        </div>
      </FadeIn>

      {/* ── KPI Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={STAGGER_DELAY * 1}>
          <KPICard
            icon={<Users size={20} />}
            iconColorClass="bg-blue-50 text-blue-500"
            label="Total miembros"
            value={stats?.totalMembers ?? 0}
            trendSlot={
              activeRate !== null ? (
                <TrendBadge label={`${activeRate}% activos`} up={activeRate >= 50} />
              ) : undefined
            }
          />
        </FadeIn>

        <FadeIn delay={STAGGER_DELAY * 2}>
          <KPICard
            icon={<GraduationCap size={20} />}
            iconColorClass="bg-teal-50 text-teal-500"
            label="Estudiantes activos"
            value={stats?.activeStudents ?? 0}
          />
        </FadeIn>

        <FadeIn delay={STAGGER_DELAY * 3}>
          <KPICard
            icon={<UserX size={20} />}
            iconColorClass="bg-red-50 text-red-400"
            label="Miembros inactivos"
            value={stats?.inactiveMembers ?? 0}
          />
        </FadeIn>

        <FadeIn delay={STAGGER_DELAY * 4}>
          <KPICard
            icon={<CreditCard size={20} />}
            iconColorClass="bg-amber-50 text-amber-500"
            label="Planes"
            value={stats?.totalPlans ?? 0}
          />
        </FadeIn>
      </div>

      {/* ── Subscription + Role Distribution ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={STAGGER_DELAY * 5}>
          <SubscriptionCard
            subscription={stats?.subscription ?? null}
            planName={subscription?.plan?.name}
          />
        </FadeIn>

        <FadeIn delay={STAGGER_DELAY * 6}>
          <RoleDistributionChart
            membersByRole={stats?.membersByRole ?? {}}
            totalMembers={stats?.totalMembers ?? 0}
          />
        </FadeIn>
      </div>

      {/* ── Recent Members ───────────────────────────── */}
      <FadeIn delay={STAGGER_DELAY * 7}>
        <RecentMembersTable members={members} />
      </FadeIn>
    </div>
  );
}