/**
 * Debug utility for authentication and permission issues
 * Use this to diagnose "Missing or insufficient permissions" errors
 */

import { useAuth } from '../contexts/AuthContext'
import { useContentPermission } from '../hooks/useContentPermissions'

export interface DebugInfo {
  isAuthenticated: boolean
  userUid: string | null
  userEmail: string | null
  userRole: string | null
  isActive: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  isOwner: boolean
  timestamp: string
}

/**
 * Hook to get debug information about current authentication state
 */
export const useAuthDebug = (document?: any): DebugInfo => {
  const { user, isAuthenticated } = useAuth()
  const { canCreate, canUpdate, canDelete, isOwner } = useContentPermission(document)

  return {
    isAuthenticated: !!user && isAuthenticated,
    userUid: user?.uid || null,
    userEmail: user?.email || null,
    userRole: user?.role || null,
    isActive: user?.isActive || false,
    canCreate,
    canUpdate,
    canDelete,
    isOwner,
    timestamp: new Date().toISOString()
  }
}

/**
 * Check if user exists in Firestore with proper structure
 */
export const checkFirestoreUserDocument = async (userId: string): Promise<{
  exists: boolean
  role?: string
  isActive?: boolean
  error?: string
  details?: any
}> => {
  try {
    
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    const { db } = await import('../lib/firebase')
    
    
    // Use the same approach as findUserByUid - query by uid field, not document ID
    const usersQuery = query(
      collection(db, 'users'),
      where('uid', '==', userId)
    )
    
    
    // Execute the query
    const querySnapshot = await getDocs(usersQuery)
    
    
    if (querySnapshot.empty) {
      return {
        exists: false,
        error: 'User document does not exist in Firestore',
        details: {
          userId,
          queryPath: 'users',
          queryField: 'uid',
          querySize: 0
        }
      }
    }
    
    // Get the first matching document
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    
    
    return {
      exists: true,
      role: userData?.role,
      isActive: userData?.isActive,
      details: userData
    }
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error checking user document',
      details: {
        originalError: error,
        userId,
        errorCode: (error as any).code,
        errorMessage: (error as any).message
      }
    }
  }
}
export const validateFirestoreRequirements = (userData: any, articleData: any): string[] => {
  const errors: string[] = []
  
  if (!userData?.uid) {
    errors.push('User UID is missing')
  }
  
  if (!userData?.role || userData.role !== 'editor') {
    errors.push('User must have role "editor"')
  }
  
  if (!userData?.isActive) {
    errors.push('User account must be active')
  }
  
  if (!articleData?.author?.uid) {
    errors.push('Article author.uid is required')
  }
  
  if (articleData?.author?.uid !== userData?.uid) {
    errors.push('Article author.uid must match user UID')
  }
  
  if (!articleData?.createdBy) {
    errors.push('Article createdBy is required')
  }
  
  if (articleData?.createdBy !== userData?.uid) {
    errors.push('Article createdBy must match user UID')
  }
  
  return errors
}

/**
 * Fix article ownership by updating createdBy and author.uid to match current user
 * This resolves permission issues when article ownership doesn't match the current user
 */
export const fixArticleOwnership = async (
  articleId: string, 
  articleType: 'news' | 'knowledge',
  currentUserId: string,
  currentUserDisplayName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('../lib/firebase')
    
    const articleRef = doc(db, articleType, articleId)
    
    // Update the article with current user's ownership
    await updateDoc(articleRef, {
      createdBy: currentUserId,
      updatedBy: currentUserId,
      author: {
        uid: currentUserId,
        displayName: currentUserDisplayName
      },
      updatedAt: new Date()
    })
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fixing article ownership'
    }
  }
}
