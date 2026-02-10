import React from 'react'
import { PageContainer } from '../../shared/PageContainer'
import { cn } from '../../../utils/cn'

interface AdminPageWrapperProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/**
 * Admin page wrapper that enforces consistent layout and styling.
 * Reuses existing app layout patterns with military theme.
 */
export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({
  children,
  title,
  subtitle,
  className,
  maxWidth = 'full'
}) => {
  return (
    <PageContainer maxWidth={maxWidth} className={className}>
      {/* Page Header - follows existing app pattern */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {subtitle && (
            <p className="admin-page-subtitle">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="admin-page-content">
        {children}
      </div>
    </PageContainer>
  )
}

interface AdminSectionProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  noPadding?: boolean
}

/**
 * AdminSection Component
 * 
 * Enforces consistent section styling within admin pages
 * Uses military-themed styling instead of generic Tailwind
 */
export const AdminSection: React.FC<AdminSectionProps> = ({
  children,
  title,
  subtitle,
  className,
  noPadding = false
}) => {
  return (
    <div className={cn(
      'admin-section',
      noPadding ? 'admin-section-no-padding' : '',
      className
    )}>
      {(title || subtitle) && (
        <div className={cn('admin-section-header', noPadding ? 'admin-section-header-no-padding' : '')}>
          {title && (
            <h2 className="admin-section-title">{title}</h2>
          )}
          {subtitle && (
            <p className="admin-section-subtitle">{subtitle}</p>
          )}
        </div>
      )}
      {noPadding ? (
        <div className="admin-section-content-no-padding">
          {children}
        </div>
      ) : (
        <div className="admin-section-content">
          {children}
        </div>
      )}
    </div>
  )
}

interface AdminGridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  className?: string
}

/**
 * AdminGrid Component
 * 
 * Enforces consistent grid layouts for admin cards
 * Reuses existing grid patterns
 */
export const AdminGrid: React.FC<AdminGridProps> = ({
  children,
  cols = 1,
  className
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn('grid', gridClasses[cols], 'gap-6', className)}>
      {children}
    </div>
  )
}

interface AdminEmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

/**
 * AdminEmptyState Component
 * 
 * Enforces consistent empty state styling
 * Reuses existing empty state patterns
 */
export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn('px-6 py-12 text-center', className)}>
      <div className="w-12 h-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  )
}

interface AdminLoadingStateProps {
  message?: string
  className?: string
}

/**
 * AdminLoadingState Component
 * 
 * Enforces consistent loading state styling
 * Reuses existing loading patterns
 */
export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  message = 'Loading...',
  className
}) => {
  return (
    <div className={cn('px-6 py-12 text-center', className)}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

interface AdminErrorStateProps {
  error: string
  onDismiss?: () => void
  className?: string
}

/**
 * AdminErrorState Component
 * 
 * Enforces consistent error state styling
 * Reuses existing error patterns
 */
export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  error,
  onDismiss,
  className
}) => {
  return (
    <div className={cn('bg-red-50 border border-red-200 rounded-lg p-4 mb-6', className)}>
      <div className="flex justify-between items-center">
        <p className="text-red-800">{error}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * AdminPageHeader Component
 * 
 * Enforces consistent page header styling
 * Reuses existing header patterns
 */
export const AdminPageHeader: React.FC<{
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}> = ({ title, subtitle, action, className }) => {
  return (
    <div className={cn('flex justify-between items-center mb-6', className)}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
