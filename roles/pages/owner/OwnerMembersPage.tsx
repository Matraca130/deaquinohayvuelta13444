// ============================================================
// Axon — Owner: Members Management
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    members, institutionId, plans
//   Refresh:  refreshMembers (after plan change)
//   Wrappers: inviteMember, removeMember, toggleMember, changeRole
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.changeMemberPlan(memberId, planId)
// ============================================================

import React, { useState, useMemo, useCallback } from 'react';
import { usePlatformData } from '@/app/context/PlatformDataContext';
import { useAuth } from '@/app/context/AuthContext';
import * as api from '@/app/services/platformApi';
import { motion, AnimatePresence } from 'motion/react';
import {
  getInitials, formatDate, matchesSearch,
} from '@/app/components/shared/page-helpers';
import { toast, Toaster } from 'sonner';

// UI Components
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/app/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/app/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/app/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/app/components/ui/dropdown-menu';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/app/components/ui/select';

// Icons
import {
  Users, UserPlus, Search, MoreHorizontal, Shield, Crown,
  BookOpen, GraduationCap, Trash2, ToggleLeft, ToggleRight,
  ArrowUpDown, AlertCircle, RefreshCw,
  Loader2, CheckCircle2, CreditCard,
} from 'lucide-react';

// Types
import type { MemberListItem, MembershipRole, CreateMemberPayload, InstitutionPlan } from '@/app/types/platform';

// ── Constants ─────────────────────────────────────────────

type RoleFilter = MembershipRole | 'all';

const ROLE_CONFIG: Record<MembershipRole, {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
  color: string;
}> = {
  owner:     { label: 'Owner',     icon: <Crown size={12} />,          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',   color: '#f59e0b' },
  admin:     { label: 'Admin',     icon: <Shield size={12} />,         badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',       color: '#3b82f6' },
  professor: { label: 'Profesor',  icon: <BookOpen size={12} />,       badgeClass: 'bg-purple-50 text-purple-700 border-purple-200', color: '#8b5cf6' },
  student:   { label: 'Estudiante', icon: <GraduationCap size={12} />, badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',       color: '#14b8a6' },
};

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all',       label: 'Todos' },
  { value: 'owner',     label: 'Owners' },
  { value: 'admin',     label: 'Admins' },
  { value: 'professor', label: 'Profesores' },
  { value: 'student',   label: 'Estudiantes' },
];

const ASSIGNABLE_ROLES: MembershipRole[] = ['admin', 'professor', 'student'];

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

function MembersSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6" aria-label="Cargando miembros">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-2.5 w-48" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────

function MembersError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-6 lg:p-8">
      <FadeIn>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar miembros</h2>
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

function MembersEmpty({ onInvite }: { onInvite: () => void }) {
  return (
    <FadeIn>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <Users size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin miembros registrados</h3>
        <p className="text-sm text-gray-500 mb-6">Invita administradores, profesores y estudiantes a tu institucion</p>
        <Button onClick={onInvite} className="gap-2 bg-amber-500 hover:bg-amber-600">
          <UserPlus size={14} />
          Invitar primer miembro
        </Button>
      </div>
    </FadeIn>
  );
}

// ── No search results ─────────────────────────────────────

function NoResults({ query, role }: { query: string; role: RoleFilter }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-3">
        <Search size={20} />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Sin resultados</h3>
      <p className="text-xs text-gray-400">
        {query
          ? `No se encontraron miembros para "${query}"`
          : `No hay miembros con el rol "${ROLE_FILTERS.find(f => f.value === role)?.label}"`
        }
      </p>
    </div>
  );
}

// ── Invite Member Dialog ──────────────────────────────────

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: InstitutionPlan[];
  institutionId: string;
  onInvite: (data: CreateMemberPayload) => Promise<MemberListItem>;
}

