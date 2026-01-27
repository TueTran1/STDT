import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useKnowledge } from '../hooks/useFirestore'
import { useEditorialViewMode } from '../hooks/useEditorialViewMode'
import { 
  ArticleCard, 
  type Article,
  LoadingState, 
  ErrorState, 
  EmptyState
} from '../components/ui'
import { MilitaryPageLayout } from '../components/layout'
import { KnowledgeSectionSelector, type KnowledgeSection } from '../components/knowledge/KnowledgeSectionSelector'
import { EditorialModeSwitch } from '../components/editorial/EditorialModeSwitch'
import { BookOpen, Plus } from 'lucide-react'
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
  
  // State for selected section
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null)
  
  // Fetch published articles
  const { data: publishedKnowledge, loading: publishedLoading, error: publishedError, refetch: refetchPublished } = useKnowledge()
  
  // Optimized view mode management with role-based access
  const {
    viewMode,
    setViewMode,
    displayData,
    displayLoading,
    displayError,
    handleRefetch
  } = useEditorialViewMode({
    contentType: 'knowledge',
    publishedData: publishedKnowledge,
    publishedLoading,
    publishedError,
    refetchPublished
  })
  
  // Filter articles by selected section
  const filteredData = React.useMemo(() => {
    if (!selectedSection) return displayData
    return displayData.filter((article: Article) => article.category === selectedSection)
  }, [displayData, selectedSection])
  
  // Handle article click based on view mode
  const handleArticleClick = (article: Article) => {
    if (viewMode === 'saved') {
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
  
  return (
    <MilitaryPageLayout 
      title={<h2>KIẾN THỨC CẦN CÓ</h2>}
      subtitle={viewMode === 'saved' ? "Bản nháp của bạn" : "Nền tảng kiến thức quân sự toàn diện"}
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

      {/* Section Selection */}
      <KnowledgeSectionSelector
        sections={SECTIONS}
        selectedSection={selectedSection}
        onSectionSelect={setSelectedSection}
      />

      {/* Knowledge Content */}
      <div className="knowledge-content" style={{ marginTop: '2rem' }}>
        {displayLoading ? (
          <LoadingState message="Đang tải kiến thức..." />
        ) : displayError ? (
          <ErrorState 
            message={displayError}
            onRetry={handleRefetch}
          />
        ) : filteredData.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={48} />}
            title={viewMode === 'saved' ? "CHƯA CÓ BẢN NHÁP" : "CHƯA CÓ KIẾN THỨC"}
            message={viewMode === 'saved' ? "Bạn chưa có bản nháp nào." : (selectedSection ? `Chưa có kiến thức cho ngành ${SECTIONS.find(s => s.id === selectedSection)?.name}.` : "Chưa có kiến thức cho các ngành đã chọn.")}
          />
        ) : (
          <div className="knowledge-grid">
            {filteredData.map((article: Article) => (
              <ArticleCard
                key={article.id}
                article={article}
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

export default KnowledgePage
