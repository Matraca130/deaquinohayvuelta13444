// ============================================================
// Axon — Route Guard: Requires specific role
// Redirects to /select-role if user doesn't have the role
// ============================================================
import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';

interface RequireRoleProps {
  roles: string[];
}

export function RequireRole({ roles }: RequireRoleProps) {
  const { activeMembership } = useAuth();

  if (!activeMembership) {
    return <Navigate to="/select-role" replace />;
  }

  if (!roles.includes(activeMembership.role)) {
    // User has a membership but not the right role for this area
    return <Navigate to="/select-role" replace />;
  }

  return <Outlet />;
}
