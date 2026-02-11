import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  runTransaction,
  addDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { 
  Article,
  ArticleWithAnalytics,
  ArticleAnalytics,
  ArticlePerformance,
  ContentList,
  ContentQueryOptions,
  PerformanceQueryOptions,
  DraftQueryOptions,
  DeleteConfirmation,
  BulkDeleteConfirmation,
  DeleteImpact,
  ContentType,
  ContentStatus,
  AdminContentService,
  AdminContentError,
  AdminContentErrorCode
} from '../types/adminContent'

/**
 * Admin Content Service
 * 
 * Provides comprehensive content management for administrators with:
 * - Complete visibility into all content (published + saved)
 * - Performance analytics integration
 * - Safe deletion with safeguards and audit logging
 * - Search and filtering capabilities
 */
class AdminContentServiceClass {
  private readonly collections = {
    news: 'news' as const,
    knowledge: 'knowledge' as const,
    traditions: 'traditions' as const,
    regulations: 'regulations' as const,
    analytics: 'analytics_articles' as const,
    auditLogs: 'audit_logs' as const
  }

  /**
   * Get all articles with analytics
   */
  async getAllArticles(options: ContentQueryOptions = {}): Promise<ContentList> {
    try {
      const collections = options.type 
        ? [this.collections[options.type] as string]
        : [this.collections.news, this.collections.knowledge, this.collections.traditions, this.collections.regulations]

      const allArticles: ArticleWithAnalytics[] = []
      let totalCount = 0

      for (const collectionName of collections) {
        const constraints: any[] = []

        // Add status filter
        if (options.status) {
          constraints.push(where('status', '==', options.status))
        }

        // Add author filter
        if (options.author) {
          constraints.push(where('author.uid', '==', options.author))
        }

        // Add date range filter
        if (options.dateRange) {
          constraints.push(where('createdAt', '>=', options.dateRange.start))
          constraints.push(where('createdAt', '<=', options.dateRange.end))
        }

        // Add ordering
        const sortField = options.sortBy || 'createdAt'
        const sortDirection = options.sortOrder || 'desc'
        constraints.push(orderBy(sortField, sortDirection))

        // Add pagination
        if (options.limit) {
          constraints.push(limit(options.limit))
        }
        if (options.offset) {
          constraints.push(startAfter(options.offset))
        }

        const q = query(collection(db, collectionName as string), ...constraints)
        const snapshot = await getDocs(q)

        const articles = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const article = { id: doc.id, ...doc.data() } as Article
            const analytics = await this.getArticleAnalytics(article.id)
            const performance = await this.getArticlePerformance(article.id)
            
            return {
              ...article,
              analytics,
              performance
            }
          })
        )

