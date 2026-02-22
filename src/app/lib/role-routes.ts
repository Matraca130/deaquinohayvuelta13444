// ============================================================
// Axon — Role → Route mapping (single source of truth)
// Used by PostLoginRouter and SelectRolePage
// ============================================================

/** Map membership role → default landing route */
export const ROLE_ROUTES: Record<string, string> = {
  owner: '/professor',
  admin: '/professor',
  professor: '/professor',
  student: '/student',
};
