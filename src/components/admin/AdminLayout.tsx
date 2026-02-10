import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  History, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { AdminPermission } from '../../types/admin'
import { MilitaryPageLayout } from '../layout/MilitaryPageLayout'

interface AdminLayoutProps {
  children?: React.ReactNode
}

/**
 * AdminLayout Component
 * 
 * Provides the admin interface shell with:
 * - Sidebar navigation with permission-based menu items
 * - Header with user info and logout
 * - Responsive design with mobile menu
 * - Breadcrumb support
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, hasPermission } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Navigation items with permission requirements
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      requiredPermissions: [] // Always visible to admins
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      requiredPermissions: [] // Always visible to admins
    },
    {
      name: 'Article Management',
      href: '/admin/articles',
      icon: FileText,
      requiredPermissions: [AdminPermission.VIEW_ARTICLES]
    },
    {
      name: 'Audit Log',
      href: '/admin/audit',
      icon: History,
      requiredPermissions: [AdminPermission.VIEW_AUDIT_LOG]
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      requiredPermissions: [AdminPermission.MANAGE_SYSTEM]
    }
  ]

  // Filter navigation items based on permissions
  const visibleNavItems = navigationItems.filter(item => 
    item.requiredPermissions.length === 0 || 
    item.requiredPermissions.every(permission => hasPermission(permission))
  )

  const handleLogout = async () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <MilitaryPageLayout 
      title={<h2>QUẢN TRỊ HỆ THỐNG</h2>}
      className="admin-layout"
      disableTopIcons={true}
    >
      <div className="admin-layout-wrapper">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          </div>
        )}

        {/* Sidebar */}
        <div className={`
          admin-sidebar
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}>
          {/* Sidebar Header */}
          <div className="admin-sidebar-header">
            <div className="flex items-center space-x-3">
              <div className="admin-shield-icon">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="admin-panel-title">Admin Panel</h1>
                <p className="admin-panel-subtitle">System Management</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden admin-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="admin-nav">
            <div className="admin-nav-items">
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="admin-nav-item"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </a>
                )
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="admin-user-section">
            <div className="admin-user-info">
              <div className="admin-user-avatar">
                <span className="text-sm font-medium">
                  {adminUser?.displayName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="admin-user-name">
                  {adminUser?.displayName}
                </p>
                <p className="admin-user-role">
                  {adminUser?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main-wrapper">
          {/* Top Header */}
          <header className="admin-header">
            <div className="admin-header-content">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden admin-menu-btn"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Header content */}
              <div className="admin-header-title">
                <h1>Admin Dashboard</h1>
              </div>
              
              {/* User info */}
              <div className="admin-header-user">
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="admin-header-avatar">
                    <span className="text-sm font-medium">
                      {adminUser?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="admin-header-name">
                      {adminUser?.displayName}
                    </p>
                    <p className="admin-header-role">
                      {adminUser?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="admin-main">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </MilitaryPageLayout>
  )
}
