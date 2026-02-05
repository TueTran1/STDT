// EditorialModeSwitch Component
// Toggle switch for published/saved view modes
// Only visible to users with editor permissions

import React from 'react'
import { useViewMode } from '../../hooks/useViewMode'

export interface EditorialModeSwitchProps {
  className?: string
}

/**
 * Editorial mode switch component
 * Handles published/saved switching for editors
 * Integrates with useViewMode hook
 * Uses formal military color scheme (red/gold)
 */
export const EditorialModeSwitch: React.FC<EditorialModeSwitchProps> = ({
  className = ""
}) => {
  const { viewMode, canToggle, toggleViewMode } = useViewMode()

  // Don't render if user can't toggle
  if (!canToggle) {
    return null
  }

  return (
    <div className={`editorial-mode-switch ${className}`}>
      <div className="mode-toggle-group">
        <button
          className={`mode-button ${viewMode === 'published' ? 'active' : ''}`}
          onClick={() => viewMode !== 'published' && toggleViewMode()}
          aria-label="Hiển thị bài viết đã xuất bản"
        >
          <span className="mode-indicator published-indicator"></span>
          <span className="mode-text">Đã xuất bản</span>
        </button>
        
        <button
          className={`mode-button ${viewMode === 'saved' ? 'active' : ''}`}
          onClick={() => viewMode !== 'saved' && toggleViewMode()}
          aria-label="Hiển thị bài viết bản nháp"
        >
          <span className="mode-indicator saved-indicator"></span>
          <span className="mode-text">Bản nháp</span>
        </button>
      </div>
    </div>
  )
}

export default EditorialModeSwitch
