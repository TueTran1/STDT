import React, { createContext, useContext, useState } from 'react'
import { findUserForLogin, createUser } from '../services/firestoreUserService'
import { verifyPassword } from '../utils/password'
import type { UserDocument } from '../types/firestore'

// Local user interface matching our app needs
interface User {
  id: string
  username: string
  role: 'admin' | 'editor'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
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
  const [loading, setLoading] = useState(false)

  const login = async (username: string, password: string) => {
    let userDoc: UserDocument | null = null
    
    try {
      setLoading(true)
      
      // Client-side validation
      if (!username || !username.trim()) {
        throw new Error('USERNAME_REQUIRED')
      }
      
      if (!password || password.length < 6) {
        throw new Error('PASSWORD_REQUIRED')
      }
      
      // Step 1: Find user in Firestore by username/email to get user data
      userDoc = await findUserForLogin(username)
      
      if (!userDoc) {
        throw new Error('USER_NOT_FOUND')
      }

      // Check if user is disabled
      if (!userDoc.isActive) {
        throw new Error('USER_DISABLED')
      }

      // Step 2: Verify password against stored hash
      if (!userDoc.passwordHash) {
        throw new Error('USER_NO_PASSWORD')
      }

      const isValidPassword = await verifyPassword(password, userDoc.passwordHash)
      
      if (!isValidPassword) {
        throw new Error('INVALID_CREDENTIALS')
      }

      // Step 3: Create user object for the session
      const userObject: User = {
        id: userDoc.id, // Use Firestore document ID
        username: userDoc.displayName || username,
        role: userDoc.role || 'editor'
      }

      // Step 4: Set user state directly (no Firebase Auth involved)
      setUser(userObject)
      
    } catch (error) {
      console.error('Login error:', error)
      
      if (error instanceof Error) {
        // Handle our custom validation errors
        if (error.message === 'USERNAME_REQUIRED') {
          throw new Error('Vui lòng nhập tên đăng nhập')
        } else if (error.message === 'PASSWORD_REQUIRED') {
          throw new Error('Vui lòng nhập mật khẩu')
        } else if (error.message === 'USER_NO_PASSWORD') {
          throw new Error('Tài khoản này chưa được thiết lập mật khẩu')
        }
        
        // Handle other errors
        if (error.message.includes('auth/user-not-found')) {
          throw new Error('USER_NOT_FOUND')
        } else if (error.message.includes('auth/wrong-password')) {
          throw new Error('INVALID_CREDENTIALS')
        } else if (error.message.includes('auth/user-disabled')) {
          throw new Error('USER_DISABLED')
        } else if (error.message.includes('auth/invalid-email')) {
          throw new Error('INVALID_EMAIL')
        } else if (error.message.includes('auth/too-many-requests')) {
          throw new Error('TOO_MANY_REQUESTS')
        } else {
          throw error
        }
      }
      
      throw new Error('LOGIN_FAILED')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      // Create user profile in Firestore only (no Firebase Auth)
      await createUser({
        email,
        password,
        displayName: displayName || 'User',
        role: 'editor',
        isActive: true
      })
      
      // User state will be set by login function after successful registration
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Clear user state directly (no Firebase Auth involved)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const isAuthenticated = () => {
    return user !== null
  }

  const hasRole = (role: 'admin' | 'editor') => {
    if (!user) return false
    
    if (role === 'admin') {
      return user.role === 'admin'
    }
    
    if (role === 'editor') {
      return user.role === 'admin' || user.role === 'editor'
    }
    
    return false
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    signUp,
    logout,
    isAuthenticated: isAuthenticated(),
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
