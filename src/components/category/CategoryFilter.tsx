// CategoryFilter Component
// Category selector component for Knowledge page
// NO data fetching logic
// NO pagination logic
// PAGINATED CATEGORY FILTERING

import React from 'react'
import { useCategoryFilter } from '../../hooks/useCategoryFilter'
import { ButtonGroup, type ButtonOption } from '../ui'

export interface Category {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

export interface CategoryFilterProps {
  categories: Category[]
  className?: string
}

/**
 * Category filter component
 * Handles category selection UI
 * Delegates category state to useCategoryFilter hook
 * PAGINATED CATEGORY FILTERING - integrates with pagination backbone
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  className = ""
}) => {
  const { selectedCategory, toggleCategory, isActive } = useCategoryFilter()

  // Convert categories to ButtonGroup options
  const buttonOptions: ButtonOption[] = categories.map(category => ({
    id: category.id,
    label: category.name,
    icon: category.icon
  }))

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    toggleCategory(categoryId)
  }

  return (
    <div className={`category-filter ${isActive ? 'category-active' : ''} ${className}`}>
      <ButtonGroup
        options={buttonOptions}
        selectedValue={selectedCategory || ''}
        onSelect={handleCategorySelect}
        orientation="horizontal"
        variant="military"
        allowMultiple={false}
      />
    </div>
  )
}

export default CategoryFilter
