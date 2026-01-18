import React from 'react'

export interface ArticleSummaryProps {
  summary: string
  mode?: 'read' | 'edit'
  onChange?: (summary: string) => void
}

/**
 * ArticleSummary Component
 * 
 * PURPOSE: Knowledge article summary display and editing
 * 
 * USAGE:
 * <ArticleSummary summary="Summary text" mode="read" />
 * <ArticleSummary summary="Summary text" mode="edit" onChange={handleChange} />
 */
export const ArticleSummary: React.FC<ArticleSummaryProps> = ({
  summary,
  mode = 'read',
  onChange
}) => {
  if (mode === 'edit') {
    return (
      <div className="article-summary-editor">
        <label>Tóm tắt</label>
        <textarea
          value={summary}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Nhập tóm tắt kiến thức..."
          className="summary-textarea"
          rows={3}
        />
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="article-summary-display">
      <div className="article-summary">
        <h3 className="summary-title">TÓM TẮT</h3>
        <p className="summary-content">{summary}</p>
      </div>
    </div>
  )
}
