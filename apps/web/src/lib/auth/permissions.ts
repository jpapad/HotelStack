import type { User, UserRole } from './types';

export type Permission =
  | 'VIEW_DASHBOARD'
  | 'VIEW_RESERVATIONS'
  | 'EDIT_RESERVATIONS'
  | 'VIEW_ROOMS'
  | 'VIEW_AVAILABILITY'
  | 'VIEW_HOUSEKEEPING'
  | 'UPDATE_HOUSEKEEPING'
  | 'VIEW_REPORTS'
  | 'EDIT_FOLIO';

const rolePermissions: Record<UserRole, Permission[]> = {
  RECEPTION: ['VIEW_DASHBOARD', 'VIEW_RESERVATIONS', 'EDIT_RESERVATIONS', 'VIEW_ROOMS', 'VIEW_AVAILABILITY', 'EDIT_FOLIO'],
  HOUSEKEEPING: ['VIEW_DASHBOARD', 'VIEW_HOUSEKEEPING', 'UPDATE_HOUSEKEEPING', 'VIEW_ROOMS'],
  MANAGER: [
    'VIEW_DASHBOARD',
    'VIEW_RESERVATIONS',
    'EDIT_RESERVATIONS',
    'VIEW_ROOMS',
    'VIEW_AVAILABILITY',
    'VIEW_HOUSEKEEPING',
    'UPDATE_HOUSEKEEPING',
    'VIEW_REPORTS',
    'EDIT_FOLIO',
  ],
};

export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  return rolePermissions[user.role].includes(permission);
}
