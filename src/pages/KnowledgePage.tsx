import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useArticleQuery } from '../hooks/useArticleQuery'
import { useSearchQuery } from '../hooks/useSearchQuery'
import { useCategoryFilter } from '../hooks/useCategoryFilter'
import { 
  ArticleCard, 
  type Article
} from '../components/ui'
import { MilitaryPageLayout } from '../components/layout'
import { SearchInput } from '../components/search/SearchInput'
import { CategoryFilter } from '../components/category/CategoryFilter'
import { ArticleGrid } from '../components/pagination/ArticleGrid'
import { EditorialModeSwitch } from '../components/editorial/EditorialModeSwitch'
import { Plus } from 'lucide-react'
import quanSuImage from '../assets/quan-su.png'
import hauCanImage from '../assets/hau-can.png'
import kyThuatImage from '../assets/ky-thuat.png'
import chinhTriImage from '../assets/chinh-tri.png'
import '../components/search/SearchInput.css'
import '../components/pagination/ArticleGrid.css'
import '../components/category/CategoryFilter.css'
import '../components/editorial/EditorialModeSwitch.css'
import './KnowledgePage.css'

const SECTIONS = [
  { id: 'quan-su', name: 'QUÂN SỰ', description: 'Kiến thức quân sự', icon: <img src={quanSuImage} alt="Quân sự" width="32" height="32" /> },
  { id: 'chinh-tri', name: 'CHÍNH TRỊ', description: 'Kiến thức chính trị', icon: <img src={chinhTriImage} alt="Chính trị" width="32" height="32" /> },
  { id: 'hau-can', name: 'HẬU CẦN', description: 'Kiến thức hậu cần', icon: <img src={hauCanImage} alt="Hậu cần" width="32" height="32" /> },
  { id: 'ky-thuat', name: 'KỸ THUẬT', description: 'Kiến thức kỹ thuật', icon: <img src={kyThuatImage} alt="Kỹ thuật" width="32" height="32" /> }
]

export const KnowledgePage: React.FC = () => {
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
    currentCategory,
    currentViewMode: queryViewMode
  } = useArticleQuery({
    articleType: 'knowledge',
    initialViewMode: 'published'
  })
  
  // Use queryViewMode for navigation logic to ensure consistency
  const navigationViewMode = queryViewMode
  
  // Search state management
  const { isActive: isSearchActive } = useSearchQuery()
  
  // Category state management
  const { isActive: isCategoryActive } = useCategoryFilter()
  
  // Handle article click based on view mode
  const handleArticleClick = (article: Article) => {
    if (navigationViewMode === 'saved') {
      // Saved articles: navigate to edit page
      navigate(`/knowledge/edit/${article.id}`)
    } else {
      // Published articles: navigate to public view
      navigate(`/knowledge/${article.slug}`)
    }
  }
  
  // Handle create new article
  const handleCreateNew = () => {
    navigate('/knowledge/create')
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
      title={<h2>KIẾN THỨC CẦN CÓ</h2>}
      subtitle={isSearchActive ? `Tìm kiếm: ${currentSearchQuery || ''}` : (isCategoryActive ? `Danh mục: ${SECTIONS.find(s => s.id === currentCategory)?.name || ''}` : (queryViewMode === 'saved' ? "Bản nháp của bạn" : "Nền tảng kiến thức quân sự toàn diện"))}
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
        placeholder="Tìm kiếm kiến thức..."
        className="knowledge-search"
      />

      {/* Category Filter */}
      <CategoryFilter 
        categories={SECTIONS}
        className="knowledge-categories"
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
        className="knowledge-articles"
      />
    </MilitaryPageLayout>
  )
}

export default KnowledgePage
