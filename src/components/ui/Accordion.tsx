import React, { useState } from 'react'
import { AccordionItem, type AccordionItemProps } from './AccordionItem'

export interface AccordionProps {
  items: Omit<AccordionItemProps, 'isExpanded' | 'onToggle'>[]
  allowMultiple?: boolean
  defaultExpanded?: string[]
  onItemToggle?: (id: string, isExpanded: boolean) => void
  className?: string
}

/**
 * Accordion Component
 * 
 * WHEN TO USE:
 * - Create groups of collapsible sections
 * - Build FAQ pages
 * - Organize content into expandable groups
 * - Create nested navigation structures
 * 
 * PROPS:
 * - items: Array of accordion items
 * - allowMultiple: Allow multiple items to be expanded
 * - defaultExpanded: Array of item IDs to expand by default
 * - onItemToggle: Callback when item is toggled
 * - className: Additional CSS classes
 * 
 * USAGE:
 * <Accordion 
 *   items={[
 *     { id: 'section1', title: 'Section 1', children: <div>Content 1</div> },
 *     { id: 'section2', title: 'Section 2', children: <div>Content 2</div> }
 *   ]}
 *   allowMultiple={false}
 * />
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  onItemToggle,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  )

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedItems)
    
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      if (allowMultiple) {
        newExpanded.add(id)
      } else {
        // Single accordion mode - close others
        newExpanded.clear()
        newExpanded.add(id)
      }
    }
    
    setExpandedItems(newExpanded)
    onItemToggle?.(id, newExpanded.has(id))
  }

  return (
    <div className={`accordion ${className}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          {...item}
          isExpanded={expandedItems.has(item.id)}
          onToggle={handleToggle}
        />
      ))}
    </div>
  )
}
