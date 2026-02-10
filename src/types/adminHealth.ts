/**
 * Admin Health Monitoring Types
 * 
 * Types for system health monitoring and metrics collection
 */

// ============================================================================
// HEALTH STATUS TYPES
// ============================================================================

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

export type SiteStatus = 'up' | 'down' | 'degraded' | 'unknown'

// ============================================================================
// SITE STATUS METRICS
// ============================================================================

export interface SiteStatusMetrics {
  status: SiteStatus
  lastChecked: import('firebase/firestore').Timestamp
  uptime: number // Percentage (0-100)
  lastOutage?: {
    start: import('firebase/firestore').Timestamp
    end?: import('firebase/firestore').Timestamp
    duration?: number // in minutes
    reason: string
  }
  responseTime: number // in milliseconds
  checks: {
    total: number
    passed: number
    failed: number
  }
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export interface PerformanceMetrics {
  averageLoadTime: number // in milliseconds
  slowestPage: {
    url: string
    loadTime: number
    timestamp: import('firebase/firestore').Timestamp
  }
  fastestPage: {
    url: string
    loadTime: number
    timestamp: import('firebase/firestore').Timestamp
  }
  totalPageViews: number
  bounceRate: number // percentage
  timeSeries: Array<{
    timestamp: import('firebase/firestore').Timestamp
    loadTime: number
    pageViews: number
  }>
}

// ============================================================================
// ERROR METRICS
// ============================================================================

export interface ErrorMetrics {
  totalErrors: number
  errorRate: number // percentage of total requests
  errorsByType: {
    '4xx': number
    '5xx': number
  }
  topErrors: Array<{
    url: string
    statusCode: number
    count: number
    firstSeen: import('firebase/firestore').Timestamp
    lastSeen: import('firebase/firestore').Timestamp
  }>
  recentErrors: Array<{
    timestamp: import('firebase/firestore').Timestamp
    url: string
    statusCode: number
    userAgent: string
    ipAddress: string
    errorId: string
  }>
}

// ============================================================================
// SECURITY METRICS
// ============================================================================

export interface SecurityMetrics {
  totalAlerts: number
  alertsByType: {
    failedLogins: number
    suspiciousActivity: number
    bruteForceAttempts: number
    unusualAccess: number
  }
  recentAlerts: Array<{
    id: string
    type: 'failed_login' | 'suspicious_activity' | 'brute_force' | 'unusual_access'
    severity: 'low' | 'medium' | 'high' | 'critical'
    timestamp: import('firebase/firestore').Timestamp
    description: string
    source: {
      ipAddress: string
      userAgent: string
      userId?: string
    }
    resolved: boolean
    resolvedBy?: string
    resolvedAt?: import('firebase/firestore').Timestamp
  }>
  securityScore: number // 0-100
}

// ============================================================================
// AGGREGATE HEALTH DATA
// ============================================================================

export interface AdminHealthData {
  siteStatus: SiteStatusMetrics
  performance: PerformanceMetrics
  errors: ErrorMetrics
  security: SecurityMetrics
  lastUpdated: import('firebase/firestore').Timestamp
  dataFreshness: {
    siteStatus: number // minutes ago
    performance: number // minutes ago
    errors: number // minutes ago
    security: number // minutes ago
  }
}

// ============================================================================
// HEALTH QUERY OPTIONS
// ============================================================================

export interface HealthQueryOptions {
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d'
  refreshInterval?: number // in seconds
  includeTimeSeries?: boolean
}

// ============================================================================
// HEALTH ALERT TYPES
// ============================================================================

export interface HealthAlert {
  id: string
  type: 'site_down' | 'performance_degradation' | 'error_spike' | 'security_breach'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: import('firebase/firestore').Timestamp
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: import('firebase/firestore').Timestamp
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: import('firebase/firestore').Timestamp
}

// ============================================================================
// MONITORING STATUS TYPES
// ============================================================================

export interface MonitoringStatus {
  isOnline: boolean
  lastDataReceived: import('firebase/firestore').Timestamp
  dataSources: {
    siteStatus: 'online' | 'offline' | 'error'
    performance: 'online' | 'offline' | 'error'
    errors: 'online' | 'offline' | 'error'
    security: 'online' | 'offline' | 'error'
  }
  issues: Array<{
    source: string
    type: 'connection' | 'data' | 'processing'
    message: string
    timestamp: import('firebase/firestore').Timestamp
  }>
}

// ============================================================================
// HEALTH CARD PROPS
// ============================================================================

export interface HealthCardProps {
  title: string
  status: HealthStatus
  value: string | number
  subtitle?: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
  icon: React.ComponentType<any>
  loading?: boolean
  error?: string
  lastUpdated?: import('firebase/firestore').Timestamp
  onClick?: () => void
}

// ============================================================================
// HEALTH SERVICE TYPES
// ============================================================================

export interface AdminHealthService {
  getHealthData(options?: HealthQueryOptions): Promise<AdminHealthData>
  getSiteStatus(): Promise<SiteStatusMetrics>
  getPerformanceMetrics(options?: HealthQueryOptions): Promise<PerformanceMetrics>
  getErrorMetrics(options?: HealthQueryOptions): Promise<ErrorMetrics>
  getSecurityMetrics(options?: HealthQueryOptions): Promise<SecurityMetrics>
  getMonitoringStatus(): Promise<MonitoringStatus>
  acknowledgeAlert(alertId: string, userId: string): Promise<void>
  resolveAlert(alertId: string, userId: string): Promise<void>
}

// ============================================================================
// HEALTH HOOK TYPES
// ============================================================================

export interface UseAdminHealthResult {
  data: AdminHealthData | null
  loading: boolean
  error: string | null
  lastUpdated: import('firebase/firestore').Timestamp | null
  monitoringStatus: MonitoringStatus | null
  refresh: () => Promise<void>
  acknowledgeAlert: (alertId: string) => Promise<void>
  resolveAlert: (alertId: string) => Promise<void>
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface HealthDataValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  freshness: {
    siteStatus: 'fresh' | 'stale' | 'expired'
    performance: 'fresh' | 'stale' | 'expired'
    errors: 'fresh' | 'stale' | 'expired'
    security: 'fresh' | 'stale' | 'expired'
  }
}
