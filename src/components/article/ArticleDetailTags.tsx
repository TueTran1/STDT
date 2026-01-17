import React from 'react'

export interface ArticleDetailTagsProps {
  tags?: string[]
}

/**
 * ArticleDetailTags Component
 * 
 * PURPOSE: Tags section for article detail pages
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Content pages with tag metadata
 * 
 * PROPS:
 * - tags: Array of tag strings
 * 
 * USAGE:
 * <ArticleDetailTags tags={['tag1', 'tag2']} />
 */
export const ArticleDetailTags: React.FC<ArticleDetailTagsProps> = ({
  tags
}) => {
  if (!tags || tags.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-yellow-300 mb-4">THẺ TAGS</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string, index: number) => (
          <span key={index} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded text-sm">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}
