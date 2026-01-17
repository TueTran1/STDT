import React from 'react'

export interface ArticleSummaryProps {
  summary?: string
}

/**
 * ArticleSummary Component
 * 
 * PURPOSE: Summary/excerpt section for articles
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Content pages with summaries
 * 
 * PROPS:
 * - summary: Summary text content
 * 
 * USAGE:
 * <ArticleSummary summary="Article summary text" />
 */
export const ArticleSummary: React.FC<ArticleSummaryProps> = ({
  summary
}) => {
  if (!summary) return null

  return (
    <div className="bg-gradient-to-r from-red-800/50 to-red-900/50 border border-yellow-600 p-6 mb-6">
      <p className="text-yellow-100 leading-relaxed text-lg">
        {summary}
      </p>
    </div>
  )
}
