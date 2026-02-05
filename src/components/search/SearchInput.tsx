// SearchInput Component
// Pure search input component
// NO data fetching logic
// NO pagination logic
// PAGINATED SEARCH INTEGRATION

import React, { useState, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useSearchQuery } from '../../hooks/useSearchQuery'

export interface SearchInputProps {
  placeholder?: string
  className?: string
  debounceMs?: number
}

/**
 * Pure search input component
 * Handles user input and search execution
 * Deblegates search state to useSearchQuery hook
 * PAGINATED SEARCH - integrates with pagination backbone
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Tìm kiếm...",
  className = "",
  debounceMs = 300
}) => {
  const { query, setQuery, clearSearch, executeSearch, isTyping, isActive } = useSearchQuery({ debounceMs })
  const [inputValue, setInputValue] = useState(query)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input with search query
  React.useEffect(() => {
    setInputValue(query)
  }, [query])

  // Handle input change (typing only)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setQuery(value)
  }

  // Handle search icon click (execute search immediately)
  const handleSearchClick = () => {
    executeSearch(inputValue)
    inputRef.current?.focus()
  }

  // Handle clear button click
  const handleClearClick = () => {
    setInputValue('')
    clearSearch()
    inputRef.current?.focus()
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    } else if (e.key === 'Escape') {
      handleClearClick()
    }
  }

  return (
    <div className={`search-input ${isActive ? 'search-active' : ''} ${className}`}>
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input-field"
          aria-label="Tìm kiếm"
          autoComplete="off"
        />
        
        {/* Clear button - only show when there's text */}
        {inputValue && (
          <button
            onClick={handleClearClick}
            className="search-clear-button"
            aria-label="Xóa tìm kiếm"
            type="button"
          >
            <X size={16} />
          </button>
        )}
        
        {/* Search button - always visible, primary action */}
        <button
          onClick={handleSearchClick}
          className="search-search-button"
          aria-label="Thực hiện tìm kiếm"
          type="button"
          disabled={isTyping}
        >
          <Search size={16} />
        </button>
      </div>
      
      {/* Search status indicator */}
      {isActive && (
        <div className="search-status">
          <span className="search-status-text">
            Đang tìm kiếm: "{query}"
          </span>
        </div>
      )}
    </div>
  )
}

export default SearchInput
