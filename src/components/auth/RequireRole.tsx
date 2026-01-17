import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface RequireRoleProps {
  children: React.ReactNode
  role: 'admin' | 'editor'
  fallback?: React.ReactNode
}

export const RequireRole: React.FC<RequireRoleProps> = ({ 
  children, 
  role, 
  fallback = null 
}) => {
  const { user, hasRole, loading } = useAuth()

  if (loading) {
    return null // or return a loading spinner
  }

  if (!user) {
    return fallback || <div>Please log in to access this content.</div>
  }

  if (!hasRole(role)) {
    return fallback || <div>You don't have permission to access this content.</div>
  }

  return <>{children}</>
}

// Convenience components for specific roles
export const RequireAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return <RequireRole role="admin" fallback={fallback}>{children}</RequireRole>
}

export const RequireEditor: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return <RequireRole role="editor" fallback={fallback}>{children}</RequireRole>
}
