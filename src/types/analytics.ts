/**
 * Analytics Data Types
 * 
 * Types for user and traffic analytics with proper aggregation support
 */

// ============================================================================
// CORE ANALYTICS TYPES
// ============================================================================

export type PageType = 'news' | 'knowledge' | 'traditions' | 'regulations'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type TrafficSource = 'organic' | 'direct' | 'referral' | 'social' | 'email' | 'paid'
export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | '1y'

// ============================================================================
// RAW EVENT TYPES
// ============================================================================

export interface PageViewEvent {
  id: string
  timestamp: import('firebase/firestore').Timestamp
  pageUrl: string
  pageTitle: string
  pageType: PageType
  userId?: string
  sessionId: string
  userAgent: string
  ipAddress: string
  referrer?: string
  loadTime: number
  viewport: { width: number; height: number }
  device: {
    type: DeviceType
    os: string
    browser: string
    version?: string
  }
  geo: {
    country: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }
}

export interface UserEvent {
  id: string
  userId: string
  timestamp: import('firebase/firestore').Timestamp
  eventType: 'session_start' | 'session_end' | 'page_view' | 'user_signup'
  sessionId: string
  data: Record<string, any>
}

export interface TrafficSourceEvent {
  id: string
  timestamp: import('firebase/firestore').Timestamp
  source: TrafficSource
  sourceDetail: string
  campaign?: string
  medium?: string
  sessionId: string
  userId?: string
  landingPage: string
  referrer?: string
}

// ============================================================================
// AGGREGATED METRICS TYPES
// ============================================================================

export interface TrafficMetrics {
  totalPageViews: number
  uniqueVisitors: number
  totalSessions: number
  avgSessionDuration: number
  bounceRate: number
  pageViewsPerSession: number
  timeRange: TimeRange
}

export interface TrafficGrowth {
  currentPeriod: TrafficMetrics
  previousPeriod: TrafficMetrics
  growthRate: {
    pageViews: number
    uniqueVisitors: number
    sessions: number
  }
}

export interface TrafficSources {
  bySource: Record<TrafficSource, {
    count: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
    growthRate: number
  }>
  topReferrers: Array<{
    domain: string
    count: number
    percentage: number
  }>
  campaigns: Array<{
    name: string
    source: TrafficSource
    count: number
    conversionRate: number
  }>
}

export interface TopPages {
  byPageViews: Array<{
    url: string
    title: string
    pageType: PageType
    pageViews: number
    uniqueViews: number
    avgTimeOnPage: number
    bounceRate: number
    growthRate: number
  }>
  byEngagement: Array<{
    url: string
    title: string
    pageType: PageType
    avgTimeOnPage: number
    engagementScore: number
    shares: number
    comments: number
  }>
}

export interface UserMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  userGrowthRate: number
  avgSessionsPerUser: number
  avgTimeOnSite: number
  retentionRate: number
}

