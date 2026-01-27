import React, { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { TimelineList } from './TimelineList'
import type { LeaderProfile } from './MinistryLeadersList'

export interface LeaderProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  leader: LeaderProfile | null
}

/**
 * LeaderProfileDialog Component
 * 
 * PURPOSE: Displays detailed biographical information for military leaders in a reusable, layout-only component
 * 
 * WHEN TO USE:
 * - Show comprehensive leader profiles
 * - Display career progression and achievements
 * - Present military honors and decorations
 * - Any scenario requiring leader profile display
 * 
 * PROPS:
 * - isOpen: Controls dialog visibility
 * - onClose: Close handler (parent-controlled)
 * - leader: LeaderProfile object with complete biographical data
 * 
 * ARCHITECTURE:
 * - ZERO BUSINESS LOGIC - Pure presentation component
 * - Fully reusable across different contexts
 * - Accepts LeaderProfile as props only
 * - Handles layout and presentation exclusively
 * - No internal state management for business logic
 * 
 * INTERNAL STRUCTURE:
 * A) Header Section - Leader name and rank with official styling
 * B) Upper Section - 2-column layout (Personal Info + Portrait + Current Titles)
 * C) Lower Section - Career Timeline using TimelineList component
 * 
 * USAGE:
 * <LeaderProfileDialog 
 *   isOpen={isDialogOpen}
 *   onClose={() => setIsDialogOpen(false)}
 *   leader={selectedLeader}
 * />
 */
