import { UserRole } from '../api/auth';

// Permission definitions based on backend RBAC
export type Permission =
  // User Management
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  // Employee Management
  | 'employees:read'
  | 'employees:create'
  | 'employees:update'
  | 'employees:delete'
  | 'employees:manage_access'
  // Asset Management
  | 'assets:read'
  | 'assets:create'
  | 'assets:update'
  | 'assets:delete'
  | 'assets:assign'
  | 'assets:return'
  // Assignment Management
  | 'assignments:read'
  | 'assignments:create'
  | 'assignments:update'
  | 'assignments:delete'
  // Maintenance Management
  | 'maintenance:read'
  | 'maintenance:create'
  | 'maintenance:update'
  | 'maintenance:delete'
  // Reports
  | 'reports:read'
  | 'reports:download'
  // Audit Logs
  | 'audit:read'
  // Profile
  | 'profile:read'
  | 'profile:update';

// Role-based permission matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // User Management - Full access
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    // Employee Management - Full access
    'employees:read',
    'employees:create',
    'employees:update',
    'employees:delete',
    'employees:manage_access',
    // Asset Management - Full access
    'assets:read',
    'assets:create',
    'assets:update',
    'assets:delete',
    'assets:assign',
    'assets:return',
    // Assignment Management - Full access
    'assignments:read',
    'assignments:create',
    'assignments:update',
    'assignments:delete',
    // Maintenance Management - Full access
    'maintenance:read',
    'maintenance:create',
    'maintenance:update',
    'maintenance:delete',
    // Reports - Full access
    'reports:read',
    'reports:download',
    // Audit Logs - Full access
    'audit:read',
    // Profile - Full access
    'profile:read',
    'profile:update',
  ],
  asset_manager: [
    // User Management - Read only
    'users:read',
    // Employee Management - Read and update, no delete
    'employees:read',
    'employees:update',
    // Asset Management - Full access except delete
    'assets:read',
    'assets:create',
    'assets:update',
    'assets:assign',
    'assets:return',
    // Assignment Management - Full access
    'assignments:read',
    'assignments:create',
    'assignments:update',
    // Maintenance Management - Full access
    'maintenance:read',
    'maintenance:create',
    'maintenance:update',
    // Reports - Read and download
    'reports:read',
    'reports:download',
    // Profile - Full access
    'profile:read',
    'profile:update',
  ],
  employee: [
    // Profile - Read and update own profile
    'profile:read',
    'profile:update',
    // Assets - Read only (assigned to them)
    'assets:read',
    // Assignments - Read only (their assignments)
    'assignments:read',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Role hierarchy for checking if one role can access another role's resources
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 3,
  asset_manager: 2,
  employee: 1,
};

/**
 * Check if a role has higher or equal level than another role
 */
export function hasRoleLevelOrHigher(role: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[targetRole];
}

/**
 * Check if a role can manage users with a specific role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  // Super admins can manage everyone
  if (managerRole === 'super_admin') return true;
  
  // Asset managers can manage employees but not other asset managers or super admins
  if (managerRole === 'asset_manager') {
    return targetRole === 'employee';
  }
  
  // Employees cannot manage anyone
  return false;
}
