// useCategoryFilter Hook
// Category filter state management ONLY
// NO data fetching
// NO pagination logic
// PAGINATED CATEGORY FILTERING

import { useState, useCallback, useEffect } from 'react'

export interface UseCategoryFilterOptions {
  initialCategory?: string | null
}

export interface UseCategoryFilterReturn {
  // Category state
  selectedCategory: string | null
  isActive: boolean
  
  // Actions
  setCategory: (category: string | null) => void
  clearCategory: () => void
  toggleCategory: (category: string) => void
}

/**
 * Category filter state management ONLY
 * Triggers articleQuery re-fetch via global update mechanism
 * PAGINATED CATEGORY FILTERING - always uses pagination
 */
export const useCategoryFilter = ({
  initialCategory = null
}: UseCategoryFilterOptions = {}): UseCategoryFilterReturn => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)

  // Derive active state from category
  const isActive = Boolean(selectedCategory)

  // Update articleQuery when category changes
  // PAGINATED CATEGORY: This triggers pagination reset and fresh fetch
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__articleQueryUpdate) {
      const { updateCategory } = (window as any).__articleQueryUpdate
      // CRITICAL: Category becomes pagination parameter
      updateCategory(selectedCategory)
    }
  }, [selectedCategory])

  // Set category directly
  const setCategory = useCallback((category: string | null) => {
    setSelectedCategory(category)
  }, [])

  // Clear category
  const clearCategory = useCallback(() => {
    setSelectedCategory(null)
  }, [])

  // Toggle category (select if different, clear if same)
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategory(prev => prev === category ? null : category)
  }, [])

  return {
    // Category state
    selectedCategory,
    isActive,
    
    // Actions
    setCategory,
    clearCategory,
    toggleCategory
  }
}
