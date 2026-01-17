import React from 'react'

export interface ArticleMetaProps {
  title: string
  previewText?: string
}

/**
 * ArticleMeta Component
 * 
 * PURPOSE: Displays article title and content preview
 * 
 * WHEN TO USE:
 * - News article previews
 * - Knowledge article previews
 * - Any article needing title + preview
 * 
 * PROPS:
 * - title: Article title
 * - previewText: Content preview text (truncated)
 * 
 * USAGE:
 * <ArticleMeta 
 *   title="Article Title"
 *   previewText="Preview text..."
 * />
 */
export const ArticleMeta: React.FC<ArticleMetaProps> = ({ 
  title, 
  previewText 
}) => {
  return (
    <>
      {/* Title */}
      <div className="news-title">
        <h3>{title}</h3>
      </div>

      {/* Content Preview */}
      <div className="news-preview">
        <p>{previewText || 'Nội dung đang cập nhật...'}</p>
      </div>
    </>
  )
}
