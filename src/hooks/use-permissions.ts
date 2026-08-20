import { useAuth } from '../providers/auth-provider';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions, getRolePermissions, canManageRole } from '../lib/permissions';

/**
 * Custom hook for checking permissions based on current user's role
 */
export function usePermissions() {
  const { user } = useAuth();
  const userRole = user?.role || 'employee';

  return {
    /**
     * Check if current user has a specific permission
     */
    can: (permission: Permission) => {
      return hasPermission(userRole, permission);
    },

    /**
     * Check if current user has any of the specified permissions
     */
    canAny: (permissions: Permission[]) => {
      return hasAnyPermission(userRole, permissions);
    },

    /**
     * Check if current user has all of the specified permissions
     */
    canAll: (permissions: Permission[]) => {
      return hasAllPermissions(userRole, permissions);
    },

    /**
     * Get all permissions for current user's role
     */
    getPermissions: () => {
      return getRolePermissions(userRole);
    },

    /**
     * Check if current user can manage users with a specific role
     */
    canManageRole: (targetRole: string) => {
      return canManageRole(userRole, targetRole as any);
    },

    /**
     * Get current user's role
     */
    role: userRole,

    /**
     * Check if current user is super admin
     */
    isSuperAdmin: userRole === 'super_admin',

    /**
     * Check if current user is asset manager
     */
    isAssetManager: userRole === 'asset_manager',

    /**
     * Check if current user is employee
     */
    isEmployee: userRole === 'employee',
  };
}
