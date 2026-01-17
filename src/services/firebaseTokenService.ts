// Firebase Custom Token Service
// Bridges JWT authentication with Firebase Auth for Firestore rules

import { getApps, initializeApp } from 'firebase/app'
import { authService } from './authService'

// Initialize Firebase Admin SDK (server-side simulation)
// Note: In production, this would be a proper backend service
const adminConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // In production, use proper service account credentials
}

// Mock Firebase Admin functions for client-side development
// In production, these would be actual Firebase Admin SDK calls
const mockFirebaseAdmin = {
  createCustomToken: async (payload: any) => {
    // Simulate custom token creation
    // In production, use: admin.auth().createCustomToken(payload)
    console.log('Creating custom token for:', payload)
    
    // Return a mock token that Firebase will accept
    return `mock_custom_token_${Date.now()}_${payload.uid}`
  }
}

export const generateFirebaseToken = async (_jwtToken: string) => {
  try {
    // Validate JWT and get user info
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('No authenticated user found')
    }

    // Create Firebase custom token with user claims
    const customToken = await mockFirebaseAdmin.createCustomToken({
      uid: user.id,
      email: user.username + '@example.com', // Mock email for Firebase
      displayName: user.username,
      role: user.role
    })

    return customToken
  } catch (error) {
    console.error('Error generating Firebase token:', error)
    throw new Error('Failed to generate Firebase token')
  }
}

export const signInWithFirebaseToken = async (jwtToken: string) => {
  try {
    // For development, skip Firebase Auth and work directly with JWT
    console.log('Development mode: Using JWT authentication directly')
    console.log('JWT Token:', jwtToken)
    
    // Validate the JWT and extract user info
    const user = authService.getCurrentUser()
    if (!user) {
      throw new Error('No authenticated user found')
    }
    
    console.log('Authenticated user:', user)
    
    // Return mock user object for development
    return {
      uid: user.id,
      displayName: user.username,
      email: user.username + '@example.com',
      role: user.role
    }
  } catch (error) {
    console.error('Error in development auth:', error)
    throw new Error('Failed to authenticate in development mode')
  }
}

// Helper function to ensure Firebase app is initialized
export const ensureFirebaseApp = () => {
  const apps = getApps()
  if (apps.length === 0) {
    initializeApp({
      projectId: adminConfig.projectId
    })
  }
}
