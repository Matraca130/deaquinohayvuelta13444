// ============================================================
// Axon — Admin: Members Management
// PARALLEL-SAFE: This file is independent. Edit freely.
//
// CONTEXT (usePlatformData):
//   Reads:    members, institutionId, plans
//   Refresh:  refreshMembers (after CRUD)
//   Wrappers: inviteMember, removeMember, toggleMember, changeRole
//
// API DIRECT (import * as api from '@/app/services/platformApi'):
//   api.getAdminScopes(membershipId)          — scope filtering
//   api.getAdminStudents(instId, opts)         — paginated list
//   api.searchAdminStudents(instId, query)     — search
//   api.getAdminStudentDetail(instId, userId)  — detail view
//   api.toggleStudentStatus(memberId, active)  — status toggle
//   api.changeStudentPlan(memberId, planId)    — plan assignment
//   api.changeMemberPlan(memberId, planId)     — plan assignment
// ============================================================
import React from 'react';
import { PlaceholderPage } from '../../PlaceholderPage';
import { Users } from 'lucide-react';

export function AdminMembersPage() {
  return (
    <PlaceholderPage
      title="Gestion de Miembros"
      description="Administra profesores y estudiantes dentro de tu scope"
      icon={<Users size={22} />}
      accentColor="blue"
      features={[
        'Lista de miembros (filtrada por admin scope)',
        'Invitar nuevos miembros',
        'Editar roles',
        'Activar/desactivar',
        'Asignar a cursos',
      ]}
      backendRoutes={[
        'GET /server/members',
        'POST /server/members',
        'PUT /server/members/:userId',
        'GET /server/admin-scopes/my',
      ]}
    />
  );
}