import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  getArticleById,
  updateArticle,
  type ContentType,
  type Article 
} from '../services/contentService'
import { PermissionService } from '../services/permissionService'
import { useArticleEditor } from './useArticleEditor'

/**
 * CENTRALIZED ARTICLE UPDATE HOOK
 * 
 * Handles the complete update flow for saved articles:
 * - Load existing article data
 * - Prefill editor with article data
 * - Validate permissions
 * - Handle save/publish operations
 * - Prevent editing of published articles
 */
export const useArticleUpdate = (type: ContentType) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State for existing article
  const [existingArticle, setExistingArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  // Load existing article
  const loadArticle = useCallback(async () => {
    if (!id || !user) {
      setError('Article ID and user authentication required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setPermissionError(null)

      // Convert user to ServiceUser format
      const serviceUser = {
        id: user.uid,
        username: user.displayName || user.email || 'unknown',
        role: user.role as 'admin' | 'editor'
      }

      // Get article by ID
      const article = await getArticleById(type, id, user.uid, user.role)
      
      if (!article) {
        setError('Article not found')
        setLoading(false)
        return
      }

      // Permission validation
      const readPermission = PermissionService.validateRead(serviceUser, article)
      if (!readPermission.allowed) {
        setPermissionError(readPermission.reason)
        setLoading(false)
        return
      }

      // Editors cannot update published articles
      if (user.role === 'editor' && article.status === 'published') {
        setPermissionError('Published articles cannot be edited. Only saved articles can be updated.')
        setLoading(false)
        return
      }

      // Editors can only update their own articles
      if (user.role === 'editor') {
        const updatePermission = PermissionService.validateUpdate(serviceUser, article)
        if (!updatePermission.allowed) {
          setPermissionError(updatePermission.reason)
          setLoading(false)
          return
        }
      }

      // Admins cannot access edit UI
      if (user.role === 'admin') {
        setPermissionError('Admins cannot edit articles. Use admin panel for article management.')
        setLoading(false)
        return
      }

      setExistingArticle(article)
      setLoading(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article')
      setLoading(false)
    }
  }, [id, user, type])

  // Use the editor hook with existing article
  const editorHook = useArticleEditor(type, 'update', existingArticle || undefined)

  // Load article on mount
  useEffect(() => {
    loadArticle()
  }, [loadArticle])

  // Handle navigation back
  const handleBack = useCallback(() => {
    navigate(`/${type}`)
  }, [navigate, type])

  // Handle save with article ID
  const handleSave = useCallback(async (data: any, status: 'saved' | 'published') => {
    if (!existingArticle || !user) return

    try {
      const serviceUser = {
        id: user.uid,
        username: user.displayName || user.email || 'unknown',
        role: user.role as 'admin' | 'editor'
      }

      // Validate update permission
      const updatePermission = PermissionService.validateUpdate(serviceUser, existingArticle)
      if (!updatePermission.allowed) {
        setError(updatePermission.reason)
        return
      }

      // Validate publish permission
      if (status === 'published') {
        const publishPermission = PermissionService.validatePublish(serviceUser, existingArticle)
        if (!publishPermission.allowed) {
          setError(publishPermission.reason)
          return
        }
      }

      // Update the article
      await updateArticle(type, existingArticle.id!, data, serviceUser)
      
      // Update local state
      setExistingArticle(prev => prev ? { ...prev, ...data, status } : null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article')
    }
  }, [existingArticle, user, type])

  // Permission states
  const canEdit = existingArticle && user && (
    user.role === 'editor' && 
    existingArticle.status === 'saved' && 
    existingArticle.createdBy === user.uid
  )

  const isPublishedArticle = existingArticle?.status === 'published'
  const isSavedArticle = existingArticle?.status === 'saved'
  const isOwner = existingArticle?.createdBy === user?.uid

  return {
    // Article data
    existingArticle,
    loading,
    error,
    permissionError,
    
    // Editor hook
    editorHook,
    
    // Permissions
    canEdit,
    isPublishedArticle,
    isSavedArticle,
    isOwner,
    
    // Actions
    handleBack,
    handleSave,
    loadArticle
  }
}
