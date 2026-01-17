import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, type User } from '../services/authService'
import { developmentAuthBridge } from '../services/developmentAuthBridge'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  login: (username: string, password: string) => Promise<{ user: User }>
  isAuthenticated: boolean
  hasRole: (role: 'admin' | 'editor') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth state on mount
    const checkAuth = () => {
      try {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
        
        // Initialize development auth bridge if user exists
        if (currentUser) {
          developmentAuthBridge.initialize()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ identifier: username, password })
      setUser(response.user)
      
      // Initialize development auth bridge after successful login
      developmentAuthBridge.initialize()
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isAuthenticated = () => {
    return authService.isAuthenticated()
  }

  const hasRole = (role: 'admin' | 'editor') => {
    return authService.hasRole(role)
  }

  const value: AuthContextType = {
    user,
    loading,
    logout,
    login,
    isAuthenticated: isAuthenticated(),
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
