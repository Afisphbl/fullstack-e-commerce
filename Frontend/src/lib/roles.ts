export const ADMIN_ROLES = ["admin"];

export const isAdminRole = (role?: string): boolean => {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
};
