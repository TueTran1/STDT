import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useNews } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'
import { useEditorialViewMode } from '../hooks/useEditorialViewMode'
import { 
  ArticleCard, 
  type Article,
  LoadingState, 
  ErrorState, 
  EmptyState
} from '../components/ui'
import { MilitaryPageLayout } from '../components/layout'
import { EditorialModeSwitch } from '../components/editorial/EditorialModeSwitch'
import { Newspaper, Plus } from 'lucide-react'

export const NewsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Fetch published articles
  const { data: publishedNews, loading: publishedLoading, error: publishedError, refetch: refetchPublished } = useNews()
  
  // Optimized view mode management with role-based access
  const {
    viewMode,
    setViewMode,
    displayData,
    displayLoading,
    displayError,
    handleRefetch
  } = useEditorialViewMode({
    contentType: 'news',
    publishedData: publishedNews,
    publishedLoading,
    publishedError,
    refetchPublished
  })
  
  // Handle article click based on view mode
  const handleArticleClick = (article: Article) => {
    if (viewMode === 'saved') {
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
  
  return (
    <MilitaryPageLayout 
      title={<h2>BẢN TIN LỮ ĐOÀN</h2>}
      subtitle={viewMode === 'saved' ? "Bản nháp của bạn" : "Cập nhật thông tin mới nhất"}
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
            
            <EditorialModeSwitch
              viewMode={viewMode}
              onChange={setViewMode}
              userRole={user?.role}
            />
          </div>
        </div>
      )}

      {/* News Content */}
      <div className="news-content">
        {displayLoading ? (
          <LoadingState message="Đang tải tin tức..." />
        ) : displayError ? (
          <ErrorState 
            message={displayError}
            onRetry={handleRefetch}
          />
        ) : displayData.length === 0 ? (
          <EmptyState
            icon={<Newspaper size={48} />}
            title={viewMode === 'saved' ? "CHƯA CÓ BẢN NHÁP" : "CHƯA CÓ TIN TỨC"}
            message={viewMode === 'saved' ? "Bạn chưa có bản nháp nào." : "Chưa có thông báo nào được đăng tải. Vui lòng quay lại sau."}
          />
        ) : (
          <div className="news-grid">
            {displayData.map((item: Article) => (
              <ArticleCard
                key={item.id}
                article={item}
                onClick={handleArticleClick}
                isSaved={viewMode === 'saved'}
              />
            ))}
          </div>
        )}
      </div>
    </MilitaryPageLayout>
  )
}

export default NewsPage
