// Firebase Authentication Service
// Pure Firebase Auth bridge - NO Firestore access

import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export interface AuthCallback {
  (user: FirebaseUser | null): void
}

class FirebaseAuthService {
  private unsubscribe: (() => void) | null = null

  // Pure Firebase Auth sign in - returns raw Firebase User
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  // Pure Firebase Auth sign out
  async signOutUser(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  }

  // Pure Firebase Auth state change listener
  onAuthStateChangedListener(callback: AuthCallback): () => void {
    this.unsubscribe = onAuthStateChanged(auth, callback)
    return this.unsubscribe
  }

  // Get current Firebase User (raw)
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser
  }

  // Get ID token (raw)
  async getIdToken(): Promise<string | null> {
    try {
      const user = auth.currentUser
      if (user) {
        return await user.getIdToken()
      }
      return null
    } catch (error) {
      return null
    }
  }

  // Cleanup listener
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService()
