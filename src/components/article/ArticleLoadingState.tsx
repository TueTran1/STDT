import React from 'react'

export interface ArticleLoadingStateProps {
  message?: string
}

/**
 * ArticleLoadingState Component
 * 
 * PURPOSE: Loading state for article pages
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Content pages with loading states
 * 
 * PROPS:
 * - message: Loading message to display
 * 
 * USAGE:
 * <ArticleLoadingState message="Đang tải bài viết..." />
 */
export const ArticleLoadingState: React.FC<ArticleLoadingStateProps> = ({
  message = 'Đang tải bài viết...'
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="bronze-drum-pattern"></div>
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        <div className="text-center py-20">
          <div className="spinner"></div>
          <p className="text-yellow-200 mt-4">{message}</p>
        </div>
      </div>
    </div>
  )
}
