// useSearchQuery Hook
// Search-specific logic ONLY
// NO direct data fetching
// NO pagination logic
// PAGINATED SEARCH INTEGRATION

import { useState, useCallback, useEffect } from 'react'

export interface UseSearchQueryOptions {
  initialQuery?: string
  debounceMs?: number
}

export interface UseSearchQueryReturn {
  // Search state
  query: string
  isTyping: boolean
  isActive: boolean
  
  // Actions
  setQuery: (query: string) => void
  clearSearch: () => void
  executeSearch: (query: string) => void
}

/**
 * Search-specific state management ONLY
 * Debounces search queries
 * Triggers articleQuery re-fetch via global update mechanism
 * PAGINATED SEARCH - never loads all results
 */
export const useSearchQuery = ({
  initialQuery = '',
  debounceMs = 300
}: UseSearchQueryOptions = {}): UseSearchQueryReturn => {
  const [query, setQueryState] = useState(initialQuery)
  const [isTyping, setIsTyping] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  // Derive active state from query
  const isActive = Boolean(debouncedQuery.trim())

  // Debounce search query
  useEffect(() => {
    if (query === debouncedQuery) return

    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setIsTyping(false)
    }, debounceMs)

    setIsTyping(true)

    return () => clearTimeout(timer)
  }, [query, debounceMs, debounceMs])

  // Update articleQuery when debounced query changes
  // PAGINATED SEARCH: This triggers pagination reset and fresh fetch
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__articleQueryUpdate) {
      const { updateSearchQuery } = (window as any).__articleQueryUpdate
      // CRITICAL: Search query becomes pagination parameter
      updateSearchQuery(debouncedQuery.trim() || null)
    }
  }, [debouncedQuery])

  // Set search query (with debouncing)
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)
  }, [])

  // Clear search immediately
  const clearSearch = useCallback(() => {
    setQueryState('')
    setDebouncedQuery('')
    setIsTyping(false)
    
    // Immediately update articleQuery
    if (typeof window !== 'undefined' && (window as any).__articleQueryUpdate) {
      const { updateSearchQuery } = (window as any).__articleQueryUpdate
      updateSearchQuery(null)
    }
  }, [])

  // Execute search immediately (no debounce)
  // PAGINATED SEARCH: Triggers fresh pagination with search constraint
  const executeSearch = useCallback((searchQuery: string) => {
    setQueryState(searchQuery)
    setDebouncedQuery(searchQuery)
    setIsTyping(false)
    
    // Immediately update articleQuery
    if (typeof window !== 'undefined' && (window as any).__articleQueryUpdate) {
      const { updateSearchQuery } = (window as any).__articleQueryUpdate
      updateSearchQuery(searchQuery.trim() || null)
    }
  }, [])

  return {
    // Search state
    query,
    isTyping,
    isActive,
    
    // Actions
    setQuery,
    clearSearch,
    executeSearch
  }
}
