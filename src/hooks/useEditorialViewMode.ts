import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSavedArticles } from '../services/contentService'
import { type Article } from '../components/ui'

export type ViewMode = 'published' | 'saved'

interface UseEditorialViewModeOptions {
  contentType: 'knowledge' | 'news'
  publishedData: Article[]
  publishedLoading: boolean
  publishedError: string | null
  refetchPublished: () => void
}

interface UseEditorialViewModeReturn {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  displayData: Article[]
  displayLoading: boolean
  displayError: string | null
  handleRefetch: () => void
  canToggle: boolean
}

export const useEditorialViewMode = ({
  contentType,
  publishedData,
  publishedLoading,
  publishedError,
  refetchPublished
}: UseEditorialViewModeOptions): UseEditorialViewModeReturn => {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('published')
  
  // Saved articles state (only loaded when needed)
  const [savedData, setSavedData] = useState<Article[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedError, setSavedError] = useState<string | null>(null)
  const [savedDataLoaded, setSavedDataLoaded] = useState(false)

  // Check if user can toggle (must be editor)
  const canToggle = user?.role === 'editor'

  // Load saved articles only when switching to saved mode
  const loadSavedArticles = useCallback(async () => {
    if (!user || !canToggle || savedDataLoaded) return

    try {
      setSavedLoading(true)
      setSavedError(null)
      
      const savedArticles = await getSavedArticles(contentType, user.uid)
      setSavedData(savedArticles)
      setSavedDataLoaded(true)
    } catch (err) {
      setSavedError(err instanceof Error ? err.message : 'Lỗi khi tải bài viết đã lưu')
    } finally {
      setSavedLoading(false)
    }
  }, [user, canToggle, contentType, savedDataLoaded])

  // Handle view mode change with performance optimization
  const handleSetViewMode = useCallback((mode: ViewMode) => {
    if (mode === viewMode) return
    
    setViewMode(mode)
    
    // Only load saved data when switching to saved mode
    if (mode === 'saved' && !savedDataLoaded) {
      loadSavedArticles()
    }
  }, [viewMode, savedDataLoaded, loadSavedArticles])

  // Reset saved data when user changes or logs out
  useEffect(() => {
    if (!user || !canToggle) {
      setSavedData([])
      setSavedDataLoaded(false)
      setSavedError(null)
      if (viewMode === 'saved') {
        setViewMode('published')
      }
    }
  }, [user, canToggle, viewMode])

  // Determine which data to display (mutually exclusive)
  const displayData = viewMode === 'saved' ? savedData : publishedData
  const displayLoading = viewMode === 'saved' ? savedLoading : publishedLoading
  const displayError = viewMode === 'saved' ? savedError : publishedError
  const handleRefetch = viewMode === 'saved' ? loadSavedArticles : refetchPublished

  return {
    viewMode,
    setViewMode: handleSetViewMode,
    displayData,
    displayLoading,
    displayError,
    handleRefetch,
    canToggle
  }
}
