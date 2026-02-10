import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'

interface AdminRouteProps {
  children: React.ReactNode
  requiredPermissions?: import('../../contexts/AdminAuthContext').AdminPermission[]
  fallback?: React.ReactNode
}

/**
 * AdminRoute Component
 * 
 * Route guard for admin-only pages with optional permission requirements
 * 
 * Behavior:
 * 1. Loading: Shows loading spinner while admin auth loads
 * 2. Not Admin User: Redirects to access denied page
 * 3. Missing Permissions: Shows access denied message or fallback
 * 4. Authorized: Renders children
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredPermissions = [],
  fallback
}) => {
  const { adminUser, isLoading, hasPermission } = useAdminAuth()

  // 1. Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin access...</p>
        </div>
      </div>
    )
  }

  // 2. Not authenticated as admin user
  if (!adminUser) {
    return <Navigate to="/admin/access-denied" replace />
  }

  // 3. Check specific permissions if required
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )

    if (!hasAllPermissions) {
      if (fallback) {
        return <>{fallback}</>
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required permissions: {requiredPermissions.join(', ')}
            </p>
          </div>
        </div>
      )
    }
  }

  // 4. Authorized - render children
  return <>{children}</>
}