        allArticles.push(...articles)
        totalCount += snapshot.docs.length
      }

      // Apply search filter if provided
      let filteredArticles = allArticles
      if (options.search) {
        const searchLower = options.search.toLowerCase()
        filteredArticles = allArticles.filter(article =>
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower) ||
          article.author.displayName.toLowerCase().includes(searchLower)
        )
      }

      // Apply tag filter if provided
      if (options.tags && options.tags.length > 0) {
        filteredArticles = filteredArticles.filter(article =>
          options.tags!.some(tag => article.tags.includes(tag))
        )
      }

      return {
        articles: filteredArticles,
        totalCount,
        hasMore: options.limit ? totalCount > options.limit : false,
        cursor: options.offset?.toString(),
        filters: {
          applied: options,
          available: await this.getAvailableFilters()
        }
      }
    } catch (error) {
      throw new AdminContentError(
        'Failed to fetch articles',
        AdminContentErrorCode.SEARCH_ERROR,
        { originalError: error }
      )
    }
  }

  /**
   * Get article by ID with analytics
   */
  async getArticleById(id: string): Promise<ArticleWithAnalytics> {
    try {
      // Find which collection contains this article
      const collectionNames = [this.collections.news, this.collections.knowledge, this.collections.traditions, this.collections.regulations]
      
      for (const collectionName of collectionNames) {
        const docRef = doc(db, collectionName as string, id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const article = { id, ...docSnap.data() } as Article
          const analytics = await this.getArticleAnalytics(id)
          const performance = await this.getArticlePerformance(id)
          
          return {
            ...article,
            analytics,
            performance
          }
        }
      }

      throw new AdminContentError(
        'Article not found',
        AdminContentErrorCode.ARTICLE_NOT_FOUND,
        { articleId: id }
      )
    } catch (error) {
      if (error instanceof AdminContentError) {
        throw error
      }
      throw new AdminContentError(
        'Failed to fetch article',
        AdminContentErrorCode.ARTICLE_NOT_FOUND,
        { originalError: error, articleId: id }
      )
    }
  }

  /**
   * Get top performing articles
   */
  async getTopPerformingArticles(options: PerformanceQueryOptions): Promise<ContentList> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get analytics data for performance metrics
      const analyticsQuery = query(
        collection(db, this.collections.analytics),
        where('timestamp', '>=', startDate),
        orderBy('pageViews', 'desc'),
        limit(options.limit || 20)
      )
      const analyticsSnapshot = await getDocs(analyticsQuery)

      const topArticleIds = analyticsSnapshot.docs.map(doc => doc.id)

      // Get full article data
      const articles = await Promise.all(
        topArticleIds.map(async (id) => {
          const article = await this.getArticleById(id)
          return article
        })
      )

      // Filter by type if specified
      let filteredArticles = articles
      if (options.type) {
        filteredArticles = articles.filter(article => article.type === options.type)
      }

      // Include drafts if requested
      if (!options.includeDrafts) {
        filteredArticles = filteredArticles.filter(article => article.status === 'published')
      }

      return {
        articles: filteredArticles,
        totalCount: filteredArticles.length,
        hasMore: false,
        filters: {
          applied: options,
          available: await this.getAvailableFilters()
        }
      }
    } catch (error) {
      throw new AdminContentError(
        'Failed to fetch top performing articles',
        AdminContentErrorCode.ANALYTICS_UNAVAILABLE,
        { originalError: error }
      )
    }
  }

  /**
   * Get saved drafts
   */
  async getSavedDrafts(options: DraftQueryOptions = {}): Promise<ContentList> {
    try {
      const draftOptions: ContentQueryOptions = {
        ...options,
        status: 'saved'
      }

      if (options.authorOnly && options.author) {
        draftOptions.author = options.author
      }

      // Filter for older drafts if specified
      if (options.includeOlderThan) {
        const cutoffDate = Timestamp.fromDate(new Date(Date.now() - options.includeOlderThan * 24 * 60 * 60 * 1000))
        draftOptions.dateRange = {
          start: Timestamp.fromDate(new Date(0)),
          end: cutoffDate
        }
      }

      return await this.getAllArticles(draftOptions)
    } catch (error) {
      throw new AdminContentError(
        'Failed to fetch saved drafts',
        AdminContentErrorCode.SEARCH_ERROR,
        { originalError: error }
      )
    }
  }

  /**
   * Delete article with safeguards and audit logging
   */
  async deleteArticle(id: string, confirmation: DeleteConfirmation): Promise<void> {
    try {
      // Validate confirmation
      this.validateDeleteConfirmation(confirmation)

      // Assess impact before deletion
      const impact = await this.assessDeleteImpact(id)

      // Find which collection contains this article
      const collections = [this.collections.news, this.collections.knowledge, this.collections.traditions, this.collections.regulations]
      let articleRef: any = null
      let articleType: ContentType | null = null

      for (const collectionName of collections) {
        const ref = doc(db, collectionName, id)
        const docSnap = await getDoc(ref)
        
        if (docSnap.exists()) {
          articleRef = ref
          // Determine content type based on collection name
          if (collectionName === this.collections.news) {
            articleType = 'news' as ContentType
          } else if (collectionName === this.collections.knowledge) {
            articleType = 'knowledge' as ContentType
          } else if (collectionName === this.collections.traditions) {
            articleType = 'traditions' as ContentType
          } else if (collectionName === this.collections.regulations) {
            articleType = 'regulations' as ContentType
          }
          break
        }
      }

      if (!articleRef || !articleType) {
        throw new AdminContentError(
          'Article not found',
          AdminContentErrorCode.ARTICLE_NOT_FOUND,
          { articleId: id }
        )
      }

      // Execute deletion in a transaction
      await runTransaction(db, async (transaction) => {
        // Delete the article
        transaction.delete(articleRef)

        // Mark analytics as deleted
        const analyticsRef = doc(db, this.collections.analytics, id)
        transaction.set(analyticsRef, {
          deleted: true,
          deletedAt: serverTimestamp(),
          deletedBy: confirmation.articleId,
          reason: confirmation.reason
        }, { merge: true })

        // Log the deletion
        await this.logDeleteAction(id, articleType, confirmation, impact)
      })

      // Invalidate caches and indexes (would be handled by cloud functions)
      await this.invalidateContentCaches(id)
    } catch (error) {
      if (error instanceof AdminContentError) {
        throw error
      }
      throw new AdminContentError(
        'Failed to delete article',
        AdminContentErrorCode.DELETE_CONFIRMATION_REQUIRED,
        { originalError: error, articleId: id }
      )
    }
  }

  /**
   * Bulk delete articles with enhanced safeguards
   */
  async bulkDeleteArticles(ids: string[], confirmation: BulkDeleteConfirmation): Promise<void> {
    try {
      // Validate bulk delete confirmation
      this.validateBulkDeleteConfirmation(confirmation)

      // Check bulk delete limits
      if (ids.length > 10) {
        throw new AdminContentError(
          'Bulk delete limit exceeded',
          AdminContentErrorCode.BULK_DELETE_LIMIT_EXCEEDED,
          { requestedCount: ids.length, maxAllowed: 10 }
        )
      }

      // Assess bulk impact
      const impact = await this.assessBulkDeleteImpact(ids)

      // Execute bulk deletion
      const batch = writeBatch(db)
      const deletedArticles: Array<{ id: string; type: ContentType }> = []

      for (const id of ids) {
        // Find article location
        const collections = [this.collections.news, this.collections.knowledge, this.collections.traditions, this.collections.regulations]
        
        for (const collectionName of collections) {
          const ref = doc(db, collectionName, id)
          const docSnap = await getDoc(ref)
          
          if (docSnap.exists()) {
            batch.delete(ref)
            // Find the content type by matching the collection name
            const contentType = Object.entries(this.collections).find(([_, value]) => value === collectionName)?.[0] as ContentType
            deletedArticles.push({ id, type: contentType })
            
            // Mark analytics as deleted
            const analyticsRef = doc(db, this.collections.analytics, id)
            batch.set(analyticsRef, {
              deleted: true,
              deletedAt: serverTimestamp(),
              bulkDeleted: true,
              bulkDeleteId: confirmation.timestamp
            }, { merge: true })
            
            break
          }
        }
      }

      // Commit the batch
      await batch.commit()

      // Log bulk deletion
      await this.logBulkDeleteAction(deletedArticles, confirmation, impact)

      // Invalidate caches
      await Promise.all(ids.map(id => this.invalidateContentCaches(id)))
    } catch (error) {
      if (error instanceof AdminContentError) {
        throw error
      }
      throw new AdminContentError(
        'Failed to bulk delete articles',
        AdminContentErrorCode.BULK_DELETE_LIMIT_EXCEEDED,
        { originalError: error, requestedIds: ids }
      )
    }
  }

  /**
   * Get article analytics
   */
  async getArticleAnalytics(id: string): Promise<ArticleAnalytics> {
    try {
      const analyticsRef = doc(db, this.collections.analytics, id)
      const analyticsSnap = await getDoc(analyticsRef)

      if (!analyticsSnap.exists()) {
        return this.getDefaultAnalytics()
      }

      const data = analyticsSnap.data()
      
      return {
        pageViews: data.pageViews || 0,
        uniqueViews: data.uniqueViews || 0,
        avgTimeOnPage: data.avgTimeOnPage || 0,
        bounceRate: data.bounceRate || 0,
        exitRate: data.exitRate || 0,
        shares: data.shares || 0,
        comments: data.comments || 0,
        likes: data.likes || 0,
        engagementScore: data.engagementScore || 0,
        conversionRate: data.conversionRate,
        lastViewed: data.lastViewed || Timestamp.now()
      }
    } catch (error) {
      console.error('Failed to fetch article analytics:', error)
      return this.getDefaultAnalytics()
    }
  }

  /**
   * Get article performance metrics
   */
  async getArticlePerformance(id: string): Promise<ArticlePerformance> {
    try {
      // This would calculate performance metrics from historical data
      // For now, return default performance data
      return this.getDefaultPerformance()
    } catch (error) {
      console.error('Failed to fetch article performance:', error)
      return this.getDefaultPerformance()
    }
  }

  /**
   * Assess delete impact
   */
  async assessDeleteImpact(articleId: string): Promise<DeleteImpact> {
    try {
      const article = await this.getArticleById(articleId)
      
      return {
        analyticsLoss: `${article.analytics.pageViews} page views and ${article.analytics.engagementScore} engagement score will be lost`,
        commentsLost: article.analytics.comments,
        sharesLost: article.analytics.shares,
        seoImpact: `URL /${article.type}/${article.slug} will return 404`,
        authorImpact: {
          publishedCount: 1, // Would calculate from author's total
          performanceScore: article.analytics.engagementScore
        },
        systemImpact: {
          searchIndex: true,
          cacheInvalidation: true,
          cdnPurge: true
        }
      }
    } catch (error) {
      throw new AdminContentError(
        'Failed to assess delete impact',
        AdminContentErrorCode.ANALYTICS_UNAVAILABLE,
        { originalError: error, articleId }
      )
    }
  }

  /**
   * Assess bulk delete impact
   */
  async assessBulkDeleteImpact(articleIds: string[]): Promise<DeleteImpact> {
    try {
      const articles = await Promise.all(
        articleIds.map(id => this.getArticleById(id))
      )

      const totalImpact = articles.reduce((acc, article) => ({
        analyticsLoss: acc.analyticsLoss + article.analytics.pageViews,
        commentsLost: acc.commentsLost + article.analytics.comments,
        sharesLost: acc.sharesLost + article.analytics.shares,
        authorImpact: {
          publishedCount: acc.authorImpact.publishedCount + 1,
          performanceScore: acc.authorImpact.performanceScore + article.analytics.engagementScore
        }
      }), {
        analyticsLoss: 0,
        commentsLost: 0,
        sharesLost: 0,
        authorImpact: { publishedCount: 0, performanceScore: 0 }
      })

      return {
        analyticsLoss: `${totalImpact.analyticsLoss} page views will be lost`,
        commentsLost: totalImpact.commentsLost,
        sharesLost: totalImpact.sharesLost,
        seoImpact: `${articleIds.length} URLs will return 404`,
        authorImpact: totalImpact.authorImpact,
        systemImpact: {
          searchIndex: true,
          cacheInvalidation: true,
          cdnPurge: true
        }
      }
    } catch (error) {
      throw new AdminContentError(
        'Failed to assess bulk delete impact',
        AdminContentErrorCode.ANALYTICS_UNAVAILABLE,
        { originalError: error, articleIds }
      )
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getAvailableFilters() {
    // This would fetch available filter options from the database
    return {
      types: ['news', 'knowledge', 'traditions', 'regulations'] as ContentType[],
      statuses: ['published', 'saved', 'draft', 'under_review'] as ContentStatus[],
      authors: [] as Array<{ uid: string; displayName: string }>, // Would fetch from users collection
      categories: [] as string[], // Would fetch from articles
      tags: [] as string[] // Would fetch from articles
    }
  }

  private validateDeleteConfirmation(confirmation: DeleteConfirmation): void {
    if (!confirmation.confirmed) {
      throw new AdminContentError(
        'Delete confirmation required',
        AdminContentErrorCode.DELETE_CONFIRMATION_REQUIRED
      )
    }

    if (!confirmation.articleId || !confirmation.articleTitle) {
      throw new AdminContentError(
        'Invalid delete confirmation',
        AdminContentErrorCode.VALIDATION_ERROR
      )
    }
  }

  private validateBulkDeleteConfirmation(confirmation: BulkDeleteConfirmation): void {
    if (!confirmation.confirmed) {
      throw new AdminContentError(
        'Bulk delete confirmation required',
        AdminContentErrorCode.DELETE_CONFIRMATION_REQUIRED
      )
    }

    if (!confirmation.reason) {
      throw new AdminContentError(
        'Bulk delete requires reason',
        AdminContentErrorCode.DELETE_CONFIRMATION_REQUIRED
      )
    }
  }

  private async logDeleteAction(
    articleId: string, 
    articleType: ContentType, 
    confirmation: DeleteConfirmation, 
    impact: DeleteImpact
  ): Promise<void> {
    try {
      const auditLog = {
        action: 'delete',
        resourceType: 'article',
        resourceId: articleId,
        userId: confirmation.articleId,
        userEmail: confirmation.articleTitle, // Would use actual email
        details: {
          articleTitle: confirmation.articleTitle,
          articleType,
          authorName: confirmation.authorName,
          reason: confirmation.reason,
          impact: impact
        },
        timestamp: serverTimestamp()
      }

      await addDoc(collection(db, this.collections.auditLogs), auditLog)
    } catch (error) {
      console.error('Failed to log delete action:', error)
      // Don't throw error - deletion should still succeed
    }
  }

  private async logBulkDeleteAction(
    deletedArticles: Array<{ id: string; type: ContentType }>,
    confirmation: BulkDeleteConfirmation,
    impact: DeleteImpact
  ): Promise<void> {
    try {
      const auditLog = {
        action: 'bulk_delete',
        resourceType: 'article',
        resourceIds: deletedArticles.map(a => a.id),
        userId: confirmation.articles[0]?.articleId || 'unknown',
        userEmail: confirmation.articles[0]?.articleTitle || 'unknown',
        details: {
          articlesCount: deletedArticles.length,
          reason: confirmation.reason,
          impact: impact
        },
        timestamp: serverTimestamp()
      }

      await addDoc(collection(db, this.collections.auditLogs), auditLog)
    } catch (error) {
      console.error('Failed to log bulk delete action:', error)
      // Don't throw error - deletion should still succeed
    }
  }

  private async invalidateContentCaches(articleId: string): Promise<void> {
    // This would trigger cache invalidation via cloud functions
    // For now, just log the action
    console.log(`Invalidating caches for article: ${articleId}`)
  }

  private getTimeRangeMs(timeRange: string): number {
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    }
    return ranges[timeRange as keyof typeof ranges] || ranges['30d']
  }

  private getDefaultAnalytics(): ArticleAnalytics {
    return {
      pageViews: 0,
      uniqueViews: 0,
      avgTimeOnPage: 0,
      bounceRate: 0,
      exitRate: 0,
      shares: 0,
      comments: 0,
      likes: 0,
      engagementScore: 0,
      lastViewed: Timestamp.now()
    }
  }

  private getDefaultPerformance(): ArticlePerformance {
    return {
      growthRate: {
        pageViews: 0,
        uniqueViews: 0,
        engagement: 0
      },
      ranking: {
        overall: 0,
        byType: 0,
        byCategory: 0
      },
      trends: {
        daily: [],
        weekly: []
      }
    }
  }
}

// Export singleton instance
export const adminContentService = new AdminContentServiceClass()
