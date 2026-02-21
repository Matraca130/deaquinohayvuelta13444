// ============================================================
// Axon — Owner: Plans Management
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    plans, institutionId
//   Refresh:  refreshPlans (after create/update/delete/set-default)
//   Wrappers: (none)
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.createInstitutionPlan({ institution_id, name, ... })
//   api.updateInstitutionPlan(id, data)
//   api.deleteInstitutionPlan(id)
//   api.setDefaultInstitutionPlan(id)
// ============================================================

import React, { useState, useMemo, useCallback } from 'react';
import { usePlatformData } from '@/app/context/PlatformDataContext';
import * as api from '@/app/services/platformApi';
import { motion } from 'motion/react';
import {
  formatDate, formatPrice,
} from '@/app/components/shared/page-helpers';
import { toast, Toaster } from 'sonner';

// UI Components
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/app/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/app/components/ui/alert-dialog';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/app/components/ui/select';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/app/components/ui/dropdown-menu';

// Icons
import {
  CreditCard, Plus, MoreVertical, Star, Trash2, Pencil,
  AlertCircle, RefreshCw, Users, Calendar, DollarSign,
  Loader2, CheckCircle2, ToggleLeft, ToggleRight, Package,
} from 'lucide-react';

// Types
import type { InstitutionPlan } from '@/app/types/platform';

// ── Constants ─────────────────────────────────────────────

const BILLING_CYCLES: { value: string; label: string }[] = [
  { value: 'monthly',   label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'biannual',  label: 'Semestral' },
  { value: 'annual',    label: 'Anual' },
  { value: 'one_time',  label: 'Pago unico' },
];

function billingLabel(cycle: string): string {
  return BILLING_CYCLES.find(c => c.value === cycle)?.label ?? cycle;
}

// ── FadeIn helper ─────────────────────────────────────────

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

// ── Loading skeleton ──────────────────────────────────────

function PlansSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6" aria-label="Cargando planes">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────

function PlansError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-6 lg:p-8">
      <FadeIn>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar planes</h2>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw size={14} />
            Reintentar
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────

function PlansEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <FadeIn>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-12 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <Package size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin planes creados</h3>
        <p className="text-sm text-gray-500 mb-6">
          Crea planes para organizar el acceso de tus estudiantes al contenido
        </p>
        <Button onClick={onCreate} className="gap-2 bg-amber-500 hover:bg-amber-600">
          <Plus size={14} />
          Crear primer plan
        </Button>
      </div>
    </FadeIn>
  );
}

// ── Plan Form (shared by Create & Edit) ───────────────────

interface PlanFormData {
  name: string;
  description: string;
  price_cents: number;
  billing_cycle: string;
  is_default: boolean;
}

const DEFAULT_FORM: PlanFormData = {
  name: '',
  description: '',
  price_cents: 0,
  billing_cycle: 'monthly',
  is_default: false,
};

function planToForm(plan: InstitutionPlan): PlanFormData {
  return {
    name: plan.name,
    description: plan.description ?? '',
    price_cents: plan.price_cents,
    billing_cycle: plan.billing_cycle,
    is_default: plan.is_default,
  };
}

interface PlanFormProps {
  form: PlanFormData;
  onChange: (form: PlanFormData) => void;
  loading: boolean;
}

function PlanForm({ form, onChange, loading }: PlanFormProps) {
  const priceDisplay = useMemo(() => {
    return (form.price_cents / 100).toFixed(2);
  }, [form.price_cents]);

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="plan-name">Nombre *</Label>
        <Input
          id="plan-name"
          placeholder="Ej: Plan Basico, Plan Premium..."
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          disabled={loading}
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="plan-desc">Descripcion</Label>
        <Textarea
          id="plan-desc"
          placeholder="Descripcion breve del plan..."
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          disabled={loading}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Price + Billing Cycle */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="plan-price">Precio (MXN)</Label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="plan-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={priceDisplay}
              onChange={(e) => {
                const cents = Math.round(parseFloat(e.target.value || '0') * 100);
                onChange({ ...form, price_cents: isNaN(cents) ? 0 : cents });
              }}
              disabled={loading}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Ciclo de cobro</Label>
          <Select
            value={form.billing_cycle}
            onValueChange={(v) => onChange({ ...form, billing_cycle: v })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BILLING_CYCLES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Default toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
        <div>
          <p className="text-sm font-medium text-gray-900">Plan por defecto</p>
          <p className="text-xs text-gray-400">Se asigna automaticamente a nuevos estudiantes</p>
        </div>
        <Switch
          checked={form.is_default}
          onCheckedChange={(v) => onChange({ ...form, is_default: v })}
          disabled={loading}
        />
      </div>
    </div>
  );
}

