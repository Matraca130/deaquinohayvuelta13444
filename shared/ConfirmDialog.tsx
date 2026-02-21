// ============================================================
// Axon — ConfirmDialog (reusable confirmation dialog)
//
// IMPORT: import { ConfirmDialog } from '@/app/components/shared/ConfirmDialog';
//
// Usage:
//   <ConfirmDialog
//     open={showDelete}
//     onOpenChange={setShowDelete}
//     title="Eliminar miembro"
//     description="Esta accion no se puede deshacer."
//     confirmLabel="Eliminar"
//     variant="destructive"
//     loading={deleting}
//     onConfirm={handleDelete}
//   />
// ============================================================

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/app/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Open state change handler */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description / warning */
  description: string;
  /** Confirm button label (default: "Confirmar") */
  confirmLabel?: string;
  /** Cancel button label (default: "Cancelar") */
  cancelLabel?: string;
  /** Button variant (default: "destructive") */
  variant?: 'destructive' | 'default';
  /** Loading state — disables buttons and shows spinner */
  loading?: boolean;
  /** Confirm callback */
  onConfirm: () => void;
  /** Optional extra content (e.g., a warning banner) */
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'destructive',
  loading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className={
              variant === 'destructive'
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                : ''
            }
          >
            {loading && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
