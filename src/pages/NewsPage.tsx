import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useArticleQuery } from '../hooks/useArticleQuery'
import { useSearchQuery } from '../hooks/useSearchQuery'
import { 
  ArticleCard, 
  type Article
} from '../components/ui'
import { MilitaryPageLayout } from '../components/layout'
import { SearchInput } from '../components/search/SearchInput'
import { ArticleGrid } from '../components/pagination/ArticleGrid'
import { EditorialModeSwitch } from '../components/editorial/EditorialModeSwitch'
import { Plus } from 'lucide-react'
import '../components/search/SearchInput.css'
import '../components/pagination/ArticleGrid.css'
import '../components/editorial/EditorialModeSwitch.css'
import './NewsPage.css'

export const NewsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Use the new architecture - single source of truth for article data
  const {
    articles,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    currentSearchQuery,
    currentViewMode: queryViewMode
  } = useArticleQuery({
    articleType: 'news',
    initialViewMode: 'published'
  })
  
  // Use queryViewMode for navigation logic to ensure consistency
  const navigationViewMode = queryViewMode
  
  // Search state management
  const { isActive: isSearchActive } = useSearchQuery()
  
  // Handle article click based on view mode
  const handleArticleClick = (article: Article) => {
    if (navigationViewMode === 'saved') {
      // Saved articles: navigate to edit page
      navigate(`/news/edit/${article.id}`)
    } else {
      // Published articles: navigate to public view
      navigate(`/news/${article.slug}`)
    }
  }
  
  // Handle create new article
  const handleCreateNew = () => {
    navigate('/news/create')
  }
  
  // Check if user is editor (for create button)
  const isEditor = user?.role === 'editor'
  
  // Render article card
  const renderArticleCard = (article: Article, onClick: (article: Article) => void, searchQuery?: string | null) => {
    return (
      <ArticleCard
        key={article.id}
        article={article}
        onClick={onClick}
        isSaved={navigationViewMode === 'saved'}
        searchQuery={searchQuery || undefined}
      />
    )
  }
  
  return (
    <MilitaryPageLayout 
      title={<h2>TIN TỨC</h2>}
      subtitle={isSearchActive ? `Tìm kiếm: ${currentSearchQuery || ''}` : (queryViewMode === 'saved' ? "Bản nháp của bạn" : "Bản tin Lữ đoàn")}
    >
      {/* Editorial Controls - Only visible to editors */}
      {isEditor && (
        <div className="page-actions">
          <div className="action-buttons">
            <button 
              onClick={handleCreateNew}
              className="create-button"
            >
              <Plus size={16} />
              Tạo mới
            </button>
            
            <EditorialModeSwitch className="editorial-mode-toggle" />
          </div>
        </div>
      )}

      {/* Search Input */}
      <SearchInput 
        placeholder="Tìm kiếm tin tức..."
        className="news-search"
      />

      {/* Article Grid with Pagination */}
      <ArticleGrid
        articles={articles}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        error={error}
        onLoadMore={loadMore}
        onArticleClick={handleArticleClick}
        searchQuery={currentSearchQuery}
        viewMode={queryViewMode}
        renderArticleCard={renderArticleCard}
        className="news-articles"
      />
    </MilitaryPageLayout>
  )
}

export default NewsPage
