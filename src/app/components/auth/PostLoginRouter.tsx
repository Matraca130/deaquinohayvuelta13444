// ============================================================
// Axon — Post-Login Router
// After authentication, redirects user to the correct area
// based on their membership role(s).
//
// BUG FIX: If memberships is [] (fetch failed), we now show
// a diagnostic screen with retry instead of silently routing
// to /student.
// ============================================================
import React, { useState, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { restoreSession } from '@/app/services/authApi';
import { AlertTriangle, RefreshCw, LogOut, Loader2 } from 'lucide-react';

/** Map role → default landing route */
const ROLE_ROUTES: Record<string, string> = {
  owner: '/professor',
  admin: '/professor',
  professor: '/professor',
  student: '/student',
};

export function PostLoginRouter() {
  const { status, user, memberships, activeMembership, signOut } = useAuth();
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await restoreSession();
      if (res.success && res.data && res.data.memberships.length > 0) {
        // Force page reload to let AuthContext re-initialize with new data
        window.location.href = '/';
      }
    } catch (err) {
      console.error('[PostLoginRouter] Retry failed:', err);
    }
    setRetrying(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/login', { replace: true });
  }, [signOut, navigate]);

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // ── No memberships: show diagnostic instead of silent /student redirect ──
  if (memberships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-amber-500" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Nenhuma membership encontrada
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Login foi bem-sucedido como <strong>{user?.email}</strong>, mas o
            servidor nao retornou memberships. Isso pode significar que o
            endpoint <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/memberships</code> falhou
            ou que este usuario ainda nao tem vinculo com nenhuma instituicao.
          </p>

          <div className="bg-gray-50 rounded-lg p-3 text-left text-xs text-gray-500 mb-6 font-mono">
            <p>User ID: {user?.id || '—'}</p>
            <p>Email: {user?.email || '—'}</p>
            <p>Memberships: {memberships.length}</p>
            <p className="text-amber-600 mt-1">
              Verifique o console (F12) para detalhes do erro.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all"
            >
              {retrying ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {retrying ? 'Tentando...' : 'Tentar novamente'}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user has multiple memberships and hasn't selected one, show picker
  if (memberships.length > 1 && !activeMembership) {
    return <Navigate to="/select-role" replace />;
  }

  // Single membership or already selected — route by role
  const role = activeMembership?.role || memberships[0]?.role || 'student';
  const route = ROLE_ROUTES[role] || '/student';

  console.log(`[PostLoginRouter] Routing to ${route} (role: ${role}, memberships: ${memberships.length})`);

  return <Navigate to={route} replace />;
}
