// ArticleGrid Component
// Article display with pagination
// NO data fetching logic
// NO query logic
// FAILURE PROOFED UI BINDING

import React from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import type { Article } from '../ui'

export interface ArticleGridProps {
  articles: Article[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null
  onLoadMore: () => Promise<void>
  onArticleClick: (article: Article) => void
  searchQuery?: string | null
  viewMode?: 'published' | 'saved'
  className?: string
  renderArticleCard: (article: Article, onClick: (article: Article) => void, searchQuery?: string | null) => React.ReactNode
}

/**
 * Article grid component with pagination
 * Displays articles and load more functionality
 * Delegates all data operations to parent
 * FAILURE PROOFED - prevents all known regression patterns
 */
export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  onArticleClick,
  searchQuery = null,
  viewMode = 'published',
  className = "",
  renderArticleCard
}) => {
  // FAILURE PROOFING: Guard against duplicate fetch attempts
  const [isLoadMorePending, setIsLoadMorePending] = React.useState(false)
  
  // Handle load more click with failure proofing
  const handleLoadMore = React.useCallback(async () => {
    // INVARIANT: Only one load more operation at a time
    if (isLoadMorePending || isLoadingMore || !hasMore) {
      console.warn('Load more blocked by invariant check', {
        isLoadMorePending,
        isLoadingMore,
        hasMore
      })
      return
    }
    
    setIsLoadMorePending(true)
    
    try {
      await onLoadMore()
    } catch (error) {
      console.error('Load more failed:', error)
      // FAILURE PROOF: Don't update UI state on error
    } finally {
      setIsLoadMorePending(false)
    }
  }, [isLoadMorePending, isLoadingMore, hasMore, onLoadMore])

  // Handle article click
  const handleArticleClick = React.useCallback((article: Article) => {
    // FAILURE PROOF: Ensure article has required properties
    if (!article || !article.id) {
      console.error('Invalid article clicked:', article)
      return
    }
    
    onArticleClick(article)
  }, [onArticleClick])

  // FAILURE PROOFING: Validate articles array
  const validArticles = React.useMemo(() => {
    if (!Array.isArray(articles)) {
      console.error('Articles is not an array:', articles)
      return []
    }
    
    return articles.filter(article => 
      article && 
      typeof article === 'object' && 
      'id' in article && 
      'title' in article
    )
  }, [articles])

  // FAILURE PROOFING: Ensure no duplicate articles
  const uniqueArticles = React.useMemo(() => {
    const seenIds = new Set()
    return validArticles.filter(article => {
      if (seenIds.has(article.id)) {
        console.warn('Duplicate article detected and filtered:', article.id)
        return false
      }
      seenIds.add(article.id)
      return true
    })
  }, [validArticles])

  // Loading state
  if (isLoading && validArticles.length === 0) {
    return (
      <div className={`article-grid-loading ${className}`}>
        <div className="loading-spinner">
          <Loader2 size={24} className="animate-spin" />
          <span>Đang tải bài viết...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error && validArticles.length === 0) {
    return (
      <div className={`article-grid-error ${className}`}>
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      </div>
    )
  }

  // Empty state
  if (validArticles.length === 0) {
    return (
      <div className={`article-grid-empty ${className}`}>
        <div className="empty-message">
          <span>
            {searchQuery 
              ? `Không tìm thấy kết quả cho "${searchQuery}"`
              : viewMode === 'saved' 
                ? 'Chưa có bản nháp nào'
                : 'Chưa có bài viết nào'
            }
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`article-grid ${className}`}>
      {/* Articles grid */}
      <div className="articles-grid">
        {uniqueArticles.map((article) => (
          <div key={article.id} className="article-item">
            {renderArticleCard(article, handleArticleClick, searchQuery)}
          </div>
        ))}
      </div>

      {/* Load more button - FAILURE PROOFED VISIBILITY */}
      {/* INVARIANT: Button visibility driven ONLY by hasMore */}
      {hasMore && (
        <div className="load-more-container">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore || isLoadMorePending}
            className="load-more-button"
            aria-label="Tải thêm bài viết"
          >
            {(isLoadingMore || isLoadMorePending) ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Đang tải thêm...</span>
              </>
            ) : (
              <>
                <ChevronDown size={20} />
                <span>Tải thêm</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* End of articles indicator */}
      {!hasMore && uniqueArticles.length > 0 && (
        <div className="articles-end">
          <span>Bạn đã xem hết bài viết</span>
        </div>
      )}
    </div>
  )
}

export default ArticleGrid
