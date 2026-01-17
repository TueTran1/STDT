// Firebase Authentication Service
// Replaces custom JWT system with Firebase Auth

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { findUserForLogin, createUser } from './firestoreUserService'
import { verifyPassword } from '../utils/password'

export interface User {
  id: string
  username: string
  role: 'admin' | 'editor'
}

export interface LoginResponse {
  user: User
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class FirebaseAuthService {
  private currentUser: User | null = null
  private firebaseUser: FirebaseUser | null = null

  constructor() {
    // Listen to Firebase Auth state changes
    onAuthStateChanged(auth, (firebaseUser) => {
      this.firebaseUser = firebaseUser
      if (firebaseUser) {
        this.loadUserProfile(firebaseUser)
      } else {
        this.currentUser = null
      }
    })
  }

  private async loadUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    try {
      // User identity comes directly from Firebase Auth currentUser
      // No manual construction or UID mapping hacks
      this.firebaseUser = firebaseUser
      
      // Get additional profile data from Firestore using Firebase UID
      const userDoc = await findUserForLogin(firebaseUser.email || firebaseUser.uid)
      
      if (userDoc) {
        // Use Firebase Auth identity + Firestore profile data
        this.currentUser = {
          id: firebaseUser.uid, // Always use Firebase Auth UID
          username: userDoc.displayName || firebaseUser.displayName || firebaseUser.email || 'Unknown',
          role: userDoc.role || 'editor' // Default role from Firestore
        }
      } else {
        // If no Firestore profile exists, use only Firebase Auth data
        this.currentUser = {
          id: firebaseUser.uid, // Firebase Auth UID only
          username: firebaseUser.displayName || firebaseUser.email || 'Unknown',
          role: 'editor' // Default role
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      this.currentUser = null
    }
  }

  async login(identifier: string, password: string): Promise<LoginResponse> {
    try {
      // Find user in Firestore first to get email
      const userDoc = await findUserForLogin(identifier)
      
      if (!userDoc) {
        throw new Error('USER_NOT_FOUND')
      }

      // Check if user is disabled
      if (!userDoc.isActive) {
        throw new Error('USER_DISABLED')
      }

      // Verify password against stored hash
      const isValidPassword = await verifyPassword(password, userDoc.passwordHash ?? '')
      
      if (!isValidPassword) {
        throw new Error('INVALID_CREDENTIALS')
      }

      // Sign in with Firebase Auth using email
      await signInWithEmailAndPassword(
        auth, 
        userDoc.email || '', // Ensure string type
        password
      )

      // User identity will be loaded by onAuthStateChanged listener
      // User object comes from Firebase Auth currentUser, not manual construction
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        throw new Error('Firebase Auth failed to set current user')
      }

      return {
        user: {
          id: firebaseUser.uid, // Firebase Auth UID
          username: userDoc.displayName || firebaseUser.displayName || firebaseUser.email || 'Unknown',
          role: userDoc.role || 'editor'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<LoginResponse> {
    try {
      // Create user in Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in Firestore
      const userDoc = await createUser({
        email,
        password,
        displayName: displayName || 'User',
        role: 'editor',
        isActive: true
      })

      // User identity comes from Firebase Auth currentUser
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        throw new Error('Firebase Auth failed to set current user after sign up')
      }

      return {
        user: {
          id: firebaseUser.uid, // Firebase Auth UID
          username: firebaseUser.displayName || displayName || 'User',
          role: userDoc.role || 'editor'
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth)
      this.currentUser = null
      this.firebaseUser = null
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getFirebaseUser(): FirebaseUser | null {
    return this.firebaseUser
  }

  // Direct access to Firebase Auth currentUser - single identity source
  getFirebaseAuthCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }

  async getIdToken(): Promise<string | null> {
    try {
      if (this.firebaseUser) {
        return await this.firebaseUser.getIdToken()
      }
      return null
    } catch (error) {
      console.error('Error getting ID token:', error)
      return null
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.firebaseUser !== null
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
      isAuthenticated: this.isAuthenticated()
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService()
