import React from 'react';
import clsx from 'clsx';
import { TrendingUp } from 'lucide-react';
import { kpiCardClasses, iconBadgeClasses, components } from '@/app/design-system';

// ─────────────────────────────────────────────
// SHARED KPI CARD
//
// Consolida o padrão de card de KPI usado em
// DashboardView e ReviewSessionView.
//
// Aceita:
//   - icon + iconColorClass  (badge de ícone)
//   - label + value          (texto principal)
//   - trendSlot              (badge de tendência — flexível)
//   - children               (conteúdo extra: progress bar, etc.)
//   - className              (classes extras no wrapper)
// ─────────────────────────────────────────────

interface KPICardProps {
  /** Ícone React (ex: <Flame size={20} />) */
  icon: React.ReactNode;
  /** Label descritivo (ex: "Horas Estudadas") */
  label: string;
  /** Valor principal (ex: "24h") */
  value: React.ReactNode;
  /** Slot livre para o badge de trend (canto superior direito) */
  trendSlot?: React.ReactNode;
  /** Classes Tailwind para o fundo do badge de ícone (ex: "bg-orange-100 text-orange-600") */
  iconColorClass?: string;
  /** Conteúdo adicional abaixo de label+value (ex: progress bar) */
  children?: React.ReactNode;
  /** Classes extras no wrapper (sem sobrescrever base) */
  className?: string;
}

export function KPICard({
  icon,
  label,
  value,
  trendSlot,
  iconColorClass,
  children,
  className,
}: KPICardProps) {
  return (
    <div className={clsx(kpiCardClasses(), className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx(components.kpiCard.iconBg, iconColorClass || `${components.icon.default.bg} ${components.icon.default.text}`)}>
          {icon}
        </div>
        {trendSlot}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// TREND BADGE — helper sub-componente
//
// Para o caso comum de "↑ +12%" verde ou "↓ -5%" vermelho.
// ─────────────────────────────────────────────

interface TrendBadgeProps {
  /** Texto do trend (ex: "+12%") */
  label: string;
  /** Direção: true = up (verde), false = down (vermelho) */
  up?: boolean;
  /** Ícone custom (default: TrendingUp rotacionado) */
  icon?: React.ReactNode;
}

export function TrendBadge({ label, up = true, icon }: TrendBadgeProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
        up ? components.kpiCard.trend.up : components.kpiCard.trend.down,
      )}
    >
      {icon || <TrendingUp className={clsx('w-3 h-3', !up && 'rotate-180')} />}
      {label}
    </div>
  );
}
