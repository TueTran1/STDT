import React from 'react'
import { useAdminAuth, AdminPermission } from '../../contexts/AdminAuthContext'
import { AdminRoute } from '../../components/admin/AdminRoute'
import { UserManagementSection } from '../../components/admin/UserManagementSection'
import { ArticleManagementSection } from '../../components/admin/ArticleManagementSection'
import { SystemOverviewSection } from '../../components/admin/SystemOverviewSection'
import { AuditLogSection } from '../../components/admin/AuditLogSection'

/**
 * Admin Dashboard Page
 * 
 * Main admin interface with role-based section visibility:
 * - All admins can see user management and system overview
 * - Article management requires VIEW_ARTICLES permission
 * - Audit log requires VIEW_AUDIT_LOG permission
 */
export const AdminDashboard: React.FC = () => {
  const { adminUser, hasPermission } = useAdminAuth()

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin access required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {adminUser.displayName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Role: <span className="font-medium text-gray-900">{adminUser.role}</span>
              </span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {adminUser.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* System Overview - Always visible to admins */}
          <SystemOverviewSection />

          {/* User Management - Always visible to admins */}
          <UserManagementSection />

          {/* Article Management - Requires VIEW_ARTICLES permission */}
          {hasPermission(AdminPermission.VIEW_ARTICLES) && (
            <AdminRoute requiredPermissions={[AdminPermission.VIEW_ARTICLES]}>
              <ArticleManagementSection />
            </AdminRoute>
          )}

          {/* Audit Log - Requires VIEW_AUDIT_LOG permission */}
          {hasPermission(AdminPermission.VIEW_AUDIT_LOG) && (
            <AdminRoute requiredPermissions={[AdminPermission.VIEW_AUDIT_LOG]}>
              <AuditLogSection />
            </AdminRoute>
          )}

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
