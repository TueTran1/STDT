// usePagination Hook
// STRICT, reusable pagination backbone
// NO search, NO category, NO mode switching
// ONLY pagination logic

import { useState, useCallback, useRef, useEffect } from 'react'

export interface PaginationQueryParams {
  limit?: number
  cursor?: any // Firestore document cursor
  // Additional query parameters will be handled by the query function
  [key: string]: any
}

export interface PaginationResult<T> {
  items: T[]
  hasMore: boolean
  cursor: any // Firestore document cursor for next page
}

export interface UsePaginationOptions<T> {
  // Query function that returns paginated results
  // MUST return items, hasMore, and cursor
  queryFn: (params: PaginationQueryParams) => Promise<PaginationResult<T>>
  
  // Initial query parameters
  initialParams?: Omit<PaginationQueryParams, 'cursor'>
  
  // Items per page (hard limit)
  itemsPerPage?: number
  
  // Unique identifier for pagination instance
  key?: string
}

export interface UsePaginationReturn<T> {
  // Data state - OWNED BY THIS HOOK ONLY
  items: T[]
  loading: boolean
  hasMore: boolean
  cursor: any
  
  // Actions
  loadMore: () => Promise<void>
  reset: () => Promise<void>
  
  // Computed states
  isLoadingMore: boolean
  canLoadMore: boolean
}

/**
 * STRICT pagination hook - backbone of the system
 * 
 * INVARIANTS:
 * 1. Only one cursor exists at any time
 * 2. Cursor updated ONLY after successful fetch
 * 3. hasMore is derived from fetch result size
 * 4. Load more disabled while loading
 * 5. Load more hidden when hasMore === false
 * 6. No duplicates possible - filtered by unique ID
 */
export const usePagination = <T>({
  queryFn,
  initialParams = {},
  itemsPerPage = 9,
  key = 'default'
}: UsePaginationOptions<T>): UsePaginationReturn<T> => {
  // Core pagination state - OWNED EXCLUSIVELY BY THIS HOOK
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<any>(null)
  
  // Refs to prevent race conditions
  const loadingRef = useRef(false)
  const lastQueryRef = useRef<string>('')
  
  // Generate unique query key for race condition prevention
  const generateQueryKey = (params: PaginationQueryParams): string => {
    return `${key}-${JSON.stringify(params)}-${Date.now()}`
  }

  // Execute initial page load
  const loadInitial = useCallback(async () => {
    // Prevent concurrent loads
    if (loadingRef.current) return
    
    const queryKey = generateQueryKey({ ...initialParams, limit: itemsPerPage })
    lastQueryRef.current = queryKey
    
    setLoading(true)
    loadingRef.current = true
    
    try {
      const result = await queryFn({
        ...initialParams,
        limit: itemsPerPage,
        cursor: undefined // No cursor for initial load
      })
      
      // Verify this is still the latest query
      if (lastQueryRef.current !== queryKey) {
        return // Race condition - ignore stale result
      }
      
      // Set initial state
      setItems(result.items)
      setCursor(result.cursor)
      setHasMore(result.hasMore)
      
    } catch (error) {
      console.error('Pagination initial load failed:', error)
      // Reset to safe state on error
      setItems([])
      setCursor(null)
      setHasMore(false)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [queryFn, initialParams, itemsPerPage, key])

  // Execute load more
  const loadMoreItems = useCallback(async () => {
    // Guard conditions
    if (!hasMore || loadingRef.current || !cursor) {
      return
    }
    
    const queryKey = generateQueryKey({ ...initialParams, cursor, limit: itemsPerPage })
    lastQueryRef.current = queryKey
    
    setLoading(true)
    loadingRef.current = true
    
    try {
      const result = await queryFn({
        ...initialParams,
        cursor,
        limit: itemsPerPage
      })
      
      // Verify this is still the latest query
      if (lastQueryRef.current !== queryKey) {
        return // Race condition - ignore stale result
      }
      
      // DE-DUPLICATION: Prevent duplicates by filtering existing IDs
      const existingIds = new Set(items.map(item => getItemId(item)))
      const uniqueNewItems = result.items.filter(item => !existingIds.has(getItemId(item)))
      
      // Append new items - NO DUPLICATES POSSIBLE
      setItems(prev => [...prev, ...uniqueNewItems])
      
      // Update cursor ONLY after successful fetch
      setCursor(result.cursor)
      setHasMore(result.hasMore)
      
    } catch (error) {
      console.error('Pagination load more failed:', error)
      // Don't reset state on load more error - user can retry
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [hasMore, cursor, queryFn, initialParams, itemsPerPage, items, key])

  // Reset pagination to initial state
  const reset = useCallback(async () => {
    // Clear current state immediately
    setItems([])
    setCursor(null)
    setHasMore(false)
    
    // Load fresh data
    await loadInitial()
  }, [loadInitial])

  // Public load more function
  const loadMore = useCallback(async () => {
    await loadMoreItems()
  }, [loadMoreItems])

  // Computed states
  const isLoadingMore = loading && items.length > 0
  const canLoadMore = hasMore && !loading && !isLoadingMore

  // Auto-load initial data when dependencies change
  useEffect(() => {
    loadInitial()
  }, [queryFn, JSON.stringify(initialParams), itemsPerPage, key])

  return {
    // Data state - OWNED BY THIS HOOK ONLY
    items,
    loading,
    hasMore,
    cursor,
    
    // Actions
    loadMore,
    reset,
    
    // Computed states
    isLoadingMore,
    canLoadMore
  }
}

// Helper function to get unique ID from any item
// This ensures de-duplication works for any data type
const getItemId = (item: any): string => {
  if (typeof item === 'object' && item !== null) {
    // Try common ID fields
    if (item.id) return String(item.id)
    if (item._id) return String(item._id)
    if (item.uid) return String(item.uid)
    
    // Generate stable hash for objects without ID
    return JSON.stringify(item)
  }
  
  // For primitives, use the value itself
  return String(item)
}
