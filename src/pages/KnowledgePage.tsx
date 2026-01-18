import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useKnowledge } from '../hooks/useFirestore'
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
import { BookOpen, Plus, Save } from 'lucide-react'
import quanSuImage from '../assets/quan-su.png'
import hauCanImage from '../assets/hau-can.png'
import kyThuatImage from '../assets/ky-thuat.png'
import chinhTriImage from '../assets/chinh-tri.png'

const SECTIONS: KnowledgeSection[] = [
  { id: 'quan-su', name: 'QUÂN SỰ', description: 'Kiến thức quân sự', icon: <img src={quanSuImage} alt="Quân sự" width="32" height="32" /> },
  { id: 'chinh-tri', name: 'CHÍNH TRỊ', description: 'Kiến thức chính trị', icon: <img src={chinhTriImage} alt="Chính trị" width="32" height="32" /> },
  { id: 'hau-can', name: 'HẬU CẦN', description: 'Kiến thức hậu cần', icon: <img src={hauCanImage} alt="Hậu cần" width="32" height="32" /> },
  { id: 'ky-thuat', name: 'KỸ THUẬT', description: 'Kiến thức kỹ thuật', icon: <img src={kyThuatImage} alt="Kỹ thuật" width="32" height="32" /> }
]

export const KnowledgePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State for toggle between published and saved articles
  const [showSaved, setShowSaved] = useState(false)
  
  // Fetch published articles
  const { data: publishedKnowledge, loading: publishedLoading, error: publishedError, refetch: refetchPublished } = useKnowledge()
  
  // Fetch saved articles (only when toggle is active)
  const [savedKnowledge, setSavedKnowledge] = useState<Article[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedError, setSavedError] = useState<string | null>(null)
  
  // Load saved articles when toggle is active
  const loadSavedArticles = async () => {
    if (!user) return
    
    try {
      setSavedLoading(true)
      setSavedError(null)
      
      const savedArticles = await getSavedArticles('knowledge', user.id)
      setSavedKnowledge(savedArticles)
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
  
  // Determine which data to display
  const displayData = showSaved ? savedKnowledge : publishedKnowledge
  const displayLoading = showSaved ? savedLoading : publishedLoading
  const displayError = showSaved ? savedError : publishedError
  const handleRefetch = showSaved ? loadSavedArticles : refetchPublished
  
  // Check if user is editor (for create button)
  const isEditor = user?.role === 'editor'
  
  return (
    <MilitaryPageLayout 
      title={<h2>KIẾN THỨC TỔNG HỢP</h2>}
      subtitle={showSaved ? "Bài viết đã lưu của bạn" : "Nền tảng kiến thức quân sự toàn diện"}
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

      {/* Section Selection */}
      <KnowledgeSectionSelector
        sections={SECTIONS}
        selectedSection={null}
        onSectionSelect={() => {}} // Disabled when showing saved articles
      />

      {/* Knowledge Content */}
      <div className="knowledge-content">
        {displayLoading ? (
          <LoadingState message="Đang tải kiến thức..." />
        ) : displayError ? (
          <ErrorState 
            message={displayError}
            onRetry={handleRefetch}
          />
        ) : displayData.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={48} />}
            title={showSaved ? "CHƯA CÓ BÀI VIẾT ĐÃ LƯU" : "CHƯA CÓ KIẾN THỨC"}
            message={showSaved ? "Bạn chưa có bài viết nào đã lưu." : "Chưa có kiến thức cho các ngành đã chọn."}
          />
        ) : (
          <div className="knowledge-grid">
            {displayData.map((article: Article) => (
              <ArticleCard
                key={article.id}
                article={article}
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

export default KnowledgePage
