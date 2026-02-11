import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { 
  AdminHealthData, 
  SiteStatusMetrics, 
  PerformanceMetrics, 
  ErrorMetrics, 
  SecurityMetrics,
  MonitoringStatus,
  HealthQueryOptions,
  HealthAlert
} from '../types/adminHealth'
import { AdminServiceError } from './adminService'

/**
 * Admin Health Service
 * 
 * Provides real-time system health monitoring and metrics collection
 * with proper error handling and data validation
 */
class AdminHealthServiceClass {
  private readonly collections = {
    siteStatus: 'health_site_status',
    performance: 'health_performance',
    errors: 'health_errors',
    security: 'health_security',
    alerts: 'health_alerts',
    monitoring: 'health_monitoring'
  }

  /**
   * Get comprehensive health data
   */
  async getHealthData(options: HealthQueryOptions = { timeRange: '24h' }): Promise<AdminHealthData> {
    try {
      const [siteStatus, performance, errors, security] = await Promise.all([
        this.getSiteStatus(),
        this.getPerformanceMetrics(options),
        this.getErrorMetrics(options),
        this.getSecurityMetrics(options)
      ])

      const lastUpdated = Timestamp.now()

      return {
        siteStatus,
        performance,
        errors,
        security,
        lastUpdated,
        dataFreshness: {
          siteStatus: this.calculateFreshness(siteStatus.lastChecked),
          performance: this.calculateFreshness(performance.timeSeries[0]?.timestamp),
          errors: this.calculateFreshness(errors.recentErrors[0]?.timestamp),
          security: this.calculateFreshness(security.recentAlerts[0]?.timestamp)
        }
      }
    } catch (error) {
      throw new AdminServiceError(
        'Failed to fetch health data',
        'HEALTH_DATA_FETCH_ERROR',
        { originalError: error }
      )
    }
  }

