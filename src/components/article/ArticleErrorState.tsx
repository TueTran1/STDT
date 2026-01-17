import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshButton } from '../ui/RefreshButton'
import { ArrowLeft } from 'lucide-react'
import logoBrigade from '../../assets/logo-brigade.png'

export interface ArticleErrorStateProps {
  error?: string
  onRetry?: () => void
}

/**
 * ArticleErrorState Component
 * 
 * PURPOSE: Error state for article pages
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Content pages with error handling
 * 
 * PROPS:
 * - error: Error message to display
 * - onRetry: Callback for retry action
 * 
 * USAGE:
 * <ArticleErrorState error="Failed to load" onRetry={retry} />
 */
export const ArticleErrorState: React.FC<ArticleErrorStateProps> = ({
  error,
  onRetry
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="not-found-page">
      <div className="bronze-drum-pattern"></div>
      
      <div className="main-container">
        <div className="not-found-content">
          {/* Header Emblem */}
          <div className="header-emblem">
            <img src={logoBrigade} alt="Lữ Đoàn 83" width="120" height="120" />
          </div>

          {/* Error Messages */}
          <div className="greeting-text">
            LỖI TẢI BÀI VIẾT
          </div>
          <div className="subtitle-text">
            {error || 'Bài viết không tồn tại'}
          </div>
        
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <button
              onClick={handleBack}
              className="military-button"
              style={{ 
                maxWidth: '200px', 
                fontSize: '16px',
                padding: '16px'
              }}
            >
              <div className="icon-large">
                <ArrowLeft size={32} />
              </div>
              <div>QUAY LẠI</div>
            </button>
            
            {onRetry && (
              <RefreshButton 
                onClick={onRetry} 
                variant="large"
                className="max-w-[200px]"
              />
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}
