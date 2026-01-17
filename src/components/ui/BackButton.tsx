import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export interface BackButtonProps {
  className?: string
  onClick?: () => void
  to?: string
}

/**
 * BackButton Component
 * 
 * PURPOSE: Reusable back navigation button used across all pages
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Any page needing back navigation
 * - When returning to previous context is needed
 * 
 * PROPS:
 * - className: Additional CSS classes
 * - onClick: Custom click handler
 * - to: Specific route to navigate back to
 * 
 * USAGE:
 * <BackButton to="/knowledge" />
 * <BackButton onClick={handleBack} />
 */
export const BackButton: React.FC<BackButtonProps> = ({
  className = '',
  onClick,
  to
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button 
      className={`icon-button ${className}`}
      onClick={handleClick}
      aria-label="Quay lại"
    >
      <ArrowLeft size={20} />
    </button>
  )
}
