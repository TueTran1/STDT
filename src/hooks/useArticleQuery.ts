// useArticleQuery Hook
// SINGLE SOURCE OF TRUTH for all article fetching
// Manages pagination, cursor, and ALL article data
// Uses strict pagination backbone
// COMPLETE MODE ISOLATION

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePagination } from './usePagination'
import { getInitialPage, getNextPage, type QueryParams } from '../services/articleQueryService'
import type { Article } from '../components/ui'

export type ArticleType = 'news' | 'knowledge'
export type ViewMode = 'published' | 'saved'

export interface UseArticleQueryOptions {
  articleType: ArticleType
  initialViewMode?: ViewMode
  initialCategory?: string | null
  initialSearchQuery?: string | null
  itemsPerPage?: number
}

export interface UseArticleQueryReturn {
  // Data
  articles: Article[]
  hasMore: boolean
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  
  // Actions
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  
  // Query parameters (read-only)
  currentViewMode: ViewMode
  currentCategory: string | null
  currentSearchQuery: string | null
}

/**
 * SINGLE SOURCE OF TRUTH for article data
 * Manages pagination and cursor lifecycle
 * Uses strict pagination backbone
 * COMPLETE MODE ISOLATION - no shared state between modes
 */
export const useArticleQuery = ({
  articleType,
  initialViewMode = 'published',
  initialCategory = null,
  initialSearchQuery = null,
  itemsPerPage = 9
}: UseArticleQueryOptions): UseArticleQueryReturn => {
  const { user } = useAuth()
  
  // Query parameters - controlled by external hooks
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [category, setCategory] = useState<string | null>(initialCategory)
  const [searchQuery, setSearchQuery] = useState<string | null>(initialSearchQuery)
  const [error, setError] = useState<string | null>(null)

  // Build query parameters for pagination - MODE AWARE
  const buildQueryParams = useCallback((): Omit<QueryParams, 'cursor'> => {
    return {
      articleType,
      viewMode,
      category: category || undefined,
      searchQuery: searchQuery || undefined,
      limit: itemsPerPage,
      userId: user?.uid // Required for saved mode validation
    }
  }, [articleType, viewMode, category, searchQuery, itemsPerPage, user?.uid])

  // MODE-AWARE query function for pagination backbone
  // Each mode gets completely isolated query execution
  const queryFn = useCallback(async (params: any) => {
    try {
      // STRICT MODE VALIDATION
      if (params.viewMode === 'saved' && !params.userId) {
        throw new Error('User ID required for saved articles')
      }

      // Build mode-specific query parameters
      const queryParams: QueryParams = {
        articleType,
        viewMode: params.viewMode, // CRITICAL: Mode determines dataset
        category: params.category,
        searchQuery: params.searchQuery,
        cursor: params.cursor,
        limit: params.limit,
        userId: params.userId // CRITICAL: User isolation for saved mode
      }

      // Execute mode-specific query
      // Published and Saved use completely different Firestore paths
      const result = params.cursor 
        ? await getNextPage(queryParams)
        : await getInitialPage(queryParams)

      return {
        items: result.items,
        hasMore: result.hasMore,
        cursor: result.lastVisible
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed')
      throw err
    }
  }, [articleType])

  // MODE-ISOLATED pagination backbone
  // Each mode gets its own pagination instance with unique key
  const {
    items: articles,
    loading: isLoading,
    hasMore,
    loadMore: loadMoreFromBackbone,
    reset: resetFromBackbone,
    isLoadingMore
  } = usePagination<Article>({
    queryFn,
    initialParams: buildQueryParams(),
    itemsPerPage,
    // CRITICAL: Mode-specific key ensures complete isolation
    key: `${articleType}-${viewMode}-${category || 'all'}-${searchQuery || 'none'}`
  })

  // Public load more function
  const loadMore = useCallback(async () => {
    setError(null)
    await loadMoreFromBackbone()
  }, [loadMoreFromBackbone])

  // Refresh function - MODE AWARE
  const refresh = useCallback(async () => {
    setError(null)
    await resetFromBackbone()
  }, [resetFromBackbone])

  // MODE SWITCHING - COMPLETE STATE INVALIDATION
  const updateViewMode = useCallback((newViewMode: ViewMode) => {
    if (newViewMode !== viewMode) {
      // CRITICAL: Mode change triggers complete isolation
      setViewMode(newViewMode)
      setError(null)
      // Pagination backbone will automatically reset due to key change
    }
  }, [viewMode])

  // Category update - MODE AWARE
  const updateCategory = useCallback((newCategory: string | null) => {
    if (newCategory !== category) {
      setCategory(newCategory)
      setError(null)
      // Pagination backbone will reset due to key change
    }
  }, [category])

  // Search update - MODE AWARE
  const updateSearchQuery = useCallback((newSearchQuery: string | null) => {
    if (newSearchQuery !== searchQuery) {
      setSearchQuery(newSearchQuery)
      setError(null)
      // Pagination backbone will reset due to key change
    }
  }, [searchQuery])

  // Expose update functions for external hooks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__articleQueryUpdate = {
        updateViewMode,
        updateCategory,
        updateSearchQuery
      }
    }
  }, [updateViewMode, updateCategory, updateSearchQuery])

  // MODE ISOLATION: Each mode gets completely separate pagination instance
  // The key change in usePagination automatically triggers reset and fresh fetch
  useEffect(() => {
    // This effect ensures pagination backbone resets when mode changes
    // The key change in usePagination hook handles the actual reset
  }, [viewMode, category, searchQuery])

  return {
    // Data - COMPLETELY ISOLATED BY MODE
    articles,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    
    // Actions
    loadMore,
    refresh,
    
    // Query parameters (read-only)
    currentViewMode: viewMode,
    currentCategory: category,
    currentSearchQuery: searchQuery
  }
}