// ── Create Plan Dialog ────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  onRefresh: () => Promise<void>;
}

function CreatePlanDialog({ open, onOpenChange, institutionId, onRefresh }: CreateDialogProps) {
  const [form, setForm] = useState<PlanFormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_FORM);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre del plan es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await api.createInstitutionPlan({
        institution_id: institutionId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price_cents: form.price_cents,
        billing_cycle: form.billing_cycle,
        is_default: form.is_default,
      });
      await onRefresh();
      toast.success(`Plan "${form.name.trim()}" creado exitosamente`);
      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al crear plan: ${message}`);
      console.error('[CreatePlanDialog] error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) { onOpenChange(v); if (!v) resetForm(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={18} className="text-amber-500" />
            Crear plan
          </DialogTitle>
          <DialogDescription>
            Define un nuevo plan de suscripcion para tus estudiantes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <PlanForm form={form} onChange={setForm} loading={loading} />

          <DialogFooter className="pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => { onOpenChange(false); resetForm(); }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-amber-500 hover:bg-amber-600">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {loading ? 'Creando...' : 'Crear plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Plan Dialog ──────────────────────────────────────

interface EditDialogProps {
  plan: InstitutionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => Promise<void>;
}

function EditPlanDialog({ plan, open, onOpenChange, onRefresh }: EditDialogProps) {
  const [form, setForm] = useState<PlanFormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (plan) setForm(planToForm(plan));
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !form.name.trim()) {
      toast.error('El nombre del plan es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await api.updateInstitutionPlan(plan.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price_cents: form.price_cents,
        billing_cycle: form.billing_cycle,
        is_default: form.is_default,
      });
      await onRefresh();
      toast.success(`Plan "${form.name.trim()}" actualizado`);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al actualizar plan: ${message}`);
      console.error('[EditPlanDialog] error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil size={16} className="text-blue-500" />
            Editar plan
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de "{plan?.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <PlanForm form={form} onChange={setForm} loading={loading} />

          <DialogFooter className="pt-5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation Dialog ────────────────────────────

interface DeleteDialogProps {
  plan: InstitutionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => Promise<void>;
}

function DeletePlanDialog({ plan, open, onOpenChange, onRefresh }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!plan) return;
    setLoading(true);
    try {
      await api.deleteInstitutionPlan(plan.id);
      await onRefresh();
      toast.success(`Plan "${plan.name}" eliminado`);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al eliminar plan: ${message}`);
      console.error('[DeletePlanDialog] error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasMembersWarning = plan?.member_count && plan.member_count > 0;

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar plan</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              ¿Estas seguro de que quieres eliminar el plan{' '}
              <span className="font-semibold text-gray-900">"{plan?.name}"</span>?
            </span>
            {hasMembersWarning && (
              <span className="block text-amber-600 font-medium">
                Este plan tiene {plan?.member_count} miembro(s) asignado(s). Se les desvinculara del plan.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Plan Card ─────────────────────────────────────────────

interface PlanCardProps {
  plan: InstitutionPlan;
  index: number;
  onEdit: (plan: InstitutionPlan) => void;
  onDelete: (plan: InstitutionPlan) => void;
  onSetDefault: (plan: InstitutionPlan) => void;
  onToggleActive: (plan: InstitutionPlan) => void;
}

function PlanCard({ plan, index, onEdit, onDelete, onSetDefault, onToggleActive }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className={`relative bg-white rounded-2xl border-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-md ${
        plan.is_default
          ? 'border-amber-300 ring-1 ring-amber-100'
          : !plan.is_active
            ? 'border-gray-100 opacity-60'
            : 'border-gray-100'
      }`}
    >
      {/* Default ribbon */}
      {plan.is_default && (
        <div className="absolute top-0 right-0">
          <div className="bg-amber-400 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Star size={10} fill="currentColor" />
            Default
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              plan.is_default
                ? 'bg-amber-50 text-amber-500'
                : plan.is_active
                  ? 'bg-blue-50 text-blue-500'
                  : 'bg-gray-50 text-gray-400'
            }`}>
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
              {!plan.is_active && (
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Inactivo</span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-gray-400">Acciones</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => onEdit(plan)}>
                <Pencil size={14} />
                Editar
              </DropdownMenuItem>

              {!plan.is_default && plan.is_active && (
                <DropdownMenuItem onClick={() => onSetDefault(plan)}>
                  <Star size={14} />
                  Hacer default
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => onToggleActive(plan)}>
                {plan.is_active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                {plan.is_active ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(plan)}
                disabled={plan.is_default}
              >
                <Trash2 size={14} />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price */}
        <div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            {formatPrice(plan.price_cents)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {plan.price_cents === 0 ? 'Sin costo' : billingLabel(plan.billing_cycle)}
          </p>
        </div>

        {/* Description */}
        {plan.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {plan.description}
          </p>
        )}

        {/* Stats footer */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={12} />
            <span className="tabular-nums font-medium text-gray-600">
              {plan.member_count ?? 0}
            </span>
            <span>miembros</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{formatDate(plan.created_at)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Summary Stats ─────────────────────────────────────────

function PlansStats({ plans }: { plans: InstitutionPlan[] }) {
  const stats = useMemo(() => {
    const active = plans.filter(p => p.is_active);
    const totalMembers = plans.reduce((sum, p) => sum + (p.member_count ?? 0), 0);
    const avgPrice = active.length > 0
      ? active.reduce((sum, p) => sum + p.price_cents, 0) / active.length
      : 0;
    return {
      total: plans.length,
      active: active.length,
      totalMembers,
      avgPrice,
    };
  }, [plans]);

  const items = [
    { label: 'Total', value: stats.total, icon: <Package size={14} />, color: 'text-gray-600' },
    { label: 'Activos', value: stats.active, icon: <CheckCircle2 size={14} />, color: 'text-emerald-600' },
    { label: 'Miembros', value: stats.totalMembers, icon: <Users size={14} />, color: 'text-blue-600' },
    { label: 'Precio prom.', value: formatPrice(Math.round(stats.avgPrice)), icon: <DollarSign size={14} />, color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
        >
          <div className={`${item.color} opacity-60`}>{item.icon}</div>
          <div>
            <p className="text-lg font-bold text-gray-900 tabular-nums leading-tight">{item.value}</p>
            <p className="text-[11px] text-gray-400">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────

export function OwnerPlansPage() {
  const {
    plans,
    institutionId,
    loading,
    error,
    refresh,
    refreshPlans,
  } = usePlatformData();

  // ── Local state ─────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InstitutionPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstitutionPlan | null>(null);

  // ── Sort: default first, then active, then by name ──
  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [plans]);

  // ── Set default handler ─────────────────────────────
  const handleSetDefault = useCallback(async (plan: InstitutionPlan) => {
    try {
      await api.setDefaultInstitutionPlan(plan.id);
      await refreshPlans();
      toast.success(`"${plan.name}" es ahora el plan por defecto`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al cambiar plan default: ${message}`);
      console.error('[OwnerPlansPage] setDefault error:', err);
    }
  }, [refreshPlans]);

  // ── Toggle active handler ───────────────────────────
  const handleToggleActive = useCallback(async (plan: InstitutionPlan) => {
    try {
      await api.updateInstitutionPlan(plan.id, { is_active: !plan.is_active });
      await refreshPlans();
      toast.success(`"${plan.name}" ${!plan.is_active ? 'activado' : 'desactivado'}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al cambiar estado: ${message}`);
      console.error('[OwnerPlansPage] toggleActive error:', err);
    }
  }, [refreshPlans]);

  // ── Render states ─────────────────────────────────────
  if (loading) return <PlansSkeleton />;
  if (error) return <PlansError message={error} onRetry={refresh} />;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <Toaster position="top-right" richColors closeButton />

      {/* ── Page header ──────────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Planes</h1>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {plans.length}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Crea y gestiona planes de suscripcion para tus estudiantes
            </p>
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-amber-500 hover:bg-amber-600 self-start sm:self-auto"
          >
            <Plus size={14} />
            Crear plan
          </Button>
        </div>
      </FadeIn>

      {/* ── Stats summary ────────────────────────────── */}
      {plans.length > 0 && (
        <FadeIn delay={0.06}>
          <PlansStats plans={plans} />
        </FadeIn>
      )}

      {/* ── Plans Grid / Empty State ─────────────────── */}
      {plans.length === 0 ? (
        <PlansEmpty onCreate={() => setCreateOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedPlans.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onSetDefault={handleSetDefault}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* ── Footer ───────────────────────────────────── */}
      {plans.length > 0 && (
        <FadeIn delay={0.18}>
          <div className="flex justify-end">
            <button
              onClick={refreshPlans}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={10} />
              Refrescar planes
            </button>
          </div>
        </FadeIn>
      )}

      {/* ── Modals ───────────────────────────────────── */}
      <CreatePlanDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        institutionId={institutionId ?? ''}
        onRefresh={refreshPlans}
      />

      <EditPlanDialog
        plan={editTarget}
        open={editTarget !== null}
        onOpenChange={(v) => { if (!v) setEditTarget(null); }}
        onRefresh={refreshPlans}
      />

      <DeletePlanDialog
        plan={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        onRefresh={refreshPlans}
      />
    </div>
  );
}