export interface UserDemographics {
  byDevice: Record<DeviceType, {
    count: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>
  byBrowser: Array<{
    name: string
    version: string
    count: number
    percentage: number
  }>
  byOS: Array<{
    name: string
    version: string
    count: number
    percentage: number
  }>
}

export interface GeographicData {
  byCountry: Array<{
    country: string
    code: string
    count: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>
  byRegion: Array<{
    country: string
    region: string
    count: number
    percentage: number
  }>
  topCities: Array<{
    city: string
    country: string
    count: number
    percentage: number
  }>
}

export interface ContentPerformance {
  byType: Record<PageType, {
    totalPageViews: number
    uniqueVisitors: number
    avgTimeOnPage: number
    bounceRate: number
    engagementScore: number
  }>
  topContent: Array<{
    id: string
    title: string
    type: PageType
    pageViews: number
    uniqueViews: number
    avgTimeOnPage: number
    bounceRate: number
    shares: number
    comments: number
    likes: number
    publishedAt: import('firebase/firestore').Timestamp
  }>
  underperforming: Array<{
    id: string
    title: string
    type: PageType
    issues: string[]
    recommendations: string[]
  }>
}

// ============================================================================
// COMBINED ANALYTICS DATA
// ============================================================================

export interface AnalyticsData {
  traffic: {
    metrics: TrafficMetrics
    growth: TrafficGrowth
    sources: TrafficSources
    topPages: TopPages
  }
  users: {
    metrics: UserMetrics
    demographics: UserDemographics
    growth: {
      daily: Array<{ date: string; users: number; newUsers: number }>
      weekly: Array<{ week: string; users: number; newUsers: number }>
      monthly: Array<{ month: string; users: number; newUsers: number }>
    }
  }
  content: ContentPerformance
  geographic: GeographicData
  lastUpdated: import('firebase/firestore').Timestamp
  dataFreshness: {
    traffic: number // minutes ago
    users: number // minutes ago
    content: number // minutes ago
    geographic: number // minutes ago
  }
}

// ============================================================================
// QUERY OPTIONS
// ============================================================================

export interface AnalyticsQueryOptions {
  timeRange: TimeRange
  includeGrowth?: boolean
  includeDemographics?: boolean
  includeGeographic?: boolean
  includeContentPerformance?: boolean
  limit?: number
  offset?: number
}

// ============================================================================
// AGGREGATION HELPERS
// ============================================================================

export interface AggregationResult<T> {
  data: T
  processed: number
  errors: string[]
  warnings: string[]
}

export interface TimeSeriesData {
  timestamp: import('firebase/firestore').Timestamp
  value: number
  label: string
}

export interface ComparisonData {
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }>
}

export interface TrafficChart extends ChartData {
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  title: string
  subtitle?: string
  timeRange: TimeRange
}

export interface UserGrowthChart extends ChartData {
  type: 'line' | 'area'
  title: string
  subtitle?: string
  timeRange: TimeRange
  growthRate: number
}

export interface GeographicChart extends ChartData {
  type: 'map' | 'bar' | 'pie'
  title: string
  subtitle?: string
  region: 'world' | 'country' | 'region'
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface TrafficService {
  getTrafficMetrics(options?: AnalyticsQueryOptions): Promise<TrafficMetrics>
  getTrafficGrowth(options?: AnalyticsQueryOptions): Promise<TrafficGrowth>
  getTrafficSources(options?: AnalyticsQueryOptions): Promise<TrafficSources>
  getTopPages(options?: AnalyticsQueryOptions): Promise<TopPages>
  getUserMetrics(options?: AnalyticsQueryOptions): Promise<UserMetrics>
  getUserDemographics(options?: AnalyticsQueryOptions): Promise<UserDemographics>
  getGeographicData(options?: AnalyticsQueryOptions): Promise<GeographicData>
  getContentPerformance(options?: AnalyticsQueryOptions): Promise<ContentPerformance>
  getAnalyticsData(options?: AnalyticsQueryOptions): Promise<AnalyticsData>
  getTimeSeriesData(
    metric: string, 
    timeRange: TimeRange, 
    granularity: 'hour' | 'day' | 'week' | 'month'
  ): Promise<TimeSeriesData[]>
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseTrafficDataResult {
  data: AnalyticsData | null
  loading: boolean
  error: string | null
  lastUpdated: import('firebase/firestore').Timestamp | null
  refresh: () => Promise<void>
  setTimeRange: (range: TimeRange) => void
  exportData: (format: 'csv' | 'json') => void
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface AnalyticsDataValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  freshness: {
    traffic: 'fresh' | 'stale' | 'expired'
    users: 'fresh' | 'stale' | 'expired'
    content: 'fresh' | 'stale' | 'expired'
    geographic: 'fresh' | 'stale' | 'expired'
  }
}

export interface QueryValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recommendedTimeRange: TimeRange
}
