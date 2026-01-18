// Debug utilities for permission issues
import { auth } from '../lib/firebase'
import { findUserByUid } from '../services/firestoreUserService'

export interface DebugInfo {
  isAuthenticated: boolean
  currentUser: {
    uid: string | null
    email: string | null
    displayName: string | null
  }
  firestoreProfile: {
    exists: boolean
    role: string | null
    isActive: boolean | null
    data: any
  } | null
  timestamp: string
}

export const debugAuthentication = async (): Promise<DebugInfo> => {
  const currentUser = auth.currentUser
  
  const debugInfo: DebugInfo = {
    isAuthenticated: !!currentUser,
    currentUser: {
      uid: currentUser?.uid || null,
      email: currentUser?.email || null,
      displayName: currentUser?.displayName || null
    },
    firestoreProfile: null,
    timestamp: new Date().toISOString()
  }

  if (currentUser) {
    try {
      const profile = await findUserByUid(currentUser.uid)
      debugInfo.firestoreProfile = {
        exists: !!profile,
        role: profile?.role || null,
        isActive: profile?.isActive || null,
        data: profile
      }
    } catch (error) {
            debugInfo.firestoreProfile = {
        exists: false,
        role: null,
        isActive: null,
        data: error
      }
    }
  }

  return debugInfo
}

export const logDebugInfo = async (_context: string) => {
  const debugInfo = await debugAuthentication()
  return debugInfo
}

export const checkPermissions = async (): Promise<{
  canReadSaved: boolean
  issues: string[]
}> => {
  const issues: string[] = []
  let canReadSaved = false

  const debugInfo = await debugAuthentication()

  // Check authentication
  if (!debugInfo.isAuthenticated) {
    issues.push('❌ User is not authenticated')
    return { canReadSaved: false, issues }
  }

  // Check Firestore profile
  if (!debugInfo.firestoreProfile?.exists) {
    issues.push('❌ No Firestore profile found for user')
    return { canReadSaved: false, issues }
  }

  // Check user is active
  if (!debugInfo.firestoreProfile.isActive) {
    issues.push('❌ User profile is not active')
    return { canReadSaved: false, issues }
  }

  // Check user role
  if (debugInfo.firestoreProfile.role !== 'editor' && debugInfo.firestoreProfile.role !== 'admin') {
    issues.push(`❌ Invalid user role: ${debugInfo.firestoreProfile.role}`)
    return { canReadSaved: false, issues }
  }

  canReadSaved = true
  issues.push('✅ All permission checks passed')

  return { canReadSaved, issues }
}
