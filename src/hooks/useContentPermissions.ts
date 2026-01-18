import { useAuth } from '../contexts/AuthContext'
import type { NewsDocument, KnowledgeDocument, TraditionDocument, NewsArticle, KnowledgeArticle } from '../types/firestore'

type ContentDocument = NewsDocument | KnowledgeDocument | TraditionDocument | NewsArticle | KnowledgeArticle

export interface ContentPermissions {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  isOwner: boolean
}

/**
 * Hook to check content permissions based on user role and document ownership
 * 
 * Permission Rules:
 * - Editor: canCreate=true, canUpdate=true (own docs only), canDelete=false
 * - Admin: canCreate=false, canUpdate=false, canDelete=true (any doc)
 * - Unauthenticated: no permissions
 */
export const useContentPermission = (document?: ContentDocument): ContentPermissions => {
  const { user, hasRole } = useAuth()

  // Check if user owns the document
  const isOwner = document ? checkDocumentOwnership(document, user?.uid) : false

  // Permission logic based on role
  const canCreate = hasRole('editor') && !hasRole('admin')
  const canUpdate = (hasRole('editor') && !hasRole('admin') && (isOwner || !document)) || hasRole('admin')
  const canDelete = hasRole('admin')

  return {
    canCreate,
    canUpdate,
    canDelete,
    isOwner
  }
}

/**
 * Helper function to determine document ownership across different document types
 */
const checkDocumentOwnership = (document: ContentDocument, userId?: string): boolean => {
  if (!userId || !document) return false

  // Check BaseDocument createdBy field (common to all documents)
  if (document.createdBy) {
    return document.createdBy === userId
  }

  // Type guards for specific document types
  const isNewsDocument = (doc: ContentDocument): doc is NewsDocument | NewsArticle => {
    return 'author' in doc && 'excerpt' in doc && ('category' in doc && typeof doc.category === 'string' && 
      ['announcement', 'event', 'update', 'general'].includes(doc.category))
  }

  const isKnowledgeDocument = (doc: ContentDocument): doc is KnowledgeDocument | KnowledgeArticle => {
    return 'author' in doc && 'summary' in doc && ('category' in doc && typeof doc.category === 'string' && 
      ['quan-su', 'chinh-tri', 'hau-can', 'ky-thuat'].includes(doc.category))
  }

  const isTraditionDocument = (doc: ContentDocument): doc is TraditionDocument => {
    return 'contributor' in doc && 'origin' in doc
  }

  // Check NewsDocument author.uid field
  if (isNewsDocument(document) && document.author?.uid) {
    return document.author.uid === userId
  }

  // Check KnowledgeDocument author.uid field
  if (isKnowledgeDocument(document) && document.author?.uid) {
    return document.author.uid === userId
  }

  // Check TraditionDocument contributor.uid field
  if (isTraditionDocument(document) && document.contributor?.uid) {
    return document.contributor.uid === userId
  }

  return false
}

// Legacy export for backward compatibility
export const useContentPermissions = useContentPermission
