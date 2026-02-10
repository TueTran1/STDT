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
  getCountFromServer,
  writeBatch,
  runTransaction
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { 
  TrafficMetrics,
  TrafficGrowth,
  TrafficSources,
  TopPages,
  UserMetrics,
  UserDemographics,
  GeographicData,
  ContentPerformance,
  AnalyticsData,
  AnalyticsQueryOptions,
  TimeSeriesData,
  TimeRange,
  PageType,
  DeviceType,
  TrafficSource
} from '../types/analytics'
import { AdminServiceError } from './adminService'

/**
 * Traffic Service
 * 
 * Provides efficient analytics data access with server-side aggregation
 * and client-side caching for optimal performance
 */
class TrafficServiceClass {
  private readonly collections = {
    pageViews: 'analytics_page_views',
    users: 'analytics_users',
    trafficSources: 'analytics_traffic_sources',
    contentPerformance: 'analytics_content_performance',
    aggregated: 'analytics_aggregated'
  }

  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<AnalyticsData> {
    try {
      const cacheKey = `analytics_${options.timeRange}_${JSON.stringify(options)}`
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached.data
      }

      const [
        trafficMetrics,
        trafficGrowth,
        trafficSources,
        topPages,
        userMetrics,
        userDemographics,
        geographicData,
        contentPerformance
      ] = await Promise.all([
        this.getTrafficMetrics(options),
        this.getTrafficGrowth(options),
        this.getTrafficSources(options),
        this.getTopPages(options),
        this.getUserMetrics(options),
        this.getUserDemographics(options),
        this.getGeographicData(options),
        this.getContentPerformance(options)
      ])

      const analyticsData: AnalyticsData = {
        traffic: {
          metrics: trafficMetrics,
          growth: trafficGrowth,
          sources: trafficSources,
          topPages
        },
        users: {
          metrics: userMetrics,
          demographics: userDemographics,
          growth: {
            daily: await this.getDailyUserGrowthData(options),
            weekly: await this.getWeeklyUserGrowthData(options),
            monthly: await this.getMonthlyUserGrowthData(options)
          }
        },
        content: contentPerformance,
        geographic: geographicData,
        lastUpdated: serverTimestamp(),
        dataFreshness: {
          traffic: this.calculateDataFreshness('traffic'),
          users: this.calculateDataFreshness('users'),
          content: this.calculateDataFreshness('content'),
          geographic: this.calculateDataFreshness('geographic')
        }
      }

      this.setCache(cacheKey, analyticsData)
      return analyticsData
    } catch (error) {
      throw new AdminServiceError(
        'Failed to fetch analytics data',
        'ANALYTICS_FETCH_ERROR',
        { originalError: error }
      )
    }
  }

  /**
   * Get traffic metrics
   */
  async getTrafficMetrics(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<TrafficMetrics> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get aggregated traffic metrics
      const metricsDoc = await getDoc(doc(db, this.collections.aggregated, 'traffic_metrics'))
      
      if (!metricsDoc.exists()) {
        return this.getDefaultTrafficMetrics()
      }

      const data = metricsDoc.data()
      
      // Get real-time data for recent time ranges
      if (options.timeRange === '1h' || options.timeRange === '24h') {
        const realTimeMetrics = await this.getRealTimeTrafficMetrics(startDate)
        return this.mergeTrafficMetrics(data, realTimeMetrics)
      }

      return {
        totalPageViews: data.totalPageViews || 0,
        uniqueVisitors: data.uniqueVisitors || 0,
        totalSessions: data.totalSessions || 0,
        avgSessionDuration: data.avgSessionDuration || 0,
        bounceRate: data.bounceRate || 0,
        pageViewsPerSession: data.pageViewsPerSession || 0,
        timeRange: options.timeRange
      }
    } catch (error) {
      console.error('Failed to fetch traffic metrics:', error)
      return this.getDefaultTrafficMetrics()
    }
  }

  /**
   * Get traffic growth data
   */
  async getTrafficGrowth(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<TrafficGrowth> {
    try {
      const currentPeriod = await this.getTrafficMetrics(options)
      const previousPeriod = await this.getTrafficMetrics({
        ...options,
        timeRange: this.getPreviousTimeRange(options.timeRange)
      })

      return {
        currentPeriod,
        previousPeriod,
        growthRate: {
          pageViews: this.calculateGrowthRate(previousPeriod.totalPageViews, currentPeriod.totalPageViews),
          uniqueVisitors: this.calculateGrowthRate(previousPeriod.uniqueVisitors, currentPeriod.uniqueVisitors),
          sessions: this.calculateGrowthRate(previousPeriod.totalSessions, currentPeriod.totalSessions)
        }
      }
    } catch (error) {
      console.error('Failed to fetch traffic growth:', error)
      return this.getDefaultTrafficGrowth()
    }
  }

  /**
   * Get traffic sources data
   */
  async getTrafficSources(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<TrafficSources> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get traffic sources
      const sourcesQuery = query(
        collection(db, this.collections.trafficSources),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(1000)
      )
      const sourcesSnapshot = await getDocs(sourcesQuery)
      
      const sources = sourcesSnapshot.docs.map(doc => doc.data())

      // Aggregate by source
      const sourceCounts = sources.reduce((acc, source) => {
        const sourceKey = source.source as TrafficSource
        acc[sourceKey] = (acc[sourceKey] || 0) + 1
        return acc
      }, {} as Record<TrafficSource, number>)

      const totalSources = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0)

      const bySource = Object.entries(sourceCounts).reduce((acc, [source, count]) => ({
        ...acc,
        [source]: {
          count,
          percentage: (count / totalSources) * 100,
          trend: 'stable', // Would calculate from historical data
          growthRate: 0 // Would calculate from historical data
        }
      }), {} as Record<TrafficSource, any>)

      // Get top referrers
      const referrerCounts = sources
        .filter(source => source.referrer)
        .reduce((acc, source) => {
          const domain = new URL(source.referrer || '').hostname
          acc[domain] = (acc[domain] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      const totalReferrers = Object.values(referrerCounts).reduce((sum, count) => sum + count, 0)

      const topReferrers = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([domain, count]) => ({
          domain,
          count,
          percentage: (count / totalReferrers) * 100
        }))

      return {
        bySource,
        topReferrers,
        campaigns: [] // Would implement campaign tracking
      }
    } catch (error) {
      console.error('Failed to fetch traffic sources:', error)
      return this.getDefaultTrafficSources()
    }
  }

  /**
   * Get top pages data
   */
  async getTopPages(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<TopPages> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get content performance data
      const contentQuery = query(
        collection(db, this.collections.contentPerformance),
        where('timestamp', '>=', startDate),
        orderBy('pageViews', 'desc'),
        limit(options.limit || 20)
      )
      const contentSnapshot = await getDocs(contentQuery)
      
      const content = contentSnapshot.docs.map(doc => doc.data() as any)

      const byPageViews = content.map(item => ({
        url: item.url,
        title: item.title,
        pageType: item.contentType,
        pageViews: item.pageViews,
        uniqueViews: item.uniqueViews,
        avgTimeOnPage: item.avgTimeOnPage,
        bounceRate: item.bounceRate,
        growthRate: 0 // Would calculate from historical data
      }))

      const byEngagement = content
        .map(item => ({
          url: item.url,
          title: item.title,
          pageType: item.pageType,
          avgTimeOnPage: item.avgTimeOnPage,
          engagementScore: this.calculateEngagementScore(item),
          shares: item.shares || 0,
          comments: item.comments || 0
        }))
        .sort((a, b) => b.engagementScore - a.engagementScore)

      return {
        byPageViews,
        byEngagement
      }
    } catch (error) {
      console.error('Failed to fetch top pages:', error)
      return this.getDefaultTopPages()
    }
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<UserMetrics> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get user analytics
      const usersQuery = query(
        collection(db, this.collections.users),
        where('lastVisit', '>=', startDate),
        limit(1000)
      )
      const usersSnapshot = await getDocs(usersQuery)
      
      const users = usersSnapshot.docs.map(doc => doc.data() as any)

      const totalUsers = users.length
      const activeUsers = users.filter(user => 
        this.isUserActive(user.lastVisit, timeRangeMs)
      ).length
      const newUsers = users.filter(user => 
        user.returningVisitor === false
      ).length
      const returningUsers = totalUsers - newUsers

      const totalSessions = users.reduce((sum, user) => sum + user.totalSessions, 0)
      const totalTimeOnSite = users.reduce((sum, user) => sum + user.totalTimeOnSite, 0)
      const avgSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0
      const avgTimeOnSite = totalUsers > 0 ? totalTimeOnSite / totalUsers : 0
      const avgSessionDuration = users.reduce((sum, user) => sum + user.avgSessionDuration, 0) / users.length
      const bounceRate = users.reduce((sum, user) => sum + user.bounceRate, 0) / users.length
      const retentionRate = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0

      return {
        totalUsers,
        activeUsers,
        newUsers,
        returningUsers,
        userGrowthRate: 0, // Would calculate from historical data
        avgSessionsPerUser,
        avgTimeOnSite,
        retentionRate
      }
    } catch (error) {
      console.error('Failed to fetch user metrics:', error)
      return this.getDefaultUserMetrics()
    }
  }

  /**
   * Get user demographics
   */
  async getUserDemographics(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<UserDemographics> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get user analytics
      const usersQuery = query(
        collection(db, this.collections.users),
        where('lastVisit', '>=', startDate),
        limit(1000)
      )
      const usersSnapshot = await getDocs(usersQuery)
      
      const users = usersSnapshot.docs.map(doc => doc.data() as any)

      // Aggregate by device
      const deviceCounts = users.reduce((acc, user) => {
        const deviceType = user.device?.type || 'desktop'
        acc[deviceType] = (acc[deviceType] || 0) + 1
        return acc
      }, {} as Record<DeviceType, number>)

      const totalUsers = users.length
      const byDevice = Object.entries(deviceCounts).reduce((acc, [device, count]) => ({
        ...acc,
        [device]: {
          count,
          percentage: (count / totalUsers) * 100,
          trend: 'stable', // Would calculate from historical data
        }
      }), {} as Record<DeviceType, any>)

      // Aggregate by browser
      const browserCounts = users.reduce((acc, user) => {
        const browser = user.device?.browser || 'Unknown'
        const version = user.device?.version || 'Unknown'
        const key = `${browser} ${version}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byBrowser = Object.entries(browserCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([browserVersion, count]) => {
          const [browser, version] = browserVersion.split(' ')
          return {
            name: browser,
            version,
            count,
            percentage: (count / totalUsers) * 100
          }
        })

      // Aggregate by OS
      const osCounts = users.reduce((acc, user) => {
        const os = user.device?.os || 'Unknown'
        const version = user.device?.version || 'Unknown'
        const key = `${os} ${version}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byOS = Object.entries(osCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([osVersion, count]) => {
          const [os, version] = osVersion.split(' ')
          return {
            name: os,
            version,
            count,
            percentage: (count / totalUsers) * 100
          }
        })

      return {
        byDevice,
        byBrowser,
        byOS
      }
    } catch (error) {
      console.error('Failed to fetch user demographics:', error)
      return this.getDefaultUserDemographics()
    }
  }

  /**
   * Get geographic data
   */
  async getGeographicData(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<GeographicData> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get page views with geo data
      const geoQuery = query(
        collection(db, this.collections.pageViews),
        where('timestamp', '>=', startDate),
        where('geo.country', '!=', null),
        limit(1000)
      )
      const geoSnapshot = await getDocs(geoQuery)
      
      const pageViews = geoSnapshot.docs.map(doc => doc.data() as any)

      // Aggregate by country
      const countryCounts = pageViews.reduce((acc, pv) => {
        const country = pv.geo.country
        acc[country] = (acc[country] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const totalViews = Object.values(countryCounts).reduce((sum, count) => sum + count, 0)

      const byCountry = Object.entries(countryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([country, count]) => ({
          country,
          code: this.getCountryCode(country),
          count,
          percentage: (count / totalViews) * 100,
          trend: 'stable' // Would calculate from historical data
        }))

      // Aggregate by region
      const regionCounts = pageViews.reduce((acc, pv) => {
        const region = pv.geo.region || 'Unknown'
        const country = pv.geo.country
        const key = `${country}-${region}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byRegion = Object.entries(regionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([key, count]) => {
          const [country, region] = key.split('-')
          return {
            country,
            region,
            count,
            percentage: (count / totalViews) * 100
          }
        })

      // Aggregate by city
      const cityCounts = pageViews.reduce((acc, pv) => {
        const city = pv.geo.city || 'Unknown'
        const country = pv.geo.country
        const key = `${country}-${city}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topCities = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([key, count]) => {
          const [country, city] = key.split('-')
          return {
            city,
            country,
            count,
            percentage: (count / totalViews) * 100
          }
        })

      return {
        byCountry,
        byRegion,
        topCities
      }
    } catch (error) {
      console.error('Failed to fetch geographic data:', error)
      return this.getDefaultGeographicData()
    }
  }

  /**
   * Get content performance
   */
  async getContentPerformance(options: AnalyticsQueryOptions = { timeRange: '24h' }): Promise<ContentPerformance> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get content performance data
      const contentQuery = query(
        collection(db, this.collections.contentPerformance),
        where('timestamp', '>=', startDate),
        limit(100)
      )
      const contentSnapshot = await getDocs(contentQuery)
      
      const content = contentSnapshot.docs.map(doc => doc.data() as any)

      // Aggregate by content type
      const typeMetrics = content.reduce((acc, item) => {
        const type = item.contentType as PageType
        if (!acc[type]) {
          acc[type] = {
            totalPageViews: 0,
            uniqueVisitors: 0,
            avgTimeOnPage: 0,
            bounceRate: 0,
            engagementScore: 0
          }
        }
        
        acc[type].totalPageViews += item.pageViews
        acc[type].uniqueVisitors += item.uniqueViews
        acc[type].avgTimeOnPage += item.avgTimeOnPage
        acc[type].bounceRate += item.bounceRate
        acc[type].engagementScore += this.calculateEngagementScore(item)
        
        return acc
      }, {} as Record<PageType, any>)

      // Calculate averages
      Object.keys(typeMetrics).forEach(type => {
        const metrics = typeMetrics[type]
        const count = content.filter(item => item.contentType === type).length
        if (count > 0) {
          metrics.avgTimeOnPage = metrics.avgTimeOnPage / count
          metrics.bounceRate = metrics.bounceRate / count
          metrics.engagementScore = metrics.engagementScore / count
        }
      })

      // Get top content
      const topContent = content
        .sort((a, b) => b.pageViews - a.pageViews)
        .slice(0, 20)
        .map(item => ({
          id: item.id,
          title: item.title,
          type: item.contentType,
          pageViews: item.pageViews,
          uniqueViews: item.uniqueViews,
          avgTimeOnPage: item.avgTimeOnPage,
          bounceRate: item.bounceRate,
          shares: item.shares || 0,
          comments: item.comments || 0,
          publishedAt: item.publishedAt
        }))

      // Get underperforming content
      const underperforming = content
        .filter(item => 
          item.bounceRate > 70 || 
          item.avgTimeOnPage < 30000 || 
          this.calculateEngagementScore(item) < 30
        )
        .map(item => ({
          id: item.id,
          title: item.title,
          type: item.contentType,
          issues: this.getContentIssues(item),
          recommendations: this.getContentRecommendations(item)
        }))

      return {
        byType: typeMetrics,
        topContent,
        underperforming
      }
    } catch (error) {
      console.error('Failed to fetch content performance:', error)
      return this.getDefaultContentPerformance()
    }
  }

  /**
   * Get time series data
   */
  async getTimeSeriesData(
    metric: string,
    timeRange: TimeRange,
    granularity: 'hour' | 'day' | 'week' | 'month'
  ): Promise<TimeSeriesData[]> {
    try {
      const timeRangeMs = this.getTimeRangeMs(timeRange)
      const startDate = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))
      
      // Get time series data from aggregated collection
      const timeSeriesQuery = query(
        collection(db, this.collections.aggregated, 'time_series'),
        where('metric', '==', metric),
        where('timestamp', '>=', startDate),
        where('granularity', '==', granularity),
        orderBy('timestamp', 'asc')
      )
      const timeSeriesSnapshot = await getDocs(timeSeriesQuery)
      
      return timeSeriesSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          timestamp: data.timestamp,
          value: data.value,
          label: this.formatTimeSeriesLabel(data.timestamp, granularity)
        }
      })
    } catch (error) {
      console.error('Failed to fetch time series data:', error)
      return []
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private getTimeRangeMs(timeRange: TimeRange): number {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    }
    return ranges[timeRange] || ranges['24h']
  }

  private getPreviousTimeRange(timeRange: TimeRange): TimeRange {
    const ranges: Record<TimeRange, TimeRange> = {
      '1h': '24h',
      '24h': '7d',
      '7d': '30d',
      '30d': '90d',
      '90d': '1y',
      '1y': '1y'
    }
    return ranges[timeRange] || '24h'
  }

  private calculateGrowthRate(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  private calculateEngagementScore(item: any): number {
    const timeWeight = Math.min(item.avgTimeOnPage / 60000, 1) // Max 1 point for time
    const bounceWeight = 1 - (item.bounceRate / 100) // Max 1 point for low bounce
    const interactionWeight = ((item.shares || 0) + (item.comments || 0)) / 10 // Max 1 point for interactions
    
    return (timeWeight + bounceWeight + interactionWeight) * 33.33
  }

  private isUserActive(lastVisit: Timestamp, timeRangeMs: number): boolean {
    const now = Date.now()
    const lastVisitTime = lastVisit.toDate().getTime()
    return (now - lastVisitTime) < timeRangeMs
  }

  private calculateDataFreshness(dataType: string): number {
    // Would implement actual freshness calculation based on last update time
    return 5 // Default 5 minutes ago
  }

  private formatTimeSeriesLabel(timestamp: Timestamp, granularity: string): string {
    const date = timestamp.toDate()
    switch (granularity) {
      case 'hour':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      case 'day':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      case 'week':
        return `Week ${Math.ceil(date.getDate() / 7)}`
      case 'month':
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' })
      default:
        return date.toLocaleString()
    }
  }

  private getCountryCode(country: string): string {
    // Would implement proper country code mapping
    return country.slice(0, 2).toUpperCase()
  }

  private getContentIssues(item: any): string[] {
    const issues = []
    
    if (item.bounceRate > 70) {
      issues.push('High bounce rate')
    }
    
    if (item.avgTimeOnPage < 30000) {
      issues.push('Low engagement time')
    }
    
    if (item.pageViews < 10) {
      issues.push('Low page views')
    }
    
    return issues
  }

  private getContentRecommendations(item: any): string[] {
    const recommendations = []
    
    if (item.bounceRate > 70) {
      recommendations.push('Improve page content and navigation')
      recommendations.push('Add related content suggestions')
    }
    
    if (item.avgTimeOnPage < 30000) {
      recommendations.push('Add more engaging content')
      recommendations.push('Improve page layout and readability')
    }
    
    if (item.pageViews < 10) {
      recommendations.push('Improve SEO and discoverability')
      recommendations.push('Promote content through marketing channels')
    }
    
    return recommendations
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private getFromCache(key: string): { data: any; timestamp: number } | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // ============================================================================
  // REAL-TIME DATA
  // ============================================================================

  private async getRealTimeTrafficMetrics(startDate: Timestamp): Promise<Partial<TrafficMetrics>> {
    // This would query real-time page view data
    // For now, return empty object
    return {}
  }

  private mergeTrafficMetrics(
    aggregated: any,
    realTime: Partial<TrafficMetrics>
  ): TrafficMetrics {
    return {
      ...aggregated,
      ...realTime
    }
  }

  // ============================================================================
  // DEFAULT VALUES
  // ============================================================================

  private getDefaultTrafficMetrics(): TrafficMetrics {
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
      pageViewsPerSession: 0,
      timeRange: '24h'
    }
  }

  private getDefaultTrafficGrowth(): TrafficGrowth {
    return {
      currentPeriod: this.getDefaultTrafficMetrics(),
      previousPeriod: this.getDefaultTrafficMetrics(),
      growthRate: {
        pageViews: 0,
        uniqueVisitors: 0,
        sessions: 0
      }
    }
  }

  private getDefaultTrafficSources(): TrafficSources {
    return {
      bySource: {},
      topReferrers: [],
      campaigns: []
    }
  }

  private getDefaultTopPages(): TopPages {
    return {
      byPageViews: [],
      byEngagement: []
    }
  }

  private getDefaultUserMetrics(): UserMetrics {
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      returningUsers: 0,
      userGrowthRate: 0,
      avgSessionsPerUser: 0,
      avgTimeOnSite: 0,
      retentionRate: 0
    }
  }

  private getDefaultUserDemographics(): UserDemographics {
    return {
      byDevice: {
        mobile: { count: 0, percentage: 0, trend: 'stable' },
        tablet: { count: 0, percentage: 0, trend: 'stable' },
        desktop: { count: 0, percentage: 0, trend: 'stable' }
      },
      byBrowser: [],
      byOS: []
    }
  }

  private getDefaultGeographicData(): GeographicData {
    return {
      byCountry: [],
      byRegion: [],
      topCities: []
    }
  }

  private getDefaultContentPerformance(): ContentPerformance {
    return {
      byType: {
        news: { totalPageViews: 0, uniqueVisitors: 0, avgTimeOnPage: 0, bounceRate: 0, engagementScore: 0 },
        knowledge: { totalPageViews: 0, uniqueVisitors: 0, avgTimeOnPage: 0, bounceRate: 0, engagementScore: 0 },
        traditions: { totalPageViews: 0, uniqueVisitors: 0, avgTimeOnPage: 0, bounceRate: 0, engagementScore: 0 },
        regulations: { totalPageViews: 0, uniqueVisitors: 0, avgTimeOnPage: 0, bounceRate: 0, engagementScore: 0 }
      },
      topContent: [],
      underperforming: []
    }
  }

  private async getUserGrowthData(
    granularity: 'daily' | 'weekly' | 'monthly',
    options: AnalyticsQueryOptions
  ): Promise<Array<{ date: string; users: number; newUsers: number }>> {
    // This would fetch user growth data from aggregated collections
    // For now, return empty array
    return []
  }

  private async getDailyUserGrowthData(
    options: AnalyticsQueryOptions
  ): Promise<Array<{ date: string; users: number; newUsers: number }>> {
    return []
  }

  private async getWeeklyUserGrowthData(
    options: AnalyticsQueryOptions
  ): Promise<Array<{ week: string; users: number; newUsers: number }>> {
    return []
  }

  private async getMonthlyUserGrowthData(
    options: AnalyticsQueryOptions
  ): Promise<Array<{ month: string; users: number; newUsers: number }>> {
    return []
  }
}

// Export singleton instance
export const trafficService = new TrafficServiceClass()
