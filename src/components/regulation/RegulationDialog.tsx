import React from 'react'
import { X } from 'lucide-react'

export interface RegulationDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  tags?: string[]
}

/**
 * RegulationDialog Component
 * 
 * PURPOSE: Modal dialog for displaying regulation content, not an article page
 * 
 * WHEN TO USE:
 * - Regulations page for viewing detailed regulation content
 * - Any modal content that needs official document styling
 * 
 * PROPS:
 * - isOpen: Whether dialog is open
 * - onClose: Close handler
 * - title: Regulation title
 * - content: Full regulation content
 * - tags: Optional regulation tags
 * 
 * USAGE:
 * <RegulationDialog
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="10 LỜI THỀ DANH DỰ"
 *   content="Full regulation text..."
 *   tags={['lời thề', 'danh dự']}
 * />
 */
export const RegulationDialog: React.FC<RegulationDialogProps> = ({
  isOpen,
  onClose,
  title,
  content,
  tags
}) => {
  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Lock background scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="regulation-dialog-overlay"
      onClick={handleBackdropClick}
    >
      <div className="regulation-dialog">
        {/* Header Band - Ceremonial */}
        <div className="regulation-dialog-header-band">
          {/* <div className="header-band-left">
            <Home size={20} className="header-icon" />
          </div> */}
          
          <div className="header-band-center">
            <h1 className="regulation-dialog-title">
              {title}
            </h1>
          </div>
          
          <div className="header-band-right">
            <button
              onClick={onClose}
              className="ceremonial-close-button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area - Parchment Style */}
        <div className="regulation-dialog-content">
          {/* Main Content */}
          <div className="oath-content">
            {(() => {
              const lines = content.split('\n').map(l => l.trim())
              const blocks: React.ReactNode[] = []

              let currentOathNumber: string | null = null
              let currentOathLines: string[] = []

              const flushOath = (key: number) => {
                if (!currentOathNumber) return null

                blocks.push(
                  <div key={key} className="oath-item-block">
                    <div className="oath-text-with-dropcap">
                      <span className="dropcap-number">
                        {currentOathNumber}.
                      </span>
                      <div className="oath-content-text">
                        {currentOathLines.map((line, i) => {
                          // Check if this line contains "Xin thề" (with or without quotes)
                          const isXinThe = line.trim().match(/^"?Xin thề"?$/i)
                          
                          if (isXinThe) {
                            return (
                              <div key={i} className="oath-line xin-the-affirmation">
                                Xin thề
                              </div>
                            )
                          }
                          
                          return (
                            <div key={i} className="oath-line">
                              {line}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }

              let keyCounter = 0

              lines.forEach((line) => {
                if (!line) return

                const oathMatch = line.match(/^(\d+)\.\s*(.*)/)

                if (oathMatch) {
                  flushOath(keyCounter++)
                  currentOathNumber = oathMatch[1]
                  currentOathLines = [oathMatch[2]]
                } else if (currentOathNumber) {
                  currentOathLines.push(line)
                } else {
                  blocks.push(
                    <p key={keyCounter++} className="regulation-paragraph">
                      {line}
                    </p>
                  )
                }
              })

              flushOath(keyCounter++)

              return blocks
            })()}
          </div>


          {/* Tags - Ceremonial */}
          {tags && tags.length > 0 && (
            <div className="regulation-tags">
              <div className="ceremonial-divider"></div>
              <div className="tag-list">
                {tags.map((tag, index) => (
                  <span key={index} className="ceremonial-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
