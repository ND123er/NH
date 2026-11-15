// API user.role is authoritative; support legacy is_admin users for compatibility.
export const isAdminUser = (user) =>
  ["owner", "admin"].includes(String(user?.role || "").toLowerCase()) ||
  user?.is_admin === true || user?.isAdmin === true;
