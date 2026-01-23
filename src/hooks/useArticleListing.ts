import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getPublishedArticles, 
  getSavedArticles,
  type ContentType,
  type Article 
} from '../services/contentService'
import { PermissionService } from '../services/permissionService'

export type ListingMode = 'published' | 'saved'
export type ListingState = {
  articles: Article[]
  loading: boolean
  error: string | null
  mode: ListingMode
}

/**
 * CENTRALIZED ARTICLE LISTING HOOK
 * 
 * Handles all data fetching and filtering logic for:
 * - NewsPage
 * - KnowledgePage
 * 
 * FEATURES:
 * - Default: Published articles only
 * - Saved mode: User's saved articles only
 * - Permission-aware filtering
 * - Clean state transitions
 */
export const useArticleListing = (type: ContentType) => {
  const { user } = useAuth()
  
  // State management
  const [state, setState] = useState<ListingState>({
    articles: [],
    loading: true,
    error: null,
    mode: 'published' // Default mode
  })

  // Update state helper
  const updateState = useCallback((updates: Partial<ListingState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Load published articles
  const loadPublishedArticles = useCallback(async () => {
    try {
      updateState({ loading: true, error: null })
      
      const articles = await getPublishedArticles(type, {
        orderBy: 'createdAt',
        orderDirection: 'desc',
        limit: 50
      })
      
      updateState({ 
        articles, 
        loading: false,
        mode: 'published'
      })
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to load articles',
        loading: false,
        articles: []
      })
    }
  }, [type, updateState])

  // Load saved articles (user-specific)
  const loadSavedArticles = useCallback(async () => {
    if (!user) {
      updateState({ 
        error: 'Authentication required to view saved articles',
        loading: false,
        articles: []
      })
      return
    }

    try {
      updateState({ loading: true, error: null })
      
      // DEBUG: Log current user info
      console.group('🔍 loadSavedArticles Debug')
      console.log('Current User UID (Firebase Auth):', user.uid)
      console.log('Current User Email:', user.email)
      console.log('Current User Role:', user.role)
      console.log('Current User Display Name:', user.displayName)
      console.groupEnd()
      
      // Convert user to ServiceUser format
      const serviceUser = {
        id: user.uid,
        username: user.displayName || user.email || 'unknown',
        role: user.role as 'admin' | 'editor'
      }
      
      // Check permission first
      const permission = PermissionService.validateRead(serviceUser)
      if (!permission.allowed) {
        updateState({ 
          error: permission.reason,
          loading: false,
          articles: []
        })
        return
      }
      
      const articles = await getSavedArticles(type, user.uid, {
        orderBy: 'updatedAt',
        orderDirection: 'desc',
        limit: 50
      })
      
      updateState({ 
        articles, 
        loading: false,
        mode: 'saved'
      })
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to load saved articles',
        loading: false,
        articles: []
      })
    }
  }, [user, type, updateState])

  // Toggle between modes
  const toggleMode = useCallback(() => {
    const newMode = state.mode === 'published' ? 'saved' : 'published'
    
    if (newMode === 'published') {
      loadPublishedArticles()
    } else {
      loadSavedArticles()
    }
  }, [state.mode, loadPublishedArticles, loadSavedArticles])

  // Initial load
  useEffect(() => {
    loadPublishedArticles()
  }, [loadPublishedArticles])

  // Refetch functions
  const refetch = useCallback(() => {
    if (state.mode === 'published') {
      loadPublishedArticles()
    } else {
      loadSavedArticles()
    }
  }, [state.mode, loadPublishedArticles, loadSavedArticles])

  // Card click behavior based on status
  const getCardClickHandler = useCallback((article: Article) => {
    // Convert user to ServiceUser format for permission checks
    const serviceUser = user ? {
      id: user.uid,
      username: user.displayName || user.email || 'unknown',
      role: user.role as 'admin' | 'editor'
    } : null

    // Published articles: Navigate to public view
    if (article.status === 'published') {
      return () => {
        const path = `/${type}/${article.slug}`
        window.location.href = path
      }
    }
    
    // Saved articles: Navigate to edit (only for owners)
    if (article.status === 'saved' && serviceUser) {
      const permission = PermissionService.validateUpdate(serviceUser, article)
      if (permission.allowed) {
        return () => {
          const path = `/${type}/edit/${article.id}`
          window.location.href = path
        }
      }
    }
    
    // Fallback: No action
    return () => {}
  }, [type, user])

  // Permission-based UI state
  const uiPermissions = PermissionService.getServicePermissions(user || null)

  return {
    // State
    articles: state.articles,
    loading: state.loading,
    error: state.error,
    mode: state.mode,
    
    // Actions
    toggleMode,
    refetch,
    loadPublishedArticles,
    loadSavedArticles,
    
    // Card click handler
    getCardClickHandler,
    
    // Permissions
    canCreate: uiPermissions.canCreate,
    canDelete: uiPermissions.canDelete,
    isEditor: user?.role === 'editor',
    isAdmin: user?.role === 'admin',
    
    // UI helpers
    showSavedButton: user?.role === 'editor',
    showCreateButton: uiPermissions.canCreate,
    isSavedMode: state.mode === 'saved',
    isPublishedMode: state.mode === 'published'
  }
}

/**
 * Hook for admin-specific listing (for deletion)
 */
export const useAdminArticleListing = (type: ContentType) => {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadArticlesForAdmin = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      setError('Admin access required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Convert user to ServiceUser format
      const serviceUser = {
        id: user.uid,
        username: user.displayName || user.email || 'unknown',
        role: 'admin' as const
      }
      
      // Admin can see all articles (both published and saved)
      const published = await getPublishedArticles(type, {
        orderBy: 'createdAt',
        orderDirection: 'desc',
        limit: 100
      })
      
      // Note: Admins cannot see saved articles via normal queries
      // They can only delete what they can access through individual document reads
      
      setArticles(published)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles')
      setLoading(false)
    }
  }, [user, type])

  useEffect(() => {
    loadArticlesForAdmin()
  }, [loadArticlesForAdmin])

  return {
    articles,
    loading,
    error,
    refetch: loadArticlesForAdmin
  }
}
