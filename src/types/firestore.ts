// Base timestamp interface for all documents
export interface BaseDocument {
  id: string
  createdAt: Date
  updatedAt: Date
  createdBy: string // uid of user who created
  updatedBy: string // uid of user who last updated
}

// User roles
export type UserRole =  'admin' | 'editor' 

// Shared base interface for articles (News and Knowledge)
export interface BaseArticle {
  id?: string
  title: string
  slug: string
  content: string
  excerpt?: string
  tags: string[]
  featured: boolean
  status: 'saved' | 'published' // Extended for backward compatibility
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  author: {
    uid: string
    displayName: string
    photoURL?: string
  }
}

// Extended News Article interface (backward compatible with NewsDocument)
export interface NewsArticle extends BaseArticle {
  // News-specific fields
  category: 'announcement' | 'event' | 'update' | 'general'
  publishedAt?: Date
  coverImage?: string // Storage URL
  readingTime: number // Estimated minutes
  viewCount: number
  metadata: {
    seoTitle?: string
    seoDescription?: string
    keywords?: string[]
  }
  
  // Legacy compatibility fields
  excerpt: string // Required for NewsDocument compatibility
}

// Extended Knowledge Article interface (backward compatible with KnowledgeDocument)
export interface KnowledgeArticle extends BaseArticle {
  // Knowledge-specific fields
  category: 'quan-su' | 'chinh-tri' | 'hau-can' | 'ky-thuat'
  summary: string // Required for knowledge articles
  estimatedTime: number // Minutes to read/complete
  engagement: {
    views: number
    likes: number
    shares: number
    bookmarks: number
  }
  
  // Additional knowledge fields for full compatibility
  type: 'article' | 'tutorial' | 'guide' | 'fact' | 'story'
  subcategory: string
  media: {
    images: string[]
    videos: string[]
    documents?: string[] // PDFs or other files
  }
  prerequisites: string[] // IDs of related knowledge documents
  relatedKnowledge: string[] // IDs of related knowledge documents
  review: {
    isReviewed: boolean
    reviewedBy?: string // uid of expert who reviewed
    reviewedAt?: Date
    rating?: number // 1-5 stars
    feedback?: string
  }
} 

// Users Collection
export interface UserDocument extends BaseDocument {
  uid: string // Firebase Auth UID
  email?: string
  phoneNumber?: string
  displayName?: string
  photoURL?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  profile: {
    bio?: string
    location?: string
    website?: string
    socialLinks?: {
      twitter?: string
      instagram?: string
      facebook?: string
    }
  }
  preferences: {
    emailNotifications: boolean
    pushNotifications: boolean
    language: string
    timezone: string
  }
}

// News Collection
export interface NewsDocument extends BaseDocument {
  title: string
  slug: string // URL-friendly identifier
  excerpt: string // Brief description
  content: string // Full content (HTML or markdown)
  category: 'announcement' | 'event' | 'update' | 'general'
  status: 'saved' | 'published'
  featured: boolean
  publishedAt?: Date
  author: {
    uid: string
    displayName: string
    photoURL?: string
  }
  tags: string[]
  coverImage?: string // Storage URL
  readingTime: number // Estimated minutes
  viewCount: number
  metadata: {
    seoTitle?: string
    seoDescription?: string
    keywords?: string[]
  }
}

// Traditions Collection
export interface TraditionDocument extends BaseDocument {
  title: string
  slug: string
  description: string // Brief overview
  content: string // Detailed explanation
  category: 'ceremony' | 'festival' | 'custom' | 'ritual' | 'belief'
  origin: {
    region: string
    province?: string
    city?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  timePeriod: {
    season?: string
    month?: string
    specificDates?: string[]
    isRecurring: boolean
  }
  media: {
    images: string[] // Storage URLs
    videos: string[] // Storage URLs
    audio?: string // Storage URL for traditional music/narration
  }
  significance: string // Cultural importance
  relatedTraditions: string[] // IDs of related traditions
  status: 'saved' | 'published'
  featured: boolean
  tags: string[]
  contributor: {
    uid: string
    displayName: string
  }
  verification: {
    isVerified: boolean
    verifiedBy?: string // uid of admin who verified
    verifiedAt?: Date
    sources?: string[] // Reference sources
  }
}

// Knowledge Collection
export interface KnowledgeDocument extends BaseDocument {
  title: string
  slug: string
  type: 'article' | 'tutorial' | 'guide' | 'fact' | 'story'
  content: string
  summary: string // Brief overview
  category: string // Main category (e.g., "history", "culture", "arts")
  subcategory: string // Specific subcategory
  tags: string[]
  media: {
    images: string[]
    videos: string[]
    documents?: string[] // PDFs or other files
  }
  estimatedTime: number // Minutes to read/complete
  prerequisites: string[] // IDs of related knowledge documents
  relatedKnowledge: string[] // IDs of related knowledge documents
  status: 'saved' | 'published'
  featured: boolean
  author: {
    uid: string
    displayName: string
    photoURL?: string
  }
  review: {
    isReviewed: boolean
    reviewedBy?: string // uid of expert who reviewed
    reviewedAt?: Date
    rating?: number // 1-5 stars
    feedback?: string
  }
  engagement: {
    views: number
    likes: number
    shares: number
    bookmarks: number
  }
}

// Notifications Collection
export interface NotificationDocument extends BaseDocument {
  recipientUid: string // User who receives notification
  type: 'system' | 'news' | 'tradition' | 'knowledge' | 'user' | 'reminder'
  title: string
  message: string
  data?: {
    // Additional data based on type
    entityId?: string // ID of related document
    entityType?: 'news' | 'tradition' | 'knowledge' | 'user'
    actionUrl?: string // Deep link
    imageUrl?: string
    metadata?: Record<string, any>
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channels: {
    inApp: boolean
    email: boolean
    push: boolean
  }
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  scheduledAt?: Date // For scheduled notifications
  sentAt?: Date
  readAt?: Date
  expiresAt?: Date // Auto-delete after this date
}

// Subcollections
export interface CommentSubcollection {
  id: string
  uid: string
  content: string
  createdAt: Date
  updatedAt: Date
  parentId?: string // For nested comments
  status: 'active' | 'hidden' | 'deleted'
  likes: number
}

export interface LikeSubcollection {
  id: string
  uid: string
  createdAt: Date
  type: 'like' | 'dislike' | 'love'
}

export interface BookmarkSubcollection {
  id: string
  uid: string
  createdAt: Date
  folder?: string // Custom folder name
}

// Query helper types
export interface QueryOptions {
  limit?: number
  orderBy?: {
    field: string
    direction: 'asc' | 'desc'
  }
  where?: {
    field: string
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'array-contains-any'
    value: any
  }[]
}

// Firestore paths
export const FIRESTORE_PATHS = {
  USERS: 'users',
  NEWS: 'news',
  TRADITIONS: 'traditions',
  KNOWLEDGE: 'knowledge',
  NOTIFICATIONS: 'notifications',
  USER_NOTIFICATIONS: (uid: string) => `users/${uid}/notifications`,
  COMMENTS: (collection: string, docId: string) => `${collection}/${docId}/comments`,
  LIKES: (collection: string, docId: string) => `${collection}/${docId}/likes`,
  BOOKMARKS: (uid: string) => `users/${uid}/bookmarks`
} as const
