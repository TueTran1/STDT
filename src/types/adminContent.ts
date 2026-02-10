/**
 * Admin Content Types
 * 
 * Types for admin content management, performance tracking, and deletion
 */

// ============================================================================
// CONTENT TYPES
// ============================================================================

export type ContentType = 'news' | 'knowledge' | 'traditions' | 'regulations'
export type ContentStatus = 'published' | 'saved' | 'draft' | 'under_review' | 'archived'

// ============================================================================
// ARTICLE TYPES
// ============================================================================

export interface Article {
  id: string
  title: string
  slug: string
  type: ContentType
  status: ContentStatus
  content: string
  excerpt: string
  author: {
    uid: string
    displayName: string
    email: string
  }
  createdAt: import('firebase/firestore').Timestamp
  updatedAt: import('firebase/firestore').Timestamp
  publishedAt?: import('firebase/firestore').Timestamp
  category?: string
  tags: string[]
  featuredImage?: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

export interface ArticleWithAnalytics extends Article {
  analytics: ArticleAnalytics
  performance: ArticlePerformance
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface ArticleAnalytics {
  pageViews: number
  uniqueViews: number
  avgTimeOnPage: number
  bounceRate: number
  exitRate: number
  shares: number
  comments: number
  likes: number
  engagementScore: number
  conversionRate?: number
  lastViewed: import('firebase/firestore').Timestamp
}

export interface ArticlePerformance {
  growthRate: {
    pageViews: number
    uniqueViews: number
    engagement: number
  }
  ranking: {
    overall: number
    byType: number
    byCategory: number
  }
  trends: {
    daily: Array<{
      date: string
      pageViews: number
      uniqueViews: number
    }>
    weekly: Array<{
      week: string
      pageViews: number
      uniqueViews: number
    }>
  }
}

// ============================================================================
// DELETE CONFIRMATION TYPES
// ============================================================================

export interface DeleteConfirmation {
  articleId: string
  articleTitle: string
  articleType: ContentType
  authorName: string
  publishedAt: import('firebase/firestore').Timestamp
  pageViews: number
  comments: number
  shares: number
  reason?: string
  confirmed: boolean
  timestamp: import('firebase/firestore').Timestamp
}

export interface BulkDeleteConfirmation {
  articles: DeleteConfirmation[]
  totalImpact: {
    articles: number
    pageViews: number
    comments: number
    shares: number
  }
  reason: string
  confirmed: boolean
  timestamp: import('firebase/firestore').Timestamp
}

export interface DeleteImpact {
  analyticsLoss: string
  commentsLost: number
  sharesLost: number
  seoImpact: string
  authorImpact: {
    publishedCount: number
    performanceScore: number
  }
  systemImpact: {
    searchIndex: boolean
    cacheInvalidation: boolean
    cdnPurge: boolean
  }
}

// ============================================================================
// QUERY OPTIONS
// ============================================================================

export interface ContentQueryOptions {
  type?: ContentType
  status?: ContentStatus
  author?: string
  category?: string
  tags?: string[]
  dateRange?: {
    start: import('firebase/firestore').Timestamp
    end: import('firebase/firestore').Timestamp
  }
  search?: string
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'pageViews' | 'engagement'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface PerformanceQueryOptions extends ContentQueryOptions {
  metric: 'pageViews' | 'engagement' | 'growth' | 'shares'
  timeRange: '7d' | '30d' | '90d' | '1y'
  includeDrafts?: boolean
}

export interface DraftQueryOptions extends ContentQueryOptions {
  authorOnly?: boolean
  includeOlderThan?: number // days
}

// ============================================================================
// CONTENT LIST TYPES
// ============================================================================

export interface ContentList {
  articles: ArticleWithAnalytics[]
  totalCount: number
  hasMore: boolean
  cursor?: string
  filters: {
    applied: ContentQueryOptions
    available: {
      types: ContentType[]
      statuses: ContentStatus[]
      authors: Array<{ uid: string; displayName: string }>
      categories: string[]
      tags: string[]
    }
  }
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface ContentTableColumn {
  key: string
  title: string
  type: 'text' | 'number' | 'date' | 'status' | 'author' | 'analytics' | 'actions'
  sortable: boolean
  filterable: boolean
  width?: string
  render: (value: any, article: ArticleWithAnalytics) => React.ReactNode
}

export interface ContentTableRow {
  article: ArticleWithAnalytics
  selected: boolean
  loading?: boolean
}

export interface ContentTableState {
  articles: ContentTableRow[]
  selectedArticles: string[]
  loading: boolean
  error: string | null
  filters: ContentQueryOptions
  sort: {
    field: string
    direction: 'asc' | 'desc'
  }
  pagination: {
    page: number
    pageSize: number
    totalCount: number
  }
}

// ============================================================================
// MODAL TYPES
// ============================================================================

export interface DeleteModalState {
  isOpen: boolean
  mode: 'single' | 'bulk'
  article?: ArticleWithAnalytics
  articles?: ArticleWithAnalytics[]
  confirmation?: DeleteConfirmation
  bulkConfirmation?: BulkDeleteConfirmation
  impact?: DeleteImpact
  step: 'warning' | 'impact' | 'confirmation' | 'processing' | 'complete'
  loading: boolean
  error: string | null
}

export interface DeleteModalConfig {
  requireReason: boolean
  requireTyping: boolean
  cooldownSeconds: number
  showImpact: boolean
  allowBulk: boolean
  maxBulkDelete: number
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface AdminContentService {
  // Viewing Operations
  getAllArticles(options?: ContentQueryOptions): Promise<ContentList>
  getArticleById(id: string): Promise<ArticleWithAnalytics>
  getTopPerformingArticles(options: PerformanceQueryOptions): Promise<ContentList>
  getSavedDrafts(options?: DraftQueryOptions): Promise<ContentList>
  
  // Delete Operations (with safeguards)
  deleteArticle(id: string, confirmation: DeleteConfirmation): Promise<void>
  bulkDeleteArticles(ids: string[], confirmation: BulkDeleteConfirmation): Promise<void>
  
  // Analytics Integration
  getArticleAnalytics(id: string): Promise<ArticleAnalytics>
  getContentPerformanceMetrics(options: PerformanceQueryOptions): Promise<ArticlePerformance>
  
  // Impact Assessment
  assessDeleteImpact(articleId: string): Promise<DeleteImpact>
  assessBulkDeleteImpact(articleIds: string[]): Promise<DeleteImpact>
  
  // Search and Filter
  searchArticles(query: string, options?: ContentQueryOptions): Promise<ContentList>
  filterArticles(filters: ContentQueryOptions): Promise<ContentList>
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseAdminContentResult {
  // Data
  articles: ArticleWithAnalytics[]
  topPerforming: ArticleWithAnalytics[]
  drafts: ArticleWithAnalytics[]
  
  // State
  loading: boolean
  error: string | null
  
  // Actions
  refresh: () => Promise<void>
  search: (query: string) => Promise<void>
  filter: (filters: ContentQueryOptions) => Promise<void>
  sort: (field: string, direction: 'asc' | 'desc') => Promise<void>
  
  // Delete Operations
  deleteArticle: (id: string) => Promise<void>
  bulkDeleteArticles: (ids: string[]) => Promise<void>
  
  // Analytics
  getAnalytics: (id: string) => Promise<ArticleAnalytics>
  getPerformanceMetrics: (options: PerformanceQueryOptions) => Promise<ArticlePerformance>
}

export interface UseDeleteModalResult {
  state: DeleteModalState
  openSingleDelete: (article: ArticleWithAnalytics) => void
  openBulkDelete: (articles: ArticleWithAnalytics[]) => void
  close: () => void
  confirmDelete: (confirmation: DeleteConfirmation) => Promise<void>
  confirmBulkDelete: (confirmation: BulkDeleteConfirmation) => Promise<void>
  assessImpact: (articleId: string) => Promise<DeleteImpact>
  assessBulkImpact: (articleIds: string[]) => Promise<DeleteImpact>
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface DeleteValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  safeguards: {
    requiresReason: boolean
    requiresTyping: boolean
    hasCooldown: boolean
    bulkLimitExceeded: boolean
  }
}

export interface ContentValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface ContentAuditLog {
  id: string
  action: 'view' | 'delete' | 'bulk_delete' | 'export'
  resourceType: 'article' | 'content'
  resourceId?: string
  resourceIds?: string[]
  userId: string
  userEmail: string
  details: {
    articleTitle?: string
    articleType?: ContentType
    authorName?: string
    reason?: string
    impact?: DeleteImpact
  }
  timestamp: import('firebase/firestore').Timestamp
  ipAddress?: string
  userAgent?: string
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AdminContentConfig {
  deleteModal: DeleteModalConfig
  table: {
    defaultPageSize: number
    maxPageSize: number
    autoRefresh: boolean
    refreshInterval: number
  }
  analytics: {
    retentionDays: number
    realTimeUpdates: boolean
  }
  search: {
    minQueryLength: number
    maxResults: number
  }
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AdminContentError extends Error {
  public code: string
  public details?: Record<string, any>

  constructor(
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AdminContentError'
    this.code = code
    this.details = details
  }
}

export const AdminContentErrorCode = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ARTICLE_NOT_FOUND: 'ARTICLE_NOT_FOUND',
  DELETE_CONFIRMATION_REQUIRED: 'DELETE_CONFIRMATION_REQUIRED',
  BULK_DELETE_LIMIT_EXCEEDED: 'BULK_DELETE_LIMIT_EXCEEDED',
  COOLDOWN_PERIOD_ACTIVE: 'COOLDOWN_PERIOD_ACTIVE',
  ANALYTICS_UNAVAILABLE: 'ANALYTICS_UNAVAILABLE',
  SEARCH_ERROR: 'SEARCH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const

export type AdminContentErrorCode = typeof AdminContentErrorCode[keyof typeof AdminContentErrorCode]
