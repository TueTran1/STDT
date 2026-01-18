import React from 'react'
import { useAuthDebug } from '../../utils/debugAuth'

interface AuthDebugPanelProps {
  document?: any
  operation: string
}

/**
 * Temporary debug panel to show authentication state
 * Remove this component in production
 */
export const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({ document, operation }) => {
  const debugInfo = useAuthDebug(document)

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'black',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔍 Auth Debug - {operation}</h4>
      <div><strong>Authenticated:</strong> {debugInfo.isAuthenticated ? '✅' : '❌'}</div>
      <div><strong>UID:</strong> {debugInfo.userUid || 'null'}</div>
      <div><strong>Email:</strong> {debugInfo.userEmail || 'null'}</div>
      <div><strong>Role:</strong> {debugInfo.userRole || 'null'}</div>
      <div><strong>Active:</strong> {debugInfo.isActive ? '✅' : '❌'}</div>
      <div><strong>Can Create:</strong> {debugInfo.canCreate ? '✅' : '❌'}</div>
      <div><strong>Can Update:</strong> {debugInfo.canUpdate ? '✅' : '❌'}</div>
      <div><strong>Can Delete:</strong> {debugInfo.canDelete ? '✅' : '❌'}</div>
      <div><strong>Is Owner:</strong> {debugInfo.isOwner ? '✅' : '❌'}</div>
      <div style={{fontSize: '10px', marginTop: '5px', opacity: 0.7}}>
        {debugInfo.timestamp}
      </div>
    </div>
  )
}