  /**
   * Get site status metrics
   */
  async getSiteStatus(): Promise<SiteStatusMetrics> {
    try {
      const statusDoc = await getDoc(doc(db, this.collections.siteStatus, 'current'))
      
      if (!statusDoc.exists()) {
        return this.getDefaultSiteStatus()
      }

      const data = statusDoc.data()
      
      // Get recent outage data
      const outageQuery = query(
        collection(db, this.collections.siteStatus, 'outages'),
        orderBy('start', 'desc'),
        limit(5)
      )
      const outageSnapshot = await getDocs(outageQuery)
      
      const outages = outageSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      const lastOutage = outages.find(outage => !(outage as any).end) || outages[0]

      return {
        status: data.status || 'unknown',
        lastChecked: (data.lastChecked as Timestamp) || Timestamp.now(),
        uptime: data.uptime || 0,
        lastOutage: lastOutage ? {
          start: (lastOutage as any).start,
          end: (lastOutage as any).end,
          duration: (lastOutage as any).duration,
          reason: (lastOutage as any).reason
        } : undefined,
        responseTime: data.responseTime || 0,
        checks: data.checks || { total: 0, passed: 0, failed: 0 }
      }
    } catch (error) {
      console.error('Failed to fetch site status:', error)
      return this.getDefaultSiteStatus()
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(options: HealthQueryOptions = { timeRange: '24h' }): Promise<PerformanceMetrics> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const cutoff = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get time series data
      const timeSeriesQuery = query(
        collection(db, this.collections.performance, 'timeseries'),
        where('timestamp', '>=', cutoff),
        orderBy('timestamp', 'desc'),
        limit(100)
      )
      const timeSeriesSnapshot = await getDocs(timeSeriesQuery)
      
      const timeSeries = timeSeriesSnapshot.docs.map(doc => ({
        timestamp: doc.data().timestamp,
        loadTime: doc.data().loadTime,
        pageViews: doc.data().pageViews
      }))

      // Get page performance data
      const pagesQuery = query(
        collection(db, this.collections.performance, 'pages'),
        where('timestamp', '>=', cutoff),
        orderBy('timestamp', 'desc'),
        limit(1000)
      )
      const pagesSnapshot = await getDocs(pagesQuery)
      
      const pages = pagesSnapshot.docs.map(doc => doc.data() as any)

      // Calculate metrics
      const totalPageViews = pages.reduce((sum, page) => sum + page.pageViews, 0)
      const averageLoadTime = pages.length > 0 
        ? pages.reduce((sum, page) => sum + page.loadTime, 0) / pages.length 
        : 0

      const slowestPage = pages.length > 0 
        ? pages.reduce((slowest, page) => page.loadTime > slowest.loadTime ? page : slowest)
        : null

      const fastestPage = pages.length > 0 
        ? pages.reduce((fastest, page) => page.loadTime < fastest.loadTime ? page : fastest)
        : null

      return {
        averageLoadTime,
        slowestPage: slowestPage || {
          url: '/unknown',
          loadTime: 0,
          timestamp: Timestamp.now()
        },
        fastestPage: fastestPage || {
          url: '/unknown',
          loadTime: 0,
          timestamp: Timestamp.now()
        },
        totalPageViews,
        bounceRate: this.calculateBounceRate(pages),
        timeSeries
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
      return this.getDefaultPerformanceMetrics()
    }
  }

  /**
   * Get error metrics
   */
  async getErrorMetrics(options: HealthQueryOptions = { timeRange: '24h' }): Promise<ErrorMetrics> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const cutoff = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get recent errors
      const errorsQuery = query(
        collection(db, this.collections.errors, 'recent'),
        where('timestamp', '>=', cutoff),
        orderBy('timestamp', 'desc'),
        limit(100)
      )
      const errorsSnapshot = await getDocs(errorsQuery)
      
      const recentErrors = errorsSnapshot.docs.map(doc => ({
        timestamp: doc.data().timestamp,
        url: doc.data().url,
        statusCode: doc.data().statusCode,
        userAgent: doc.data().userAgent,
        ipAddress: doc.data().ipAddress,
        errorId: doc.id
      }))

      // Get error aggregates
      const aggregatesDoc = await getDoc(doc(db, this.collections.errors, 'aggregates'))
      const aggregates = aggregatesDoc.exists() ? aggregatesDoc.data() : {}

      const totalRequests = aggregates.totalRequests || 0
      const totalErrors = recentErrors.length

      return {
        totalErrors,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
        errorsByType: {
          '4xx': aggregates.errorsByType?.['4xx'] || 0,
          '5xx': aggregates.errorsByType?.['5xx'] || 0
        },
        topErrors: aggregates.topErrors || [],
        recentErrors
      }
    } catch (error) {
      console.error('Failed to fetch error metrics:', error)
      return this.getDefaultErrorMetrics()
    }
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(options: HealthQueryOptions = { timeRange: '24h' }): Promise<SecurityMetrics> {
    try {
      const timeRangeMs = this.getTimeRangeMs(options.timeRange)
      const cutoff = Timestamp.fromDate(new Date(Date.now() - timeRangeMs))

      // Get recent security alerts
      const alertsQuery = query(
        collection(db, this.collections.security, 'alerts'),
        where('timestamp', '>=', cutoff),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
      const alertsSnapshot = await getDocs(alertsQuery)
      
      const recentAlerts = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: doc.data().type,
        severity: doc.data().severity,
        timestamp: doc.data().timestamp,
        description: doc.data().description,
        source: doc.data().source,
        resolved: doc.data().resolved || false,
        resolvedBy: doc.data().resolvedBy,
        resolvedAt: doc.data().resolvedAt
      }))

      // Calculate metrics
      const alertsByType = recentAlerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const totalAlerts = recentAlerts.length
      const securityScore = this.calculateSecurityScore(recentAlerts)

