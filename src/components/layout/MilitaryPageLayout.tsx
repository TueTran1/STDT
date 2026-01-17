import React from 'react'
import { HomeButton } from '../ui'
import logoBrigade from '../../assets/logo-brigade.png'

export interface MilitaryPageLayoutProps {
  title: React.ReactNode   // Page title (required)
  subtitle?: string               // Optional subtitle
  showTopIcons?: boolean          // Default: true
  showHeaderEmblem?: boolean      // Default: true
  customTopIcons?: React.ReactNode // Custom top icons content
  disableTopIcons?: boolean      // Disable top icons (for modal overlays)
  className?: string              // Additional classes for main container
  children: React.ReactNode        // Page-specific content
}

/**
 * MilitaryPageLayout Component
 * 
 * PURPOSE: Reusable layout shell for all military application pages
 * 
 * RESPONSIBILITIES:
 * - Renders shared UI elements (background, top icons, emblem, container)
 * - Provides consistent military styling and structure
 * - Handles page title and subtitle formatting
 * - Encapsulates layout concerns from page content
 * 
 * USAGE:
 * <MilitaryPageLayout 
 *   title="KIẾN THỨC QUÂN SỰ"
 *   subtitle="Nâng cao trình độ chuyên môn"
 * >
 *   <PageSpecificContent />
 * </MilitaryPageLayout>
 */
export const MilitaryPageLayout: React.FC<MilitaryPageLayoutProps> = ({
  title,
  subtitle,
  showTopIcons = true,
  showHeaderEmblem = true,
  customTopIcons,
  disableTopIcons = false,
  className = '',
  children
}) => {
  return (
    <div className={`traditions-page ${className}`}>
      {/* Background Pattern */}
      <div className="bronze-drum-pattern"></div>
      
      {/* Top Icons Bar */}
      {!disableTopIcons && (customTopIcons ? (
        <div className="top-icons">
          {customTopIcons}
        </div>
      ) : showTopIcons && (
        <div className="top-icons">
          <div></div>
          <HomeButton variant="icon" />
        </div>
      ))}

      {/* Main Container */}
      <div className="main-container">
        {/* Header Emblem */}
        {showHeaderEmblem && (
          <div className="header-emblem">
            <img 
              src={logoBrigade} 
              alt="Lữ Đoàn 83" 
              width="120" 
              height="120" 
            />
          </div>
        )}

        {/* Page Title */}
        <div className="page-title">
          {title}
          {subtitle && <p>{subtitle}</p>}
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
