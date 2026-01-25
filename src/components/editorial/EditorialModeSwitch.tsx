import React from 'react'
import './EditorialModeSwitch.css'

export type ViewMode = 'published' | 'saved'

interface EditorialModeSwitchProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
  userRole?: string | null
}

export const EditorialModeSwitch: React.FC<EditorialModeSwitchProps> = ({
  viewMode,
  onChange,
  userRole
}) => {
  // Role-based visibility: ONLY editors can see this component
  if (userRole !== 'editor') {
    return null
  }

  const handleModeChange = (mode: ViewMode) => {
    if (mode !== viewMode) {
      onChange(mode)
    }
  }

  return (
    <div className="editorial-mode-switch">
      <div className="mode-segments">
        <button
          className={`mode-segment ${viewMode === 'published' ? 'active' : ''}`}
          onClick={() => handleModeChange('published')}
          aria-pressed={viewMode === 'published'}
          aria-label="Chế độ hiển thị bài đã xuất bản"
        >
          ĐÃ XUẤT BẢN
        </button>
        
        <div className="segment-divider" />
        
        <button
          className={`mode-segment ${viewMode === 'saved' ? 'active' : ''}`}
          onClick={() => handleModeChange('saved')}
          aria-pressed={viewMode === 'saved'}
          aria-label="Chế độ hiển thị bản nháp"
        >
          BẢN NHÁP
        </button>
      </div>
    </div>
  )
}

export default EditorialModeSwitch
