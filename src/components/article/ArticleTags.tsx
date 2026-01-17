import React from 'react'

export interface ArticleTagsProps {
  tags?: string[]
  maxTags?: number
}

/**
 * ArticleTags Component
 * 
 * PURPOSE: Displays article tags with overflow counter
 * 
 * WHEN TO USE:
 * - News article tags
 * - Knowledge article tags
 * - Any article with tag array
 * 
 * PROPS:
 * - tags: Array of tag strings
 * - maxTags: Maximum tags to display (default: 3)
 * 
 * USAGE:
 * <ArticleTags 
 *   tags={['tag1', 'tag2', 'tag3']}
 *   maxTags={3}
 * />
 */
export const ArticleTags: React.FC<ArticleTagsProps> = ({ 
  tags = [], 
  maxTags = 3 
}) => {
  if (!tags || tags.length === 0) {
    return null
  }

  const displayTags = tags.slice(0, maxTags)
  const remainingCount = tags.length - maxTags

  return (
    <div className="news-tags">
      {displayTags.map((tag: string, index: number) => (
        <span key={index} className="tag">#{tag}</span>
      ))}
      {remainingCount > 0 && (
        <span className="tag-more">+{remainingCount}</span>
      )}
    </div>
  )
}