      return {
        totalAlerts,
        alertsByType: {
          failedLogins: alertsByType.failed_login || 0,
          suspiciousActivity: alertsByType.suspicious_activity || 0,
          bruteForceAttempts: alertsByType.brute_force || 0,
          unusualAccess: alertsByType.unusual_access || 0
        },
        recentAlerts,
        securityScore
      }
    } catch (error) {
      console.error('Failed to fetch security metrics:', error)
      return this.getDefaultSecurityMetrics()
    }
  }

  /**
   * Get monitoring status
   */
  async getMonitoringStatus(): Promise<MonitoringStatus> {
    try {
      const monitoringDoc = await getDoc(doc(db, this.collections.monitoring, 'status'))
      
      if (!monitoringDoc.exists()) {
        return this.getDefaultMonitoringStatus()
      }

      const data = monitoringDoc.data()
      
      return {
        isOnline: data.isOnline || false,
        lastDataReceived: (data.lastDataReceived as Timestamp) || Timestamp.now(),
        dataSources: data.dataSources || {
          siteStatus: 'offline',
          performance: 'offline',
          errors: 'offline',
          security: 'offline'
        },
        issues: data.issues || []
      }
    } catch (error) {
      console.error('Failed to fetch monitoring status:', error)
      return this.getDefaultMonitoringStatus()
    }
  }

  /**
   * Acknowledge health alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alertRef = doc(db, this.collections.alerts, alertId)
      await updateDoc(alertRef, {
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: serverTimestamp()
      })
    } catch (error) {
      throw new AdminServiceError(
        'Failed to acknowledge alert',
        'ALERT_ACKNOWLEDGE_ERROR',
        { alertId, userId, originalError: error }
      )
    }
  }

  /**
   * Resolve health alert
   */
  async resolveAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alertRef = doc(db, this.collections.alerts, alertId)
      await updateDoc(alertRef, {
        resolved: true,
        resolvedBy: userId,
        resolvedAt: serverTimestamp()
      })
    } catch (error) {
      throw new AdminServiceError(
        'Failed to resolve alert',
        'ALERT_RESOLVE_ERROR',
        { alertId, userId, originalError: error }
      )
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private getTimeRangeMs(timeRange: string): number {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    return ranges[timeRange as keyof typeof ranges] || ranges['24h']
  }

  private calculateFreshness(timestamp?: Timestamp): number {
    if (!timestamp) return 999 // Very stale
    const now = Date.now()
    const then = timestamp.toDate().getTime()
    return Math.floor((now - then) / (60 * 1000)) // minutes ago
  }

  private calculateBounceRate(pages: any[]): number {
    if (pages.length === 0) return 0
    
    const singlePageViews = pages.filter(page => page.pageViews === 1).length
    return (singlePageViews / pages.length) * 100
  }

  private calculateSecurityScore(alerts: any[]): number {
    if (alerts.length === 0) return 100
    
    const severityWeights = { low: 1, medium: 5, high: 10, critical: 25 }
    const totalWeight = alerts.reduce((sum, alert) => {
      return sum + (severityWeights[alert.severity as keyof typeof severityWeights] || 1)
    }, 0)
    
    // Score decreases based on alert severity
    const score = Math.max(0, 100 - totalWeight)
    return Math.round(score)
  }

  private getDefaultSiteStatus(): SiteStatusMetrics {
    return {
      status: 'unknown',
      lastChecked: Timestamp.now(),
      uptime: 0,
      responseTime: 0,
      checks: { total: 0, passed: 0, failed: 0 }
    }
  }

  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      averageLoadTime: 0,
      slowestPage: {
        url: '/unknown',
        loadTime: 0,
        timestamp: Timestamp.now()
      },
      fastestPage: {
        url: '/unknown',
        loadTime: 0,
        timestamp: Timestamp.now()
      },
      totalPageViews: 0,
      bounceRate: 0,
      timeSeries: []
    }
  }

  private getDefaultErrorMetrics(): ErrorMetrics {
    return {
      totalErrors: 0,
      errorRate: 0,
      errorsByType: { '4xx': 0, '5xx': 0 },
      topErrors: [],
      recentErrors: []
    }
  }

  private getDefaultSecurityMetrics(): SecurityMetrics {
    return {
      totalAlerts: 0,
      alertsByType: {
        failedLogins: 0,
        suspiciousActivity: 0,
        bruteForceAttempts: 0,
        unusualAccess: 0
      },
      recentAlerts: [],
      securityScore: 100
    }
  }

  private getDefaultMonitoringStatus(): MonitoringStatus {
    return {
      isOnline: false,
      lastDataReceived: Timestamp.now(),
      dataSources: {
        siteStatus: 'offline',
        performance: 'offline',
        errors: 'offline',
        security: 'offline'
      },
      issues: [{
        source: 'monitoring',
        type: 'connection',
        message: 'Unable to connect to monitoring service',
        timestamp: Timestamp.now()
      }]
    }
  }
}

// Export singleton instance
export const adminHealthService = new AdminHealthServiceClass()
