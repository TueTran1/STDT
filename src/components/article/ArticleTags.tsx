import React from 'react'

export interface ArticleTagsProps {
  tags: string[]
  mode?: 'read' | 'edit'
  onChange?: (tags: string[]) => void
  maxTags?: number
}

/**
 * ArticleTags Component
 * 
 * PURPOSE: Display and edit article tags
 * 
 * USAGE:
 * <ArticleTags tags={['tag1', 'tag2']} mode="read" />
 * <ArticleTags tags={['tag1', 'tag2']} mode="edit" onChange={handleChange} />
 */
export const ArticleTags: React.FC<ArticleTagsProps> = ({ 
  tags, 
  mode = 'read',
  onChange,
  maxTags = 10 
}) => {
  if (mode === 'edit') {
    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTags = e.target.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, maxTags)
      onChange?.(newTags)
    }

    return (
      <div className="article-tags-editor">
        <label>Tags</label>
        <input
          type="text"
          value={tags.join(', ')}
          onChange={handleTagsChange}
          placeholder="tag1, tag2, tag3..."
          className="tags-input"
        />
        <small>Cách nhau bằng dấu phẩy (tối đa {maxTags} tags)</small>
      </div>
    )
  }

  // Read mode
  if (!tags || tags.length === 0) {
    return null
  }

  const displayTags = tags.slice(0, maxTags)
  const remainingCount = tags.length - maxTags

  return (
    <div className="article-tags-display">
      <div className="tag-list">
        {displayTags.map((tag: string, index: number) => (
          <span key={index} className="tag">#{tag}</span>
        ))}
        {remainingCount > 0 && (
          <span className="tag-more">+{remainingCount}</span>
        )}
      </div>
    </div>
  )
}
