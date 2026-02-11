import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { deleteArticle, type ContentType, type Article } from '../services/contentService'
import { PermissionService } from '../services/permissionService'

/**
 * CENTRALIZED ADMIN DELETE HOOK
 * 
 * Handles admin deletion of articles with proper validation
 * and error handling
 */
export const useAdminDelete = () => {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteArticle = useCallback(async (
    article: Article,
    type: ContentType,
    onSuccess?: () => void
  ) => {
    if (!user || user.role !== 'admin') {
      setError('Admin access required')
      return
    }

    try {
      setIsDeleting(article.id || 'unknown')
      setError(null)

      // Convert user to ServiceUser format
      const serviceUser = {
        id: user.uid,
        username: user.displayName || user.email || 'unknown',
        role: 'admin' as const
      }

      // Validate delete permission
      const permission = PermissionService.validateDelete(serviceUser)
      if (!permission.allowed) {
        setError(permission.reason)
        setIsDeleting(null)
        return
      }

      // Perform deletion
      await deleteArticle(type, article.id!, user.uid, 'admin')
      
      setIsDeleting(null)
      onSuccess?.()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete article'
      setError(errorMessage)
      setIsDeleting(null)
    }
  }, [user])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    deleteArticle: handleDeleteArticle,
    isDeleting,
    error,
    clearError,
    canDelete: user?.role === 'admin'
  }
}
