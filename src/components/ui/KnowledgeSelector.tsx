import React from 'react'

export interface KnowledgeSection {
  id: string
  name: string
  description: string
  icon?: string
}

export interface KnowledgeSelectorProps {
  sections: KnowledgeSection[]
  selectedSections: Set<string>
  onToggleSection: (sectionId: string) => void
  className?: string
}

/**
 * KnowledgeSelector Component
 * 
 * WHEN TO USE:
 * - Allow users to filter knowledge articles by category
 * - Create multi-select section filters
 * - Display knowledge categories with descriptions
 * 
 * PROPS:
 * - sections: Array of available sections
 * - selectedSections: Set of currently selected section IDs
 * - onToggleSection: Handler for toggling section selection
 * - className: Additional CSS classes
 * 
 * USAGE:
 * <KnowledgeSelector 
 *   sections={SECTIONS}
 *   selectedSections={selectedSections}
 *   onToggleSection={handleToggle}
 * />
 */
export const KnowledgeSelector: React.FC<KnowledgeSelectorProps> = ({
  sections,
  selectedSections,
  onToggleSection,
  className = ''
}) => {
  return (
    <div className={`knowledge-selector ${className}`}>
      <div className="section-grid">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onToggleSection(section.id)}
            className={`section-button ${selectedSections.has(section.id) ? 'active' : 'inactive'}`}
          >
            {section.icon && (
              <div className="section-icon">
                {section.icon}
              </div>
            )}
            <div className="section-content">
              <div className="section-name">{section.name}</div>
              <div className="section-description">{section.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
