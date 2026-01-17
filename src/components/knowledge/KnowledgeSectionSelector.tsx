import React from 'react'
import { ButtonGroup, type ButtonOption } from '../ui'

export interface KnowledgeSection {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

export interface KnowledgeSectionSelectorProps {
  sections: KnowledgeSection[]
  selectedSection: string | null
  onSectionSelect: (sectionId: string) => void
}

/**
 * KnowledgeSectionSelector Component
 * 
 * PURPOSE: Reusable section selector for knowledge filtering
 * 
 * WHEN TO USE:
 * - Knowledge page section filtering
 * - Any multi-section selection interface
 * - Filter controls with toggle behavior
 * 
 * PROPS:
 * - sections: Array of section objects
 * - selectedSections: Array of currently selected section IDs
 * - onToggleSection: Callback for section toggle
 * 
 * USAGE:
 * <KnowledgeSectionSelector 
 *   sections={sections}
 *   selectedSections={selectedSections}
 *   onToggleSection={handleToggle}
 * />
 */
export const KnowledgeSectionSelector: React.FC<KnowledgeSectionSelectorProps> = ({
  sections,
  selectedSection,
  onSectionSelect
}) => {
  // Convert sections to ButtonGroup options
  const buttonOptions: ButtonOption[] = sections.map(section => ({
    id: section.id,
    label: section.name,
    icon: section.icon
  }))

  // Handle section selection
  const handleSelectionChange = (sectionId: string) => {
    onSectionSelect(sectionId)
  }

  return (
    <ButtonGroup
      options={buttonOptions}
      selectedValue={selectedSection || ''}
      onSelect={handleSelectionChange}
      orientation="horizontal"
      variant="military"
      className="knowledge-section-selector"
      allowMultiple={false}
    />
  )
}
