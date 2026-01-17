// Development Authentication Bridge
// Bridges JWT authentication with Firestore operations in development
// WARNING: This is for development only - NOT for production

import { authService } from './authService'

interface DevelopmentUser {
  uid: string
  email: string
  displayName: string
  role: 'admin' | 'editor'
}

class DevelopmentAuthBridge {
  private currentUser: DevelopmentUser | null = null

  initialize(): DevelopmentUser | null {
    try {
      // Get current user from auth service
      const user = authService.getCurrentUser()
      
      if (!user) {
        console.warn('No authenticated user found in development bridge')
        return null
      }

      // Map user to development format
      this.currentUser = {
        uid: user.id,
        email: user.username + '@example.com', // Mock email for development
        displayName: user.username,
        role: user.role
      }

      console.log('Development auth bridge initialized for user:', this.currentUser)
      return this.currentUser
    } catch (error) {
      console.error('Failed to initialize development auth bridge:', error)
      return null
    }
  }

  getCurrentUser(): DevelopmentUser | null {
    return this.currentUser || this.initialize()
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

  // Add auth context to Firestore documents
  addAuthContext<T extends Record<string, any>>(data: T): T & { _devAuth: DevelopmentUser & { timestamp: string } } {
    const user = this.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated - cannot add auth context')
    }

    return {
      ...data,
      _devAuth: {
        ...user,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Clear authentication state
  clear(): void {
    this.currentUser = null
  }
}

// Export singleton instance
export const developmentAuthBridge = new DevelopmentAuthBridge()
