'use client';

import { ReactNode } from 'react';
import { usePermissions } from '../../hooks/use-permissions';
import { Permission } from '../../lib/permissions';

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component to conditionally render children based on user permissions
 * 
 * Usage:
 * <PermissionGuard permission="users:create">
 *   <Button>Create User</Button>
 * </PermissionGuard>
 * 
 * <PermissionGuard permissions={['users:update', 'users:delete']} requireAll={false}>
 *   <Button>Manage Users</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  } else {
    // No permissions specified, allow access
    hasAccess = true;
  }

  return <>{hasAccess ? children : fallback}</>;
}

interface RoleGuardProps {
  allowedRoles?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component to conditionally render children based on user role
 * 
 * Usage:
 * <RoleGuard allowedRoles={['super_admin', 'asset_manager']}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({
  allowedRoles = [],
  fallback = null,
  children,
}: RoleGuardProps) {
  const { role } = usePermissions();

  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(role);

  return <>{hasAccess ? children : fallback}</>;
}
