import { useState, useEffect, useCallback } from 'react'

/**
 * UNSAVED CHANGES PROTECTION HOOK
 * 
 * Protects users from losing work due to accidental navigation
 * Provides consistent UX across the application
 */
export const useUnsavedChangesProtection = (
  hasUnsavedChanges: boolean,
  onBeforeUnload?: (unsavedChanges: boolean) => void
) => {
  const [showWarning, setShowWarning] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời đi?'
        
        // Call custom handler if provided
        onBeforeUnload?.(true)
      } else {
        onBeforeUnload?.(false)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, onBeforeUnload])

  // Handle navigation attempts
  const handleNavigationAttempt = useCallback((to: string) => {
    if (hasUnsavedChanges) {
      setShowWarning(true)
      setPendingNavigation(to)
      return false // Block navigation
    }
    return true // Allow navigation
  }, [hasUnsavedChanges])

  // Confirm navigation with unsaved changes
  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      setShowWarning(false)
      window.location.href = pendingNavigation
    }
  }, [pendingNavigation])

  // Cancel navigation
  const cancelNavigation = useCallback(() => {
    setShowWarning(false)
    setPendingNavigation(null)
  }, [])

  return {
    showWarning,
    pendingNavigation,
    handleNavigationAttempt,
    confirmNavigation,
    cancelNavigation
  }
}