function InviteMemberDialog({ open, onOpenChange, plans, institutionId, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<MembershipRole>('student');
  const [planId, setPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const activePlans = useMemo(() => plans.filter(p => p.is_active), [plans]);

  const resetForm = useCallback(() => {
    setEmail('');
    setName('');
    setRole('student');
    setPlanId('');
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('El email es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateMemberPayload = {
        email: email.trim(),
        name: name.trim() || undefined,
        institution_id: institutionId,
        role,
        institution_plan_id: planId || undefined,
      };
      await onInvite(payload);
      toast.success(`Miembro "${email.trim()}" invitado exitosamente`);
      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al invitar miembro: ${message}`);
      console.error('[InviteMemberDialog] invite error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) { onOpenChange(v); if (!v) resetForm(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} className="text-amber-500" />
            Invitar miembro
          </DialogTitle>
          <DialogDescription>
            Agrega un nuevo miembro a tu institucion
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email *</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="usuario@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Nombre</Label>
            <Input
              id="invite-name"
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MembershipRole)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    <span className="flex items-center gap-2">
                      {ROLE_CONFIG[r].icon}
                      {ROLE_CONFIG[r].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plan (optional, only for students) */}
          {role === 'student' && activePlans.length > 0 && (
            <div className="space-y-1.5">
              <Label>Plan (opcional)</Label>
              <Select value={planId} onValueChange={setPlanId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin plan asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin plan</SelectItem>
                  {activePlans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <CreditCard size={12} className="text-gray-400" />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { onOpenChange(false); resetForm(); }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-amber-500 hover:bg-amber-600">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {loading ? 'Invitando...' : 'Invitar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Change Role Dialog ────────────────────────────────────

interface ChangeRoleDialogProps {
  member: MemberListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeRole: (memberId: string, role: MembershipRole) => Promise<void>;
}

function ChangeRoleDialog({ member, open, onOpenChange, onChangeRole }: ChangeRoleDialogProps) {
  const [newRole, setNewRole] = useState<MembershipRole>('student');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (member) setNewRole(member.role);
  }, [member]);

  const handleSubmit = async () => {
    if (!member || newRole === member.role) {
      onOpenChange(false);
      return;
    }
    setLoading(true);
    try {
      await onChangeRole(member.id, newRole);
      toast.success(`Rol de "${member.name || member.email}" cambiado a ${ROLE_CONFIG[newRole].label}`);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al cambiar rol: ${message}`);
      console.error('[ChangeRoleDialog] error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-blue-500" />
            Cambiar rol
          </DialogTitle>
          <DialogDescription>
            {member?.name || member?.email || 'Miembro'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {ASSIGNABLE_ROLES.map((r) => {
            const cfg = ROLE_CONFIG[r];
            const selected = newRole === r;
            return (
              <button
                key={r}
                onClick={() => setNewRole(r)}
                disabled={loading}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selected
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.badgeClass}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
                </div>
                {selected && <CheckCircle2 size={16} className="text-blue-500" />}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || newRole === member?.role}
            className="gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Cambiar rol
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Change Plan Dialog ────────────────────────────────────

interface ChangePlanDialogProps {
  member: MemberListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: InstitutionPlan[];
  onRefresh: () => Promise<void>;
}

function ChangePlanDialog({ member, open, onOpenChange, plans, onRefresh }: ChangePlanDialogProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const activePlans = useMemo(() => plans.filter(p => p.is_active), [plans]);

  React.useEffect(() => {
    if (member) setSelectedPlanId(member.institution_plan_id ?? '');
  }, [member]);

  const handleSubmit = async () => {
    if (!member) return;
    setLoading(true);
    try {
      await api.changeMemberPlan(member.id, selectedPlanId || null);
      await onRefresh();
      const planName = activePlans.find(p => p.id === selectedPlanId)?.name ?? 'Sin plan';
      toast.success(`Plan de "${member.name || member.email}" cambiado a "${planName}"`);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al cambiar plan: ${message}`);
      console.error('[ChangePlanDialog] error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={16} className="text-amber-500" />
            Cambiar plan
          </DialogTitle>
          <DialogDescription>
            {member?.name || member?.email || 'Miembro'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 py-2">
          <Label>Plan</Label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Sin plan asignado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin plan</SelectItem>
              {activePlans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                  {p.price_cents > 0 && (
                    <span className="text-gray-400 ml-1">
                      (${(p.price_cents / 100).toFixed(2)})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation Dialog ────────────────────────────

interface DeleteDialogProps {
  member: MemberListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (memberId: string) => Promise<void>;
}

function DeleteMemberDialog({ member, open, onOpenChange, onDelete }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!member) return;
    setLoading(true);
    try {
      await onDelete(member.id);
      toast.success(`"${member.name || member.email}" eliminado de la institucion`);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al eliminar miembro: ${message}`);
      console.error('[DeleteMemberDialog] error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar miembro</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estas seguro de que quieres eliminar a{' '}
            <span className="font-semibold text-gray-900">{member?.name || member?.email || 'este miembro'}</span>
            {' '}de la institucion? Esta accion no se puede deshacer.
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

// ── Member Row Actions ────────────────────────────────────

interface MemberActionsProps {
  member: MemberListItem;
  currentUserId: string | undefined;
  onToggle: (memberId: string, active: boolean) => Promise<void>;
  onOpenChangeRole: (member: MemberListItem) => void;
  onOpenChangePlan: (member: MemberListItem) => void;
  onOpenDelete: (member: MemberListItem) => void;
}

function MemberActions({
  member, currentUserId, onToggle,
  onOpenChangeRole, onOpenChangePlan, onOpenDelete,
}: MemberActionsProps) {
  const [toggling, setToggling] = useState(false);
  const isSelf = member.user_id === currentUserId;

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(member.id, !member.is_active);
      toast.success(`${member.name || 'Miembro'} ${!member.is_active ? 'activado' : 'desactivado'}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al cambiar estado: ${message}`);
    } finally {
      setToggling(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Acciones del miembro">
          <MoreHorizontal size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-gray-400">Acciones</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => onOpenChangeRole(member)}
          disabled={isSelf}
        >
          <ArrowUpDown size={14} />
          Cambiar rol
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onOpenChangePlan(member)}>
          <CreditCard size={14} />
          Cambiar plan
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleToggle}
          disabled={toggling || isSelf}
        >
          {member.is_active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
          {toggling ? 'Cambiando...' : member.is_active ? 'Desactivar' : 'Activar'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => onOpenDelete(member)}
          disabled={isSelf}
        >
          <Trash2 size={14} />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Main Component ────────────────────────────────────────

export function OwnerMembersPage() {
  const {
    members,
    plans,
    institutionId,
    loading,
    error,
    refresh,
    refreshMembers,
    inviteMember,
    removeMember,
    toggleMember,
    changeRole,
  } = usePlatformData();

  const { user } = useAuth();

  // ── Local state ─────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [changeRoleTarget, setChangeRoleTarget] = useState<MemberListItem | null>(null);
  const [changePlanTarget, setChangePlanTarget] = useState<MemberListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemberListItem | null>(null);

  // ── Filtered members ────────────────────────────────
  const filteredMembers = useMemo(() => {
    return members
      .filter(m => roleFilter === 'all' || m.role === roleFilter)
      .filter(m => matchesSearch(m, searchQuery))
      .sort((a, b) => {
        // Sort: active first, then by name
        if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
        return (a.name ?? '').localeCompare(b.name ?? '');
      });
  }, [members, roleFilter, searchQuery]);

  // ── Role counts for filter badges ───────────────────
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: members.length };
    for (const m of members) {
      counts[m.role] = (counts[m.role] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  // ── Render states ─────────────────────────────────────
  if (loading) return <MembersSkeleton />;
  if (error) return <MembersError message={error} onRetry={refresh} />;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <Toaster position="top-right" richColors closeButton />

      {/* ── Page header ──────────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Users size={18} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Miembros</h1>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {members.length}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Gestiona administradores, profesores y estudiantes de tu institucion
            </p>
          </div>

          <Button
            onClick={() => setInviteOpen(true)}
            className="gap-2 bg-amber-500 hover:bg-amber-600 self-start sm:self-auto"
          >
            <UserPlus size={14} />
            Invitar miembro
          </Button>
        </div>
      </FadeIn>

      {/* ── Toolbar: Search + Role Filters ───────────── */}
      <FadeIn delay={0.06}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Role filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {ROLE_FILTERS.map((f) => {
              const count = roleCounts[f.value] ?? 0;
              const active = roleFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setRoleFilter(f.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {f.label}
                  <span className={`tabular-nums ${active ? 'text-gray-300' : 'text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* ── Members Table / Empty States ──────────────── */}
      <FadeIn delay={0.12}>
        {members.length === 0 ? (
          <MembersEmpty onInvite={() => setInviteOpen(true)} />
        ) : filteredMembers.length === 0 ? (
          <NoResults query={searchQuery} role={roleFilter} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-gray-50/50">
                  <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider pl-6">
                    Miembro
                  </TableHead>
                  <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                    Rol
                  </TableHead>
                  <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider hidden md:table-cell">
                    Plan
                  </TableHead>
                  <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider hidden lg:table-cell">
                    Registro
                  </TableHead>
                  <TableHead className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-right pr-6 w-12">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredMembers.map((member) => {
                    const roleCfg = ROLE_CONFIG[member.role];
                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`border-b border-gray-50 transition-colors hover:bg-gray-50/50 ${
                          !member.is_active ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Member info */}
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback
                                className="text-[11px] font-semibold"
                                style={{
                                  backgroundColor: `${roleCfg.color}15`,
                                  color: roleCfg.color,
                                }}
                              >
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {member.name || 'Sin nombre'}
                                {member.user_id === user?.id && (
                                  <span className="ml-1.5 text-[10px] font-bold text-amber-500">(tu)</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{member.email || '—'}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell className="hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${roleCfg.badgeClass}`}>
                            {roleCfg.icon}
                            {roleCfg.label}
                          </span>
                        </TableCell>

                        {/* Plan */}
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-gray-600 truncate block max-w-[140px]">
                            {member.plan?.name ?? (
                              <span className="text-gray-300 italic">Sin plan</span>
                            )}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="hidden sm:table-cell">
                          {member.is_active ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              Inactivo
                            </span>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-gray-500">{formatDate(member.created_at)}</span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6">
                          <MemberActions
                            member={member}
                            currentUserId={user?.id}
                            onToggle={toggleMember}
                            onOpenChangeRole={setChangeRoleTarget}
                            onOpenChangePlan={setChangePlanTarget}
                            onOpenDelete={setDeleteTarget}
                          />
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>

            {/* Footer count */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Mostrando <span className="font-semibold text-gray-600">{filteredMembers.length}</span>
                {filteredMembers.length !== members.length && (
                  <> de <span className="font-semibold text-gray-600">{members.length}</span></>
                )}{' '}
                miembros
              </p>
              <button
                onClick={refreshMembers}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={10} />
                Refrescar
              </button>
            </div>
          </div>
        )}
      </FadeIn>

      {/* ── Modals ───────────────────────────────────── */}
      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        plans={plans}
        institutionId={institutionId ?? ''}
        onInvite={inviteMember}
      />

      <ChangeRoleDialog
        member={changeRoleTarget}
        open={changeRoleTarget !== null}
        onOpenChange={(v) => { if (!v) setChangeRoleTarget(null); }}
        onChangeRole={changeRole}
      />

      <ChangePlanDialog
        member={changePlanTarget}
        open={changePlanTarget !== null}
        onOpenChange={(v) => { if (!v) setChangePlanTarget(null); }}
        plans={plans}
        onRefresh={refreshMembers}
      />

      <DeleteMemberDialog
        member={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        onDelete={removeMember}
      />
    </div>
  );
}