// JWT-based Authentication Service
// Uses real Firestore users for authentication

import { signInWithFirebaseToken } from './firebaseTokenService'
import { findUserForLogin } from './firestoreUserService'
import { verifyPassword } from '../utils/password'
import type { LoginInput } from '../types/user'

export interface User {
  id: string
  username: string
  role: 'admin' | 'editor'
}

export interface LoginResponse {
  user: User
  token: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}


class AuthService {
  private token: string | null = null
  private user: User | null = null

  constructor() {
    this.initializeFromStorage()
  }

  private initializeFromStorage() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      this.token = storedToken
      this.user = JSON.parse(storedUser)
    }
  }

  private setAuthState(token: string, user: User) {
    this.token = token
    this.user = user
    
    // Store in localStorage
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  private clearAuthState() {
    this.token = null
    this.user = null
    
    // Clear from localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  private generateToken(user: User): string {
    // Simple mock JWT - in production, use a real JWT library
    // Handle Unicode characters properly with UTF-8 encoding
    const header = btoa(unescape(encodeURIComponent(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))))
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ 
      id: user.id, 
      username: user.username, 
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }))))
    const signature = btoa(unescape(encodeURIComponent('mock-signature'))) // In production, use real signing
    
    return `${header}.${payload}.${signature}`
  }

  private verifyToken(token: string): User | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      
      const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))))
      
      // Check expiration
      if (payload.exp && payload.exp < Date.now()) {
        return null
      }
      
      return {
        id: payload.id,
        username: payload.username,
        role: payload.role
      }
    } catch {
      return null
    }
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    try {
      const userDoc = await findUserForLogin(input.identifier)
      
      if (userDoc) {
        // Check if user is disabled
        if (!userDoc.isActive) {
          throw new Error('USER_DISABLED')
        }

        // Verify password against stored hash
        const isValidPassword = await verifyPassword(input.password, userDoc.passwordHash ?? '')
        
        if (!isValidPassword) {
          throw new Error('INVALID_CREDENTIALS')
        }
        
        // Create User object for response
        const user: User = {
          id: userDoc.id,
          username: userDoc.displayName ?? userDoc.uid,
          role: userDoc.role
        }

        // Generate JWT token
        const token = this.generateToken(user)
        this.setAuthState(token, user)

        // Also sign in with Firebase custom token for Firestore rules
        try {
          await signInWithFirebaseToken(token)
        } catch (error) {
          // Continue with JWT if Firebase fails
        }

        return { user, token }
      }

      throw new Error('USER_NOT_FOUND')
    } catch (error) {
      throw error
    }
  }

  logout(): void {
    this.clearAuthState()
  }

  getCurrentUser(): User | null {
    if (this.user && this.token) {
      // Verify token is still valid
      const verifiedUser = this.verifyToken(this.token)
      if (verifiedUser) {
        return verifiedUser
      } else {
        this.clearAuthState()
        return null
      }
    }
    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  hasRole(role: 'admin' | 'editor'): boolean {
    const user = this.getCurrentUser()
    if (!user) return false
    
    if (role === 'admin') {
      return user.role === 'admin'
    }
    
    if (role === 'editor') {
      return user.role === 'admin' || user.role === 'editor'
    }
    
    return false
  }

  getAuthState(): AuthState {
    const user = this.getCurrentUser()
    return {
      user,
      token: this.token,
      isAuthenticated: user !== null
    }
  }

  getToken(): string | null {
    return this.token
  }
}

// Export singleton instance
export const authService = new AuthService()
