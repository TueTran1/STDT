import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNews } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'
import { 
  getPublishedArticles, 
  getSavedArticles,
  type ContentType 
} from '../services/contentService'
import { 
  ArticleCard, 
  type Article,
  LoadingState, 
  ErrorState, 
  EmptyState
} from '../components/ui'
import { MilitaryPageLayout } from '../components/layout'
import { Newspaper, Plus, Save } from 'lucide-react'

export const NewsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State for toggle between published and saved articles
  const [showSaved, setShowSaved] = useState(false)
  
  // Fetch published articles
  const { data: publishedNews, loading: publishedLoading, error: publishedError, refetch: refetchPublished } = useNews()
  
  // Fetch saved articles (only when toggle is active)
  const [savedNews, setSavedNews] = useState<Article[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedError, setSavedError] = useState<string | null>(null)
  
  // Load saved articles when toggle is active
  const loadSavedArticles = async () => {
    if (!user) return
    
    try {
      setSavedLoading(true)
      setSavedError(null)
      
      const savedArticles = await getSavedArticles('news', user.id)
      setSavedNews(savedArticles)
    } catch (err) {
      setSavedError(err instanceof Error ? err.message : 'Lỗi khi tải bài viết đã lưu')
    } finally {
      setSavedLoading(false)
    }
  }
  
  // Toggle between published and saved articles
  const handleToggleView = () => {
    const newShowSaved = !showSaved
    setShowSaved(newShowSaved)
    
    if (newShowSaved) {
      loadSavedArticles()
    }
  }
  
  // Handle article click
  const handleArticleClick = (article: Article) => {
    if (showSaved) {
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
  
  // Determine which data to display
  const displayData = showSaved ? savedNews : publishedNews
  const displayLoading = showSaved ? savedLoading : publishedLoading
  const displayError = showSaved ? savedError : publishedError
  const handleRefetch = showSaved ? loadSavedArticles : refetchPublished
  
  // Check if user is editor (for create button)
  const isEditor = user?.role === 'editor'
  
  return (
    <MilitaryPageLayout 
      title={<h2>BẢN TIN LỮ ĐOÀN</h2>}
      subtitle={showSaved ? "Bài viết đã lưu của bạn" : "Cập nhật thông tin mới nhất"}
    >
      {/* Action Bar */}
      <div className="page-actions">
        <div className="action-buttons">
          {isEditor && (
            <button 
              onClick={handleCreateNew}
              className="create-button"
            >
              <Plus size={16} />
              Tạo mới
            </button>
          )}
          
          <button 
            onClick={handleToggleView}
            className={`toggle-button ${showSaved ? 'active' : ''}`}
          >
            <Save size={16} />
            {showSaved ? 'Hiện thị đã xuất bản' : 'Bài đã lưu'}
          </button>
        </div>
        
        <div className="view-indicator">
          <span className={`indicator ${showSaved ? 'saved' : 'published'}`}>
            {showSaved ? 'ĐANG HIỂN THỊ CÁC BÀI VIẾT ĐÃ LƯU' : 'ĐANG HIỂN THỊ CÁC BÀI XUẤT BẢN'}
          </span>
        </div>
      </div>

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
            title={showSaved ? "CHƯA CÓ BÀI VIẾT ĐÃ LƯU" : "CHƯA CÓ TIN TỨC"}
            message={showSaved ? "Bạn chưa có bài viết nào đã lưu." : "Chưa có thông báo nào được đăng tải. Vui lòng quay lại sau."}
          />
        ) : (
          <div className="news-grid">
            {displayData.map((item: Article) => (
              <ArticleCard
                key={item.id}
                article={item}
                onClick={handleArticleClick}
                isSaved={showSaved}
              />
            ))}
          </div>
        )}
      </div>
    </MilitaryPageLayout>
  )
}

export default NewsPage
