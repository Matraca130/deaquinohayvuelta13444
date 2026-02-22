// ============================================================
// Axon — Student Progress Dashboard (FSRS Analytics)
//
// Shows the student their study stats, FSRS state distribution,
// session history, and per-course breakdown.
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/app/context/AuthContext';
import {
  BarChart3, Brain, Calendar, Clock, Flame,
  Loader2, AlertCircle, TrendingUp, CreditCard,
  BookOpen, Target, Zap, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import * as api from '@/app/services/flashcardApi';
import type { FSRSStateRecord, CourseItem } from '@/app/services/flashcardApi';
import { getErrorMessage, isAbortError } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { useTheme } from 'next-themes';

// ── Types ─────────────────────────────────────────────────

interface DashboardData {
  fsrsStates: FSRSStateRecord[];
  courses: CourseItem[];
}

// ── Main Component ────────────────────────────────────────

export function StudentProgressDashboard() {
  const { activeMembership, accessToken } = useAuth();
  const institutionId = activeMembership?.institution_id;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  // ── Load data ─────────────────────────────────────────────

  // R3 — AbortController support for cancelling loads on unmount
  const loadDashboard = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch: FSRS states + courses
      const [statesResult, coursesResult] = await Promise.all([
        loadAllFSRSStates(signal),
        api.getCourses(institutionId, { signal }),
      ]);

      if (signal?.aborted) return;
      setData({
        fsrsStates: statesResult,
        courses: coursesResult.items || [],
      });
    } catch (err) {
      if (isAbortError(err)) return; // R3 — cancelled, ignore
      setError(getErrorMessage(err));
      logger.error('[Dashboard] Failed to load data:', err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();
    loadDashboard(controller.signal);
    // R3 — abort in-flight request on unmount/dep change
    return () => { controller.abort(); };
  }, [accessToken, institutionId]);

  // ── Computed stats ────────────────────────────────────────

  const stats = useMemo(() => {
    if (!data) return null;
    const { fsrsStates } = data;

    // State distribution
    const stateCount = {
      new: 0,
      learning: 0,
      review: 0,
      relearning: 0,
    };
    for (const s of fsrsStates) {
      if (s.state in stateCount) {
        stateCount[s.state as keyof typeof stateCount]++;
      }
    }

    // Due today
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const dueToday = fsrsStates.filter(
      s => s.state !== 'new' && new Date(s.due_at) <= todayEnd
    ).length;

    // Average stability & difficulty
    const reviewed = fsrsStates.filter(s => s.reps > 0);
    const avgStability = reviewed.length > 0
      ? reviewed.reduce((acc, s) => acc + s.stability, 0) / reviewed.length
      : 0;
    const avgDifficulty = reviewed.length > 0
      ? reviewed.reduce((acc, s) => acc + s.difficulty, 0) / reviewed.length
      : 0;

    // Total reviews & lapses
    const totalReps = fsrsStates.reduce((acc, s) => acc + s.reps, 0);
    const totalLapses = fsrsStates.reduce((acc, s) => acc + s.lapses, 0);

    // Mature cards (stability > 21 days, at least 3 reviews)
    const matureCards = fsrsStates.filter(s => s.stability >= 21 && s.reps >= 3).length;

    // Retention estimate: % of reviewed cards in 'review' state
    const retentionPct = reviewed.length > 0
      ? Math.round((stateCount.review / Math.max(1, reviewed.length)) * 100)
      : 0;

    // Review activity by day (last 14 days)
    const dailyActivity: { date: string; reviews: number; label: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
      const reviewsOnDay = fsrsStates.filter(s => {
        if (!s.last_review_at) return false;
        return s.last_review_at.startsWith(dateStr);
      }).length;
      dailyActivity.push({ date: dateStr, reviews: reviewsOnDay, label: dayLabel });
    }

    // Stability distribution (buckets)
    const stabilityBuckets = [
      { range: '< 1d', min: 0, max: 1, count: 0 },
      { range: '1-3d', min: 1, max: 3, count: 0 },
      { range: '3-7d', min: 3, max: 7, count: 0 },
      { range: '1-2w', min: 7, max: 14, count: 0 },
      { range: '2-4w', min: 14, max: 30, count: 0 },
      { range: '1-3m', min: 30, max: 90, count: 0 },
      { range: '> 3m', min: 90, max: Infinity, count: 0 },
    ];
    for (const s of reviewed) {
      const bucket = stabilityBuckets.find(b => s.stability >= b.min && s.stability < b.max);
      if (bucket) bucket.count++;
    }

    return {
      total: fsrsStates.length,
      stateCount,
      dueToday,
      avgStability: Math.round(avgStability * 10) / 10,
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      totalReps,
      totalLapses,
      matureCards,
      retentionPct,
      dailyActivity,
      stabilityBuckets,
      reviewed: reviewed.length,
    };
  }, [data]);

  // ── Pie chart data ────────────────────────────────────────

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Nuevas', value: stats.stateCount.new, color: '#3b82f6' },
      { name: 'Aprendiendo', value: stats.stateCount.learning, color: '#f59e0b' },
      { name: 'Revision', value: stats.stateCount.review, color: '#10b981' },
      { name: 'Reaprendiendo', value: stats.stateCount.relearning, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [stats]);

  // ── Loading ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-500" />
        <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-300 dark:text-red-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Error al cargar datos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => loadDashboard()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sin datos aun</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Empieza a estudiar flashcards para ver tu progreso aqui.
          </p>
        </div>
      </div>
    );
  }

  // ── Chart theme helpers ────────────────────────────────
  const tooltipStyle = {
    borderRadius: '12px',
    border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
    fontSize: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#1f2937',
  };
  const gridStroke = isDark ? '#334155' : '#f1f5f9';
  const tickFill = isDark ? '#64748b' : '#94a3b8';

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <BarChart3 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Progreso</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard FSRS de repeticion espaciada</p>
          </div>
        </div>
        <button
          onClick={() => loadDashboard()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<CreditCard size={16} />} label="Total Cards" value={stats.total} color="text-gray-700 dark:text-gray-300" bg="bg-gray-50 dark:bg-slate-900" />
        <StatCard icon={<Calendar size={16} />} label="Pendientes Hoy" value={stats.dueToday} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard icon={<TrendingUp size={16} />} label="Retencion" value={`${stats.retentionPct}%`} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard icon={<Zap size={16} />} label="Reviews" value={stats.totalReps} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard icon={<Target size={16} />} label="Cards Maduras" value={stats.matureCards} color="text-teal-600 dark:text-teal-400" bg="bg-teal-50 dark:bg-teal-950/30" />
        <StatCard icon={<Flame size={16} />} label="Lapsos" value={stats.totalLapses} color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-950/30" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FSRS State Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm dark:shadow-slate-950/30"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Brain size={16} className="text-teal-500" />
            Distribucion de Estados FSRS
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} cards`, '']}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : undefined }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              Sin datos
            </div>
          )}
        </motion.div>

        {/* Stability Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm dark:shadow-slate-950/30"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-purple-500" />
            Distribucion de Estabilidad
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.stabilityBuckets} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 10, fill: tickFill }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: tickFill }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value} cards`, 'Cards']}
                contentStyle={tooltipStyle}
              />
              <Bar
                dataKey="count"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Activity Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm dark:shadow-slate-950/30"
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-teal-500" />
          Actividad Reciente (ultimos 14 dias)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={stats.dailyActivity}>
            <defs>
              <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: tickFill }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: tickFill }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value} reviews`, 'Reviews']}
              contentStyle={tooltipStyle}
            />
            <Area
              type="monotone"
              dataKey="reviews"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#colorReviews)"
              dot={{ r: 3, fill: '#14b8a6', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#0d9488' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── FSRS Parameters Summary ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm dark:shadow-slate-950/30"
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Brain size={16} className="text-cyan-500" />
          Parametros FSRS Promedio
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ParamCard label="Estabilidad Promedio" value={`${stats.avgStability} dias`} description="Intervalo promedio de memoria" color="teal" />
          <ParamCard label="Dificultad Promedio" value={`${stats.avgDifficulty}/10`} description="Que tan dificil percibe tu cerebro las cards" color="purple" />
          <ParamCard label="Cards Revisadas" value={String(stats.reviewed)} description="Cards con al menos 1 review" color="blue" />
          <ParamCard
            label="Tasa de Lapsos"
            value={stats.totalReps > 0
              ? `${Math.round((stats.totalLapses / stats.totalReps) * 100)}%`
              : '0%'
            }
            description="Porcentaje de respuestas incorrectas"
            color="rose"
          />
        </div>
      </motion.div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bg} rounded-xl border border-gray-100 dark:border-slate-800 p-3.5 flex flex-col`}
    >
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
    </motion.div>
  );
}

function ParamCard({
  label,
  value,
  description,
  color,
}: {
  label: string;
  value: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    teal: 'border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20',
    purple: 'border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20',
    blue: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20',
    rose: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20',
  };

  return (
    <div className={`rounded-xl border p-3.5 ${colorClasses[color] || colorClasses.teal}`}>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{description}</p>
    </div>
  );
}

// ── Paginated FSRS state loader ───────────────────────────

async function loadAllFSRSStates(signal?: AbortSignal): Promise<FSRSStateRecord[]> {
  const PAGE_SIZE = 500;
  const all: FSRSStateRecord[] = [];
  let offset = 0;
  while (true) {
    const page = await api.getFSRSStates({ limit: PAGE_SIZE, offset, signal });
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}