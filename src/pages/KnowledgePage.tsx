import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKnowledge } from '../hooks/useFirestore'
import {
  ArticleCard,
  type Article,
  KnowledgeSectionSelector,
  type KnowledgeSection,
  LoadingState,
  ErrorState,
  EmptyState
} from '../components/ui'
import { MilitaryPageLayout } from '../components/layout'
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
  
  // State for selected section - null means show all sections
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  
  // Fetch knowledge articles based on selected sections
  const { data: knowledge, loading, error, refetch } = useKnowledge()

  // Filter articles based on selected section and map to Article type
  // If selectedSection === null → show ALL articles
  // Else → show ONLY articles where article.category === selectedSection
  const filteredKnowledge = knowledge?.filter(article => {
    if (selectedSection === null) {
      return true // Show all articles
    } else {
      return article.category === selectedSection // Show only selected section
    }
  }).map(doc => ({
    id: doc.id,
    title: doc.title,
    content: doc.summary,
    category: doc.category,
    author: { displayName: doc.author.displayName },
    createdAt: (() => {
      const date = doc.createdAt
      if (date && typeof date === 'object' && 'toDate' in date && typeof (date as any).toDate === 'function') {
        return (date as any).toDate().toISOString()
      } else if (date instanceof Date) {
        return date.toISOString()
      } else if (typeof date === 'string') {
        return new Date(date).toISOString()
      }
      return new Date().toISOString()
    })(),
    tags: doc.tags,
    image: doc.media?.images?.[0] || null, // Safe access with fallback
    views: 0, // Default to 0 since views field doesn't exist
    updatedAt: (() => {
      const date = doc.updatedAt
      if (date && typeof date === 'object' && 'toDate' in date && typeof (date as any).toDate === 'function') {
        return (date as any).toDate().toISOString()
      } else if (date instanceof Date) {
        return date.toISOString()
      } else if (typeof date === 'string') {
        return new Date(date).toISOString()
      }
      return new Date().toISOString()
    })(),
    slug: doc.slug
  })) || []

  // Simple section selection logic - toggle back to null when same section clicked
  const onSectionSelect = (sectionId: string) => {
    if (selectedSection === sectionId) {
      // If clicking the same section, reset to null (show all)
      setSelectedSection(null)
    } else {
      // If clicking different section or no section selected, set to new section
      setSelectedSection(sectionId)
    }
  }

  // Handle article click
  const handleArticleClick = (article: Article) => {
    navigate(`/knowledge/${article.slug}`)
  }

  return (
    <MilitaryPageLayout 
      title={<h2>KIẾN THỨC TỔNG HỢP</h2>}
      subtitle="Nền tảng kiến thức quân sự toàn diện"
    >
      {/* Section Selection */}
      <KnowledgeSectionSelector
        sections={SECTIONS}
        selectedSection={selectedSection}
        onSectionSelect={onSectionSelect}
      />

      {/* Knowledge Content */}
      <div className="knowledge-content">
        {loading ? (
          <LoadingState message="Đang tải kiến thức..." />
        ) : error ? (
          <ErrorState 
            message={error}
            onRetry={refetch}
          />
        ) : filteredKnowledge.length === 0 ? (
          <EmptyState
            icon="📚"
            title="CHƯA CÓ KIẾN THỨC"
            message="Chưa có kiến thức cho các ngành đã chọn."
          />
        ) : (
          <div className="knowledge-grid">
            {filteredKnowledge.map((article: Article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={handleArticleClick}
              />
            ))}
          </div>
        )}
      </div>
    </MilitaryPageLayout>
  )
}

export default KnowledgePage
