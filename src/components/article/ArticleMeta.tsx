import React from 'react'
import { highlightText } from '../../utils/highlightText'

export interface ArticleMetaProps {
  title: string
  previewText?: string
  searchQuery?: string
}

/**
 * ArticleMeta Component
 * 
 * PURPOSE: Displays article title and content preview with optional search highlighting
 * 
 * WHEN TO USE:
 * - News article previews
 * - Knowledge article previews
 * - Any article needing title + preview
 * 
 * PROPS:
 * - title: Article title
 * - previewText: Content preview text (truncated)
 * - searchQuery: Optional search query for highlighting
 * 
 * USAGE:
 * <ArticleMeta 
 *   title="Article Title"
 *   previewText="Preview text..."
 *   searchQuery="search term"
 * />
 */
export const ArticleMetaComponent: React.FC<ArticleMetaProps> = ({ 
  title, 
  previewText,
  searchQuery
}) => {
  // Apply search highlighting if search query is provided
  const highlightedTitle = React.useMemo(() => searchQuery 
    ? highlightText(title, searchQuery)
    : title, [title, searchQuery])
    
  const highlightedPreview = React.useMemo(() => searchQuery && previewText
    ? highlightText(previewText, searchQuery)
    : previewText, [previewText, searchQuery])

  return (
    <>
      {/* Title */}
      <div className="news-title">
        <h3 dangerouslySetInnerHTML={{ __html: highlightedTitle }} />
      </div>

      {/* Content Preview */}
      <div className="news-preview">
        <p dangerouslySetInnerHTML={{ 
          __html: highlightedPreview || 'Nội dung đang cập nhật...' 
        }} />
      </div>
    </>
  )
}

export const ArticleMeta = React.memo(ArticleMetaComponent)
