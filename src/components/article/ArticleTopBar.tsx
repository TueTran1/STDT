import React from 'react'
import { useNavigate } from 'react-router-dom'

export interface ArticleTopBarProps {
  onBack?: () => void
  onHome?: () => void
}

/**
 * ArticleTopBar Component
 * 
 * PURPOSE: Top navigation bar for article pages
 * 
 * WHEN TO USE:
 * - Article detail pages
 * - Any page needing back/home navigation
 * 
 * PROPS:
 * - onBack: Callback for back button (defaults to navigate(-1))
 * - onHome: Callback for home button (defaults to navigate('/'))
 * 
 * USAGE:
 * <ArticleTopBar />
 * <ArticleTopBar onBack={customBack} onHome={customHome} />
 */
export const ArticleTopBar: React.FC<ArticleTopBarProps> = ({
  onBack,
  onHome
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const handleHome = () => {
    if (onHome) {
      onHome()
    } else {
      navigate('/')
    }
  }

  return (
    <div className="sticky top-0 bg-gradient-to-r from-red-800 to-red-900 border-b-4 border-yellow-500 p-4 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <button 
          onClick={handleBack} 
          className="px-4 py-2 bg-yellow-500 text-red-900 rounded font-bold hover:bg-yellow-400 transition-colors"
        >
          ← TRỞ VỀ
        </button>
        <button 
          onClick={handleHome} 
          className="px-4 py-2 bg-yellow-500 text-red-900 rounded font-bold hover:bg-yellow-400 transition-colors"
        >
          🏠 TRANG CHỦ
        </button>
      </div>
    </div>
  )
}
