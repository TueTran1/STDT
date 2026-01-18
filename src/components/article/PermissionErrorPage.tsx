import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { MilitaryPageLayout } from '../layout'
import './PermissionErrorPage.css'

interface PermissionErrorPageProps {
  title: string
  message: string
  backRoute: string
  showBackButton?: boolean
}

/**
 * PermissionErrorPage Component
 * 
 * PURPOSE: Display permission errors with clear messaging
 * 
 * FEATURES:
 * - Clear error explanation
 * - Back navigation
 * - Military theme styling
 */
export const PermissionErrorPage: React.FC<PermissionErrorPageProps> = ({
  title,
  message,
  backRoute,
  showBackButton = true
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(backRoute)
  }

  return (
    <MilitaryPageLayout 
      title={<h2>{title}</h2>}
      showTopIcons={false}
    >
      <div className="permission-error-container">
        <div className="error-icon">
          <AlertTriangle size={48} />
        </div>
        
        <div className="error-content">
          <h3 className="error-title">{title}</h3>
          <p className="error-message">{message}</p>
        </div>
        
        {showBackButton && (
          <div className="error-actions">
            <button 
              onClick={handleBack}
              className="back-button"
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </button>
          </div>
        )}
      </div>
    </MilitaryPageLayout>
  )
}

export default PermissionErrorPage
