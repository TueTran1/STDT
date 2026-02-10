import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  createArticle, 
  updateArticle,
  type ContentType
} from '../services/contentService'
import type { NewsArticle, KnowledgeArticle } from '../types/firestore'
import { PermissionService } from '../services/permissionService'

export type Article = NewsArticle | KnowledgeArticle

export type EditorMode = 'create' | 'update'
export type SaveStatus = 'draft' | 'saved' | 'published' | 'error' | 'saving' | 'publishing'

export interface EditorState {
  title: string
  content: string
  excerpt?: string
  summary?: string
  tags: string[]
  featured: boolean
  category: string
  status: 'saved' | 'published'
  loading: boolean
  error: string | null
  saveStatus: SaveStatus
  hasUnsavedChanges: boolean
}

/**
 * CENTRALIZED ARTICLE EDITOR HOOK
 * 
 * Handles all editor state and operations for:
 * - Create new article
 * - Update existing article
 * - Save draft functionality
 * - Publish functionality
 * - Unsaved changes detection
 */
export const useArticleEditor = (
  type: ContentType,
  mode: EditorMode,
  existingArticle?: Article
) => {
  const { user } = useAuth()
  
  // Initial state based on mode
  const getInitialState = (): EditorState => {
    if (mode === 'create') {
      return {
        title: '',
        content: '',
        excerpt: '',
        summary: type === 'knowledge' ? '' : undefined,
        tags: [],
        featured: false,
        category: type === 'news' ? 'general' : 'quan-su',
        status: 'saved',
        loading: false,
        error: null,
        saveStatus: 'draft',
        hasUnsavedChanges: false
      }
    }
    
    // Update mode - populate with existing article
    if (existingArticle) {
      return {
        title: existingArticle.title || '',
        content: existingArticle.content || '',
        excerpt: existingArticle.excerpt || '',
        summary: (existingArticle as any)?.summary || '',
        tags: existingArticle.tags || [],
        featured: existingArticle.featured || false,
        category: existingArticle.category || (type === 'news' ? 'general' : 'quan-su'),
        status: (existingArticle.status as 'saved' | 'published') || 'saved',
        loading: false,
        error: null,
        saveStatus: 'draft',
        hasUnsavedChanges: false
      }
    }
    
    // Fallback
    return {
      title: '',
      content: '',
      excerpt: '',
      summary: '',
      tags: [],
      featured: false,
      category: type === 'news' ? 'general' : 'quan-su',
      status: 'saved',
      loading: false,
      error: null,
      saveStatus: 'draft',
      hasUnsavedChanges: false
    }
  }

  const [state, setState] = useState<EditorState>(getInitialState)
  const [originalState, setOriginalState] = useState<EditorState>(getInitialState)

  // Update original state when article changes
  useEffect(() => {
    const initial = getInitialState()
    setState(initial)
    setOriginalState(initial)
  }, [existingArticle, mode, type])

  // Update state helper
  const updateState = useCallback((updates: Partial<EditorState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Field change handlers
  const handleFieldChange = useCallback((field: keyof EditorState, value: any) => {
    updateState({ [field]: value, hasUnsavedChanges: true })
  }, [updateState])

  // Generate slug from title
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)
  }, [])

  // Save draft functionality
  const saveDraft = useCallback(async () => {
    if (!user) {
      updateState({ error: 'User not authenticated' })
      return
    }

    // Permission check
    const serviceUser = {
      id: user.uid,
      username: user.displayName || user.email || 'unknown',
      role: user.role as 'admin' | 'editor'
    }

    if (mode === 'create') {
      const permission = PermissionService.validateCreate(serviceUser)
      if (!permission.allowed) {
        updateState({ error: permission.reason, saveStatus: 'error' })
        return
      }
    } else {
      const permission = PermissionService.validateUpdate(serviceUser, existingArticle!)
      if (!permission.allowed) {
        updateState({ error: permission.reason, saveStatus: 'error' })
        return
      }
    }

    try {
      updateState({ loading: true, error: null, saveStatus: 'saving' })

      const articleData = {
        title: state.title,
        slug: generateSlug(state.title),
        content: state.content,
        excerpt: state.excerpt,
        summary: state.summary,
        tags: state.tags,
        featured: state.featured,
        category: state.category,
        status: 'saved' as const,
        author: {
          uid: user.uid,
          displayName: user.displayName || 'Lữ đoàn 83'
        },
        // Knowledge-specific fields
        ...(type === 'knowledge' && {
          type: 'article' as const,
          estimatedTime: Math.ceil(state.content.split(' ').length / 200), // Rough estimate
          engagement: {
            views: 0,
            likes: 0,
            bookmarks: 0,
            shares: 0
          }
        }),
        // News-specific fields
        ...(type === 'news' && {
          readingTime: Math.ceil(state.content.split(' ').length / 200),
          viewCount: 0,
          publishedAt: null
        })
      }

      let result: Article
      if (mode === 'create') {
        result = await createArticle(type, articleData, serviceUser.id)
      } else {
        result = await updateArticle(type, existingArticle!.id!, articleData, serviceUser.id, serviceUser.role)
      }

      // Update state with result
      const newOriginalState: EditorState = {
        ...state,
        status: 'saved' as const,
        saveStatus: 'saved',
        hasUnsavedChanges: false
      }
      
      setState(newOriginalState)
      setOriginalState(newOriginalState)

      // Update URL if creating new article
      if (mode === 'create') {
        const newUrl = `/${type}/edit/${result.id}`
        window.history.replaceState({}, '', newUrl)
      }

    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to save draft',
        saveStatus: 'error',
        loading: false
      })
    }
  }, [user, mode, type, existingArticle, state, generateSlug, updateState])

  // Publish functionality
  const publishArticle = useCallback(async () => {
    if (!user) {
      updateState({ error: 'User not authenticated' })
      return
    }

    // Permission check
    const serviceUser = {
      id: user.uid,
      username: user.displayName || user.email || 'unknown',
      role: user.role as 'admin' | 'editor'
    }

    if (mode === 'create') {
      const permission = PermissionService.validateCreate(serviceUser)
      if (!permission.allowed) {
        updateState({ error: permission.reason, saveStatus: 'error' })
        return
      }
    } else {
      // Update permission not needed for create
    }

    const publishPermission = PermissionService.validatePublish(serviceUser, existingArticle || {
      ...state,
      id: 'temp',
      slug: 'temp',
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: user.uid,
      createdBy: user.uid,
      author: { uid: user.uid, displayName: user.displayName || '' },
      // KnowledgeArticle required properties with defaults
      estimatedTime: 0,
      engagement: { views: 0, likes: 0, shares: 0, bookmarks: 0 },
      type: 'article' as const,
      subcategory: '',
      media: { images: [], videos: [], documents: [] },
      prerequisites: [],
      relatedKnowledge: [],
      review: { isReviewed: false }
    } as Article)
    
    if (!publishPermission.allowed) {
      updateState({ error: publishPermission.reason, saveStatus: 'error' })
      return
    }

    try {
      updateState({ loading: true, error: null, saveStatus: 'publishing' })

      const articleData = {
        title: state.title,
        slug: generateSlug(state.title),
        content: state.content,
        excerpt: state.excerpt,
        summary: state.summary,
        tags: state.tags,
        featured: state.featured,
        category: state.category,
        status: 'published' as const,
        publishedAt: new Date(),
        author: {
          uid: user.uid,
          displayName: user.displayName || 'Lữ đoàn 83'
        },
        // Knowledge-specific fields
        ...(type === 'knowledge' && {
          type: 'article' as const,
          estimatedTime: Math.ceil(state.content.split(' ').length / 200),
          engagement: {
            views: 0,
            likes: 0,
            bookmarks: 0,
            shares: 0
          }
        }),
        // News-specific fields
        ...(type === 'news' && {
          readingTime: Math.ceil(state.content.split(' ').length / 200),
          viewCount: 0
        })
      }

      let result: Article
      if (mode === 'create') {
        result = await createArticle(type, articleData, serviceUser.id)
      } else {
        result = await updateArticle(type, existingArticle!.id!, articleData, serviceUser.id, serviceUser.role)
      }

      // Update state with result
      const newOriginalState: EditorState = {
        ...state,
        status: 'published' as const,
        saveStatus: 'published',
        hasUnsavedChanges: false
      }
      
      setState(newOriginalState)
      setOriginalState(newOriginalState)

      // Update URL if creating new article
      if (mode === 'create') {
        const newUrl = `/${type}/edit/${result.id}`
        window.history.replaceState({}, '', newUrl)
      }

    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to publish article',
        saveStatus: 'error',
        loading: false
      })
    }
  }, [user, mode, type, existingArticle, state, generateSlug, updateState])

  // Check for unsaved changes before navigation
  const canNavigateAway = useCallback(() => {
    return !state.hasUnsavedChanges || state.saveStatus === 'saved'
  }, [state.hasUnsavedChanges, state.saveStatus])

  // Reset error state
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  return {
    // State
    state,
    
    // Actions
    handleFieldChange,
    saveDraft,
    publishArticle,
    clearError,
    
    // Helpers
    canNavigateAway,
    generateSlug,
    
    // Status
    isCreateMode: mode === 'create',
    isUpdateMode: mode === 'update',
    isSaving: state.loading,
    hasError: !!state.error,
    saveStatus: state.saveStatus,
    hasUnsavedChanges: state.hasUnsavedChanges
  }
}
