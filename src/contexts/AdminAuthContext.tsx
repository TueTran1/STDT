import React, { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'

// Explicit admin permission constants
export const AdminPermission = {
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DEACTIVATE_USERS: 'deactivate_users',
  DELETE_USERS: 'delete_users',
  VIEW_ARTICLES: 'view_articles',
  DELETE_ARTICLES: 'delete_articles',
  VIEW_AUDIT_LOG: 'view_audit_log',
  MANAGE_SYSTEM: 'manage_system'
} as const

export type AdminPermission = typeof AdminPermission[keyof typeof AdminPermission]

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  admin: [
    AdminPermission.VIEW_USERS,
    AdminPermission.CREATE_USERS,
    AdminPermission.UPDATE_USERS,
    AdminPermission.DEACTIVATE_USERS,
    AdminPermission.DELETE_USERS,
    AdminPermission.VIEW_ARTICLES,
    AdminPermission.DELETE_ARTICLES,
    AdminPermission.VIEW_AUDIT_LOG,
    AdminPermission.MANAGE_SYSTEM
  ],
  super_admin: [
    AdminPermission.VIEW_USERS,
    AdminPermission.CREATE_USERS,
    AdminPermission.UPDATE_USERS,
    AdminPermission.DEACTIVATE_USERS,
    AdminPermission.DELETE_USERS,
    AdminPermission.VIEW_ARTICLES,
    AdminPermission.DELETE_ARTICLES,
    AdminPermission.VIEW_AUDIT_LOG,
    AdminPermission.MANAGE_SYSTEM
  ]
} as const

type AdminRole = keyof typeof ROLE_PERMISSIONS

interface AdminUser {
  uid: string
  email: string
  displayName: string
  role: AdminRole
  permissions: readonly AdminPermission[]
}

interface AdminAuthContextType {
  // Admin user state
  adminUser: AdminUser | null
  isAdmin: boolean
  isLoading: boolean
  
  // Permission checking
  hasPermission: (permission: AdminPermission) => boolean
  hasAnyPermission: (permissions: AdminPermission[]) => boolean
  hasAllPermissions: (permissions: AdminPermission[]) => boolean
  
  // Role checking
  hasRole: (role: AdminRole) => boolean
  
  // Guard functions
  requirePermission: (permission: AdminPermission) => { allowed: boolean; reason?: string }
  requireRole: (role: AdminRole) => { allowed: boolean; reason?: string }
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

interface AdminAuthProviderProps {
  children: React.ReactNode
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  
  // Transform auth user to admin user
  const adminUser = useMemo(() => {
    if (!user || !user.isActive) {
      return null
    }
    
    // Only users with admin roles can be admin users
    if (user.role !== 'admin' && user.role !== 'editor') {
      return null
    }
    
    // Map user roles to admin roles
    // For now, only 'admin' auth role maps to admin system
    // Could be extended to support multiple admin levels
    const adminRole: AdminRole = 'admin' // Default to admin role
    
    const permissions = ROLE_PERMISSIONS[adminRole]
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: adminRole,
      permissions
    }
  }, [user])
  
  const isAdmin = Boolean(adminUser)
  const isLoading = authLoading
  
  // Permission checking functions
  const hasPermission = (permission: AdminPermission): boolean => {
    return adminUser?.permissions.includes(permission) ?? false
  }
  
  const hasAnyPermission = (permissions: AdminPermission[]): boolean => {
    if (!adminUser) return false
    return permissions.some(permission => adminUser.permissions.includes(permission))
  }
  
  const hasAllPermissions = (permissions: AdminPermission[]): boolean => {
    if (!adminUser) return false
    return permissions.every(permission => adminUser.permissions.includes(permission))
  }
  
  const hasRole = (role: AdminRole): boolean => {
    return adminUser?.role === role
  }
  
  const requirePermission = (permission: AdminPermission): { allowed: boolean; reason?: string } => {
    if (!adminUser) {
      return { allowed: false, reason: 'Not authenticated as admin user' }
    }
    
    if (!adminUser.permissions.includes(permission)) {
      return { allowed: false, reason: `Missing required permission: ${permission}` }
    }
    
    return { allowed: true }
  }
  
  const requireRole = (role: AdminRole): { allowed: boolean; reason?: string } => {
    if (!adminUser) {
      return { allowed: false, reason: 'Not authenticated as admin user' }
    }
    
    if (adminUser.role !== role) {
      return { allowed: false, reason: `Required role: ${role}, current role: ${adminUser.role}` }
    }
    
    return { allowed: true }
  }
  
  const value: AdminAuthContextType = {
    adminUser,
    isAdmin,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    requirePermission,
    requireRole
  }
  
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