export const LeaderProfileDialog: React.FC<LeaderProfileDialogProps> = ({
  isOpen,
  onClose,
  leader
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Performance: Memoize timeline conversion to prevent unnecessary recalculations
  const careerTimeline = React.useMemo(() => {
    if (!leader?.careerTimeline) return []
    return leader.careerTimeline.map(milestone => ({
      year: milestone.year,
      title: milestone.title,
      description: milestone.description
    }))
  }, [leader?.careerTimeline])

  // Performance: Memoize backward compatibility data
  const legacyData = React.useMemo(() => {
    if (!leader) return null
    return {
      imageAlt: (leader as any).imageAlt || leader.name,
      rank: (leader as any).rank || '',
      birthYear: (leader as any).birthYear || leader.personalInfo?.birthDate || '',
      birthPlace: (leader as any).birthPlace || leader.personalInfo?.hometown || '',
      education: (leader as any).education || [],
      achievements: (leader as any).achievements || [],
      decorations: (leader as any).decorations || []
    }
  }, [leader])

  // Accessibility: Focus trap implementation
  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (!dialogRef.current) return

    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }
  }, [])

  // Accessibility: Handle ESC key and focus management
  useEffect(() => {
    if (!isOpen) return

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Lock background scroll when dialog is open
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    // Add event listeners
    document.addEventListener('keydown', handleEscapeKey)
    document.addEventListener('keydown', trapFocus)

    // Focus management: Set focus to close button when dialog opens
    setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.removeEventListener('keydown', trapFocus)
      // Restore original scroll behavior
      document.body.style.overflow = originalStyle
    }
  }, [isOpen, onClose, trapFocus])

  // Accessibility: Handle backdrop click to close dialog
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  // Performance: Early return to prevent unnecessary rendering
  if (!isOpen || !leader) return null

  return (
    <div 
      className="leader-profile-dialog-overlay"
      onClick={handleBackdropClick}
    >
      <div 
        ref={dialogRef}
        className="leader-profile-dossier"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-content"
      >
        {/* A) HEADER SECTION — Identity & Authority */}
        <div className="dossier-header">
          <div className="header-title-section">
            <h2 
              id="dialog-title"
              className="dossier-title"
            >
              {legacyData?.rank && <span>{legacyData.rank} </span>}{leader.name}
            </h2>
            {leader.currentTitles && leader.currentTitles.length > 0 && (
              <div className="dossier-subtitle">
                {leader.currentTitles[leader.currentTitles.length-1]}
              </div>
            )}
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="dossier-close-button"
            aria-label="Đóng hộp thoại"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="dossier-content">
          {/* B) UPPER SECTION — Profile Overview (Two-Column Logic) */}
          <div 
            id="dialog-content"
            className="dossier-upper-section"
          >
          {/* LEFT COLUMN — Biographical & Political Profile */}
          <div className="dossier-info-section">
            {leader.personalInfo && (
              <>
                {/* Core Personal Identity Block */}
                <div className="info-block">
                  <h4>
                    THÔNG TIN CÁ NHÂN
                  </h4>
                  <div className="info-grid">
                    <div><strong>Họ và tên:</strong> {leader.personalInfo.fullName}</div>
                    <div><strong>Ngày sinh:</strong> {leader.personalInfo.birthDate}</div>
                    <div><strong>Ngày vào Đảng:</strong> {leader.personalInfo.partyJoinDate}</div>
                    <div><strong>Quê quán:</strong> {leader.personalInfo.hometown}</div>
                    <div><strong>Lý luận chính trị:</strong> {leader.personalInfo.politicalTheoryLevel}</div>
                    <div><strong>Chuyên môn:</strong> {leader.personalInfo.professionalLevel}</div>
                  </div>
                </div>

                {/* Institutional & Political Positions Block */}
                {leader.personalInfo.positions && leader.personalInfo.positions.length > 0 && (
                  <div className="info-block">
                    <h4>
                      CHỨC VỤ
                    </h4>
                    <ul className="info-list">
                      {leader.personalInfo.positions.map((position, index) => (
                        <li key={index}>{position}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Legacy birth info for backward compatibility */}
            {legacyData?.birthYear && legacyData?.birthPlace && !leader.personalInfo && (
              <div className="info-block">
                <h4>
                  THÔNG TIN CƠ BẢN
                </h4>
                <div>
                  <strong>Năm sinh:</strong> {legacyData.birthYear} | <strong>Quê quán:</strong> {legacyData.birthPlace}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Portrait & Current Authority Representation */}
          <div className="dossier-portrait-section">
            {/* Portrait - Official Identity Panel */}
            <div className="portrait-frame">
              <img 
                src={leader.image}
                alt={legacyData?.imageAlt || `${leader.name}`}
                className="portrait-image"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <div className="portrait-fallback">
                {leader.name.split(' ').map(word => word[0]).join('').toUpperCase()}
              </div>
            </div>
            
            {/* Current Authority Block */}
            <div className="current-authority-block">
              {leader.currentTitles && leader.currentTitles.length > 0 && (
                <div className="rank-display">
                  {leader.currentTitles[leader.currentTitles.length - 1]}
                </div>
              )}
              {leader.currentTitles && leader.currentTitles.length > 0 && (
                <div className="current-titles-list">
                  {leader.currentTitles.map((currentTitle, index) => (
                    <div key={index} className="current-title">
                      {currentTitle}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* C) LOWER SECTION — Career & Historical Record */}
        <div className="dossier-lower-section">
          {/* Career Timeline - Dominant Element */}
          {careerTimeline.length > 0 && (
            <div className="career-section">
              <h4 className="timeline-title">
                QUÁ TRÌNH CÔNG TÁC
              </h4>
              <TimelineList items={careerTimeline} />
            </div>
          )}


          {/* {legacyData?.decorations && legacyData.decorations.length > 0 && (
            <div className="decorations-section">
              <h4 className="section-title">
                HUÂN CHƯƠNG & PHẦN THƯỞNG
              </h4>
              <ul className="section-list">
                {legacyData.decorations.map((decoration: any, index: any) => (
                  <li key={index}>{decoration}</li>
                ))}
              </ul>
            </div>
          )} */}
        </div>
        </div>
      </div>
    </div>
  )
}
