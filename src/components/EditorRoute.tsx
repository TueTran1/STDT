import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface EditorRouteProps {
  children: React.ReactNode
}

/**
 * EditorRoute Component
 * 
 * Route guard that only allows editors to access editor routes
 * Admins are redirected to access denied page
 */
export const EditorRoute: React.FC<EditorRouteProps> = ({ children }) => {
  const { user, hasRole } = useAuth()

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user is an editor (but not admin)
  if (!hasRole('editor') || hasRole('admin')) {
    return <Navigate to="/access-denied" replace />
  }

  // Check if user is specifically an editor (not admin)
  if (hasRole('admin')) {
    return <Navigate to="/access-denied" replace />
  }

  return <>{children}</>
}

export default EditorRoute
