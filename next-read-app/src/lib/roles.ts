export const ADMIN_ROLE = "admin";

export function normalizeRole(role: unknown) {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

export function isAdminRole(role: unknown) {
  return normalizeRole(role) === ADMIN_ROLE;
}
