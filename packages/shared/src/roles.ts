import type { Role } from './types';

export const ROLES: Role[] = ['ADMIN', 'INSPECTOR', 'USER'];

export function hasRole(userRole: Role, allowed: Role[]): boolean {
  return allowed.includes(userRole);
}

export function isAdmin(role: Role): boolean {
  return role === 'ADMIN';
}
