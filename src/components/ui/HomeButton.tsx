import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'

export interface HomeButtonProps {
  className?: string
  onClick?: () => void
  variant?: 'icon' | 'text' | 'full'
}

/**
 * HomeButton Component
 * 
 * PURPOSE: Reusable home navigation button used across all pages
 * 
 * WHEN TO USE:
 * - Top navigation bars
 * - Error pages
 * - Any page needing home navigation
 * 
 * PROPS:
 * - className: Additional CSS classes
 * - onClick: Custom click handler (defaults to navigate('/'))
 * - variant: Button style ('icon', 'text', or 'full')
 * 
 * USAGE:
 * <HomeButton variant="icon" />
 * <HomeButton variant="text" />
 * <HomeButton variant="full" />
 */
export const HomeButton: React.FC<HomeButtonProps> = ({
  className = '',
  onClick,
  variant = 'icon'
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate('/')
    }
  }

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <button 
            className={`icon-button ${className}`}
            onClick={handleClick}
            aria-label="Trang chủ"
          >
            <Home size={20} />
          </button>
        )
      
      case 'text':
        return (
          <button 
            className={`px-4 py-2 bg-yellow-500 text-red-900 rounded font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2 ${className}`}
            onClick={handleClick}
          >
            <Home size={16} />
            TRANG CHỦ
          </button>
        )
      
      case 'full':
        return (
          <button 
            className={`military-button ${className}`}
            onClick={handleClick}
            style={{ 
              maxWidth: '400px', 
              margin: '30px auto',
              fontSize: '18px',
              padding: '24px'
            }}
          >
            <div className="icon-large">
              <Home size={32} />
            </div>
            <div>TRỞ VỀ TRANG CHỦ</div>
          </button>
        )
      
      default:
        return null
    }
  }

  return renderButton()
}
