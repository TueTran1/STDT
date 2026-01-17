import React, { useState } from 'react'

export interface AccordionItemProps {
  id: string
  title: string
  children: React.ReactNode
  isExpanded?: boolean
  onToggle?: (id: string) => void
  className?: string
  icon?: string
}

/**
 * AccordionItem Component
 * 
 * WHEN TO USE:
 * - Create collapsible content sections
 * - Build FAQ sections
 * - Show/hide detailed information
 * - Organize content into expandable sections
 * 
 * PROPS:
 * - id: Unique identifier for the item
 * - title: Title displayed in the header
 * - children: Content to show when expanded
 * - isExpanded: Controlled expansion state
 * - onToggle: Toggle handler
 * - className: Additional CSS classes
 * - icon: Optional icon to display
 * 
 * USAGE:
 * <AccordionItem 
 *   id="section1"
 *   title="Section Title"
 *   isExpanded={expanded}
 *   onToggle={handleToggle}
 * >
 *   <div>Content here...</div>
 * </AccordionItem>
 */
export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  children,
  isExpanded = false,
  onToggle,
  className = '',
  icon
}) => {
  const [internalExpanded, setInternalExpanded] = useState(isExpanded)
  
  const expanded = onToggle ? isExpanded : internalExpanded
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle(id)
    } else {
      setInternalExpanded(!expanded)
    }
  }

  return (
    <div className={`accordion-section ${className}`}>
      <button
        className="accordion-header"
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-controls={`accordion-content-${id}`}
      >
        <span className="accordion-title">
          {icon && <span className="accordion-icon-left">{icon}</span>}
          {title}
        </span>
        <span className="accordion-icon">
          {expanded ? '−' : '+'}
        </span>
      </button>
      {expanded && (
        <div 
          className="accordion-content"
          id={`accordion-content-${id}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
