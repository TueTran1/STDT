/**
 * Text highlighting utility for search results
 * Provides safe HTML highlighting without mutating original content
 */

export interface HighlightOptions {
  className?: string
  caseSensitive?: boolean
}

/**
 * Highlights search terms in text by wrapping matches in <mark> tags
 * 
 * @param text - Original text to highlight
 * @param searchTerm - Search term to highlight
 * @param options - Highlighting options
 * @returns HTML string with highlighted matches
 */
export const highlightText = (
  text: string,
  searchTerm: string,
  options: HighlightOptions = {}
): string => {
  if (!text || !searchTerm?.trim()) {
    return escapeHtml(text)
  }

  const { className = 'search-highlight', caseSensitive = false } = options
  
  // Escape HTML first to prevent XSS
  const escapedText = escapeHtml(text)
  const escapedSearchTerm = escapeHtml(searchTerm.trim())
  
  if (!escapedSearchTerm) {
    return escapedText
  }

  // Create regex for highlighting
  const flags = caseSensitive ? 'g' : 'gi'
  const pattern = new RegExp(`(${escapeRegex(escapedSearchTerm)})`, flags)
  
  // Replace matches with highlighted version
  return escapedText.replace(pattern, `<mark class="${className}">$1</mark>`)
}

/**
 * Safely escapes HTML characters to prevent XSS
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Escapes special regex characters
 */
const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Checks if text contains the search term (case-insensitive)
 */
export const containsSearchTerm = (text: string, searchTerm: string): boolean => {
  if (!text || !searchTerm?.trim()) {
    return false
  }
  
  const normalizedText = text.toLowerCase()
  const normalizedSearch = searchTerm.toLowerCase().trim()
  
  return normalizedText.includes(normalizedSearch)
}

/**
 * Extracts a preview snippet around the first match
 */
export const getSearchSnippet = (
  text: string,
  searchTerm: string,
  maxLength: number = 150
): string => {
  if (!text || !searchTerm?.trim()) {
    return text.substring(0, maxLength)
  }

  const searchLower = searchTerm.toLowerCase().trim()
  const textLower = text.toLowerCase()
  
  // Find first match
  const matchIndex = textLower.indexOf(searchLower)
  
  if (matchIndex === -1) {
    return text.substring(0, maxLength)
  }

  // Calculate snippet boundaries
  const start = Math.max(0, matchIndex - 30)
  const end = Math.min(text.length, matchIndex + searchTerm.length + 120)
  
  let snippet = text.substring(start, end)
  
  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'
  
  return snippet
}
