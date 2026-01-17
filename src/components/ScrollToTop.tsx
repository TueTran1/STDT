import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component that resets scroll position when route changes
 * 
 * This component provides centralized scroll restoration for the entire SPA.
 * It automatically scrolls to the top whenever the user navigates to a new route,
 * ensuring proper reading flow for document-style and regulation pages.
 * 
 * Features:
 * - Works globally for all routes
 * - Triggers only on route changes (not modal interactions)
 * - Preserves browser back/forward navigation behavior
 * - No manual scroll resets needed in individual pages
 */
export function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' to avoid animation delay
    })
  }, [location.pathname])

  // This component doesn't render anything
  return null
}
