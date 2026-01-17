import React from 'react'

export interface ArticleContentProps {
  content?: string
}

/**
 * ArticleContent Component
 * 
 * PURPOSE: Main content container for articles
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Content pages with HTML/text content
 * 
 * PROPS:
 * - content: Article content (HTML or plain text)
 * 
 * USAGE:
 * <ArticleContent content="<p>Article content</p>" />
 */
export const ArticleContent: React.FC<ArticleContentProps> = ({
  content
}) => {
  const processedContent = content?.replace(/\n/g, '<br />') || 'Nội dung đang được cập nhật...'

  return (
    <div className="bg-gradient-to-r from-red-800/50 to-red-900/50 border border-yellow-600 p-6 mb-6">
      <div 
        className="text-yellow-100 leading-relaxed prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: processedContent
        }} 
      />
    </div>
  )
}
