import React, { createContext, useContext, useState, useEffect } from 'react'
import { findUserByUid } from '../services/firestoreUserService'
import { firebaseAuthService } from '../services/firebaseAuthService'

// Local user interface matching our app needs
// Firebase Auth is source of truth, Firestore provides profile data
interface User {
  uid: string // Firebase Auth UID (source of truth)
  email: string // Firebase Auth email
  role: 'admin' | 'editor' // Firestore profile data
  displayName: string // Firestore profile data
  isActive: boolean // Firestore profile data
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: () => Promise<void>
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
  const [loading, setLoading] = useState(true) // Start with true for auth restoration

  // Firebase Auth state restoration and management
  // Firebase Auth is the source of truth for authentication state
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase Auth user exists, load Firestore profile
        try {
          const userDoc = await findUserByUid(firebaseUser.uid)
          
          if (userDoc && userDoc.isActive) {
            // Create user object with Firebase Auth as source of truth
            // Firestore provides only profile data (role, displayName, isActive)
            const userObject: User = {
              uid: firebaseUser.uid, // Firebase Auth UID (source of truth)
              email: firebaseUser.email || '', // Firebase Auth email
              role: userDoc.role || 'editor', // Firestore profile data
              displayName: userDoc.displayName || firebaseUser.displayName || 'Unknown', // Firestore profile data
              isActive: userDoc.isActive // Firestore profile data
            }
            
            setUser(userObject)
            // Persist only non-sensitive UI state (no tokens, no passwords)
            localStorage.setItem('authUser', JSON.stringify({
              uid: userObject.uid,
              email: userObject.email,
              role: userObject.role,
              displayName: userObject.displayName,
              isActive: userObject.isActive
            }))
          } else {
            // Firebase user exists but no valid Firestore profile
            // Treat as unauthorized - clear Firebase session
                        await firebaseAuthService.signOutUser()
            setUser(null)
            localStorage.removeItem('authUser')
          }
        } catch (error) {
                    // Don't trust Firebase Auth without valid Firestore profile
          await firebaseAuthService.signOutUser()
          setUser(null)
          localStorage.removeItem('authUser')
        }
      } else {
        // No Firebase Auth user - clear all state
        setUser(null)
        localStorage.removeItem('authUser')
      }
      
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Client-side validation
      if (!email || !email.trim()) {
        throw new Error('EMAIL_REQUIRED')
      }
      
      if (!password || password.length < 6) {
        throw new Error('PASSWORD_REQUIRED')
      }
      
      // Authenticate with Firebase Auth only
      // Firebase Auth is the source of truth for authentication
      await firebaseAuthService.signInWithEmail(email, password)
      
      // onAuthStateChanged will handle the rest:
      // 1. Load Firestore profile using Firebase UID
      // 2. Create combined user object
      // 3. Set React Context state
      // 4. Persist non-sensitive UI state only
      
    } catch (error) {
            
      if (error instanceof Error) {
        // Handle Firebase Auth errors
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
        } else if (error.message === 'EMAIL_REQUIRED') {
          throw new Error('Vui lòng nhập email')
        } else if (error.message === 'PASSWORD_REQUIRED') {
          throw new Error('Vui lòng nhập mật khẩu')
        } else {
          throw error
        }
      }
      
      throw new Error('LOGIN_FAILED')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async () => {
    // Note: This function should not be used in production
    // User creation should be handled by admin via Firebase Admin SDK
    throw new Error('Public signup not allowed. Contact administrator for account creation.')
  }

  const logout = async () => {
    try {
      // Sign out from Firebase Auth (source of truth)
      await firebaseAuthService.signOutUser()
      
      // Clear user state
      setUser(null)
      
      // Remove non-sensitive UI state from localStorage
      localStorage.removeItem('authUser')
    } catch (error) {
            throw error
    }
  }

  const isAuthenticated = () => {
    // User is authenticated only if Firebase Auth user exists
    // and has valid Firestore profile (handled by onAuthStateChanged)
    return user !== null && user.isActive
  }

  const hasRole = (role: 'admin' | 'editor') => {
    // Check both authentication and role from Firestore profile
    if (!user || !user.isActive) return false
    
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
