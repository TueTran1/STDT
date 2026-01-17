import { useAuth } from '../contexts/AuthContext'
import type { NewsDocument, KnowledgeDocument } from '../types/firestore'
import type { User } from '../types/user'

type ContentDocument = NewsDocument | KnowledgeDocument

export interface ContentPermissions {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canUpdateThis: (document: ContentDocument) => boolean
  canDeleteThis: (document: ContentDocument) => boolean
}

export const useContentPermissions = (): ContentPermissions => {
  const { hasRole, user } = useAuth()

  const canCreate = hasRole('editor')
  const canUpdate = hasRole('editor')
  const canDelete = hasRole('admin')

  const canUpdateThis = (_document: ContentDocument): boolean => {
    // Editors can only update their own content
    if (!hasRole('editor')) return false
    return (user as User)?.id ? true : false // Simplified for now
  }

  const canDeleteThis = (_document: ContentDocument): boolean => {
    // Admins can delete any content
    return hasRole('admin')
  }

  return {
    canCreate,
    canUpdate,
    canDelete,
    canUpdateThis,
    canDeleteThis
  }
}

// Helper function for checking permissions without hook (for server-side logic)
export const checkContentPermissions = (
  userRole: 'admin' | 'editor' | null,
  userUid: string | null,
  document?: ContentDocument
): ContentPermissions => {
  const canCreate = userRole === 'editor'
  const canUpdate = userRole === 'editor'
  const canDelete = userRole === 'admin'

  const canUpdateThis = (_doc: ContentDocument): boolean => {
    if (userRole !== 'editor' || !userUid) return false
    return true // Simplified for now
  }

  const canDeleteThis = (_doc: ContentDocument): boolean => {
    return userRole === 'admin'
  }

  return {
    canCreate,
    canUpdate,
    canDelete,
    canUpdateThis: (document: ContentDocument) => canUpdateThis(document),
    canDeleteThis: (document: ContentDocument) => canDeleteThis(document)
  }
}
