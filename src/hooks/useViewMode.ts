// useViewMode Hook
// Published/saved mode switching ONLY
// NO data fetching
// NO pagination logic
// COMPLETE MODE ISOLATION

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { ViewMode } from './useArticleQuery'

export interface UseViewModeOptions {
  initialMode?: ViewMode
}

export interface UseViewModeReturn {
  // View mode state
  viewMode: ViewMode
  canToggle: boolean
  
  // Actions
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
}

/**
 * View mode management ONLY
 * Handles published/saved switching
 * Triggers articleQuery re-fetch via global update mechanism
 * COMPLETE MODE ISOLATION - no shared state
 */
export const useViewMode = ({
  initialMode = 'published'
}: UseViewModeOptions = {}): UseViewModeReturn => {
  const { user } = useAuth()
  const [viewMode, setViewModeState] = useState<ViewMode>(initialMode)

  // Check if user can toggle (must be editor)
  const canToggle = user?.role === 'editor'

  // Update articleQuery when view mode changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__articleQueryUpdate) {
      const { updateViewMode } = (window as any).__articleQueryUpdate
      updateViewMode(viewMode)
    }
  }, [viewMode])

  // Set view mode directly - MODE ISOLATION
  const setViewMode = useCallback((mode: ViewMode) => {
    if (canToggle && mode !== viewMode) {
      setViewModeState(mode)
      // ArticleQuery will automatically reset due to key change
    }
  }, [canToggle, viewMode])

  // Toggle between modes - COMPLETE STATE INVALIDATION
  const toggleViewMode = useCallback(() => {
    if (canToggle) {
      setViewModeState(prev => prev === 'published' ? 'saved' : 'published')
      // ArticleQuery will automatically reset due to key change
    }
  }, [canToggle])

  // Reset to published if user loses editor permissions
  useEffect(() => {
    if (!canToggle && viewMode === 'saved') {
      setViewModeState('published')
    }
  }, [canToggle, viewMode])

  return {
    // View mode state
    viewMode,
    canToggle,
    
    // Actions
    setViewMode,
    toggleViewMode
  }
}
