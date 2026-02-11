import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { 
  AuditLogEntry,
  SecurityAlert,
  ErrorLogEntry,
  AuditQueryOptions,
  SecurityAlertQueryOptions,
  ErrorLogQueryOptions,
  AuditLogResult,
  SecurityAlertResult,
  ErrorLogResult,
  AuditAction,
  SecurityAlertType,
} from '../types/audit'

/**
 * Audit Log Service
 * 
 * Provides comprehensive audit logging, security monitoring, and error tracking
 * with append-only logs, immutable records, and complete audit trails
 */
class AuditLogServiceClass {
  private readonly collections = {
    auditLogs: 'audit_logs',
    securityAlerts: 'security_alerts',
    errorLogs: 'error_logs',
    archivedLogs: 'archived_logs',
    systemMetrics: 'system_metrics'
  }

  private readonly flushInterval = 5000 // 5 seconds
  private logBuffer: Array<any> = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor() {
    this.startFlushTimer()
  }

  /**
   * Log an audit action
   */
  async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      const auditEntry: AuditLogEntry = {
        id: this.generateId(),
        timestamp: serverTimestamp(),
        ...entry,
        system: {
          version: process.env.REACT_APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          service: 'admin-panel',
          instance: this.getInstanceId()
        },
        compliance: {
          retentionCategory: this.getRetentionCategory(entry.action),
          retentionPeriod: this.getRetentionPeriod(entry.action),
          archived: false
        }
      }

      // Add to buffer for batch processing
      this.logBuffer.push({
        type: 'audit',
        collection: this.collections.auditLogs,
        data: auditEntry
      })

      // Return the ID immediately for reference
      return auditEntry.id
    } catch (error) {
      console.error('Failed to log audit action:', error)
      throw new Error(`Failed to log audit action: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Log an error
   */
  async logError(entry: Omit<ErrorLogEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      const errorEntry: ErrorLogEntry = {
        id: this.generateId(),
        timestamp: serverTimestamp(),
        ...entry,
        system: {
          version: process.env.REACT_APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          service: 'admin-panel',
          instance: this.getInstanceId()
        }
      }

      // Add to buffer for batch processing
      this.logBuffer.push({
        type: 'error',
        collection: this.collections.errorLogs,
        data: errorEntry
      })

      return errorEntry.id
    } catch (error) {
      console.error('Failed to log error:', error)
      throw new Error(`Failed to log error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Log a security alert
   */
  async logSecurityAlert(entry: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<string> {
    try {
      const securityAlert: SecurityAlert = {
        id: this.generateId(),
        timestamp: serverTimestamp(),
        ...entry,
        status: 'active',
        actions: []
      }

      // Add to buffer for batch processing
      this.logBuffer.push({
        type: 'security',
        collection: this.collections.securityAlerts,
        data: securityAlert
      })

      return securityAlert.id
    } catch (error) {
      console.error('Failed to log security alert:', error)
      throw new Error(`Failed to log security alert: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(options: AuditQueryOptions = {}): Promise<AuditLogResult> {
    try {
      const constraints: any[] = []

      // Time range filter
      if (options.startDate) {
        constraints.push(where('timestamp', '>=', options.startDate))
      }
      if (options.endDate) {
        constraints.push(where('timestamp', '<=', options.endDate))
      }

      // Actor filters
      if (options.actorUserId) {
        constraints.push(where('actor.userId', '==', options.actorUserId))
      }
      if (options.actorRole) {
        constraints.push(where('actor.userRole', '==', options.actorRole))
      }
      if (options.actorEmail) {
        constraints.push(where('actor.userEmail', '==', options.actorEmail))
      }

      // Action filters
      if (options.actions && options.actions.length > 0) {
        constraints.push(where('action', 'in', options.actions))
      }

      // Resource filters
      if (options.resourceType) {
        constraints.push(where('resourceType', '==', options.resourceType))
      }
      if (options.resourceId) {
        constraints.push(where('resourceId', '==', options.resourceId))
      }

      // Status and level filters
      if (options.status) {
        constraints.push(where('status', '==', options.status))
      }
      if (options.level) {
        constraints.push(where('level', '==', options.level))
      }

      // Context filters
      if (options.ipAddress) {
        constraints.push(where('context.ipAddress', '==', options.ipAddress))
      }
      if (options.userAgent) {
        constraints.push(where('context.userAgent', '==', options.userAgent))
      }
      if (options.sessionId) {
        constraints.push(where('context.sessionId', '==', options.sessionId))
      }

      // Sorting
      const sortBy = options.sortBy || 'timestamp'
      const sortOrder = options.sortOrder || 'desc'
      constraints.push(orderBy(sortBy, sortOrder))

      // Pagination
      if (options.limit) {
        constraints.push(limit(options.limit))
      }
      if (options.offset) {
        constraints.push(startAfter(options.offset))
      }

      const querySnapshot = await getDocs(
        query(collection(db, this.collections.auditLogs), ...constraints)
      )

      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLogEntry[]

      // Generate summary
      const summary = this.generateAuditSummary(entries)

      return {
        entries,
        totalCount: entries.length,
        hasMore: options.limit ? entries.length === options.limit : false,
        cursor: options.offset,
        summary
      }
    } catch (error) {
      console.error('Failed to get audit logs:', error)
      throw new Error(`Failed to get audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get security alerts
   */
  async getSecurityAlerts(options: SecurityAlertQueryOptions = {}): Promise<SecurityAlertResult> {
    try {
      const constraints: any[] = []

      // Time range filter
      if (options.startDate) {
        constraints.push(where('timestamp', '>=', options.startDate))
      }
      if (options.endDate) {
        constraints.push(where('timestamp', '<=', options.endDate))
      }

      // Alert type filters
      if (options.types && options.types.length > 0) {
        constraints.push(where('type', 'in', options.types))
      }

      // Severity filters
      if (options.severity && options.severity.length > 0) {
        constraints.push(where('severity', 'in', options.severity))
      }

      // Status filters
      if (options.status && options.status.length > 0) {
        constraints.push(where('status', 'in', options.status))
      }

      // Actor filters
      if (options.actorUserId) {
        constraints.push(where('actor.userId', '==', options.actorUserId))
      }
      if (options.actorEmail) {
        constraints.push(where('actor.userEmail', '==', options.actorEmail))
      }
      if (options.ipAddress) {
        constraints.push(where('context.ipAddress', '==', options.ipAddress))
      }

      // Target filters
      if (options.resourceType) {
        constraints.push(where('target.resourceType', '==', options.resourceType))
      }
      if (options.resourceId) {
        constraints.push(where('target.resourceId', '==', options.resourceId))
      }

      // Detection filters
      if (options.source) {
        constraints.push(where('detection.source', '==', options.source))
      }
      if (options.confidence) {
        if (options.confidence.min !== undefined) {
          constraints.push(where('detection.confidence', '>=', options.confidence.min))
        }
        if (options.confidence.max !== undefined) {
          constraints.push(where('detection.confidence', '<=', options.confidence.max))
        }
      }

      // Sorting
      const sortBy = options.sortBy || 'timestamp'
      const sortOrder = options.sortOrder || 'desc'
      constraints.push(orderBy(sortBy, sortOrder))

      // Pagination
      if (options.limit) {
        constraints.push(limit(options.limit))
      }
      if (options.offset) {
        constraints.push(startAfter(options.offset))
      }

      const querySnapshot = await getDocs(
        query(collection(db, this.collections.securityAlerts), ...constraints)
      )

      const alerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SecurityAlert[]

      // Generate summary
      const summary = this.generateSecuritySummary(alerts)

      return {
        alerts,
        totalCount: alerts.length,
        hasMore: options.limit ? alerts.length === options.limit : false,
        summary
      }
    } catch (error) {
      console.error('Failed to get security alerts:', error)
      throw new Error(`Failed to get security alerts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get error logs
   */
  async getErrorLogs(options: ErrorLogQueryOptions = {}): Promise<ErrorLogResult> {
    try {
      const constraints: any[] = []

      // Time range filter
      if (options.startDate) {
        constraints.push(where('timestamp', '>=', options.startDate))
      }
      if (options.endDate) {
        constraints.push(where('timestamp', '<=', options.endDate))
      }

      // Error type filters
      if (options.errorTypes && options.errorTypes.length > 0) {
        constraints.push(where('error.name', 'in', options.errorTypes))
      }

      // Error category filters
      if (options.errorCategories && options.errorCategories.length > 0) {
        constraints.push(where('error.type', 'in', options.errorCategories))
      }

      // Severity filters
      if (options.severity && options.severity.length > 0) {
        constraints.push(where('impact.severity', 'in', options.severity))
      }

      // Context filters
      if (options.userId) {
        constraints.push(where('context.userId', '==', options.userId))
      }
      if (options.sessionId) {
        constraints.push(where('context.sessionId', '==', options.sessionId))
      }
      if (options.apiEndpoint) {
        constraints.push(where('context.apiEndpoint', '==', options.apiEndpoint))
      }
      if (options.ipAddress) {
        constraints.push(where('context.ipAddress', '==', options.ipAddress))
      }

      // Status filter
      if (options.resolved !== undefined) {
        constraints.push(where('resolution.resolved', '==', options.resolved))
      }

      // Sorting
      const sortBy = options.sortBy || 'timestamp'
      const sortOrder = options.sortOrder || 'desc'
      constraints.push(orderBy(sortBy, sortOrder))

      // Pagination
      if (options.limit) {
        constraints.push(limit(options.limit))
      }
      if (options.offset) {
        constraints.push(startAfter(options.offset))
      }

      const querySnapshot = await getDocs(
        query(collection(db, this.collections.errorLogs), ...constraints)
      )

      const errors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ErrorLogEntry[]

      // Generate summary
      const summary = this.generateErrorSummary(errors)

      return {
        errors,
        totalCount: errors.length,
        hasMore: options.limit ? errors.length === options.limit : false,
        summary
      }
    } catch (error) {
      console.error('Failed to get error logs:', error)
      throw new Error(`Failed to get error logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(query: string, options: AuditQueryOptions = {}): Promise<AuditLogResult> {
    try {
      // For now, implement basic text search
      // In a real implementation, you might use Algolia or Elasticsearch
      const allLogs = await this.getAuditLogs({
        ...options,
        limit: 1000 // Get more for searching
      })

      const searchResults = allLogs.entries.filter(entry => 
        this.matchesSearchQuery(entry, query)
      )

      return {
        ...allLogs,
        entries: searchResults,
        totalCount: searchResults.length
      }
    } catch (error) {
      console.error('Failed to search audit logs:', error)
      throw new Error(`Failed to search audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search security alerts
   */
  async searchSecurityAlerts(query: string, options: SecurityAlertQueryOptions = {}): Promise<SecurityAlertResult> {
    try {
      const allAlerts = await this.getSecurityAlerts({
        ...options,
        limit: 1000
      })

      const searchResults = allAlerts.alerts.filter(alert => 
        this.matchesSearchQuery(alert, query)
      )

      return {
        ...allAlerts,
        alerts: searchResults,
        totalCount: searchResults.length
      }
    } catch (error) {
      console.error('Failed to search security alerts:', error)
      throw new Error(`Failed to search security alerts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search error logs
   */
  async searchErrorLogs(query: string, options: ErrorLogQueryOptions = {}): Promise<ErrorLogResult> {
    try {
      const allErrors = await this.getErrorLogs({
        ...options,
        limit: 1000
      })

      const searchResults = allErrors.errors.filter(error => 
        this.matchesSearchQuery(error, query)
      )

      return {
        ...allErrors,
        errors: searchResults,
        totalCount: searchResults.length
      }
    } catch (error) {
      console.error('Failed to search error logs:', error)
      throw new Error(`Failed to search error logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(options: AuditQueryOptions, format: 'csv' | 'json'): Promise<string> {
    try {
      const logs = await this.getAuditLogs(options)
      
      if (format === 'csv') {
        return this.convertToCSV(logs.entries, this.getAuditLogHeaders())
      } else {
        return JSON.stringify(logs, null, 2)
      }
    } catch (error) {
      console.error('Failed to export audit logs:', error)
      throw new Error(`Failed to export audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Export security alerts
   */
  async exportSecurityAlerts(options: SecurityAlertQueryOptions, format: 'csv' | 'json'): Promise<string> {
    try {
      const alerts = await this.getSecurityAlerts(options)
      
      if (format === 'csv') {
        return this.convertToCSV(alerts.alerts, this.getSecurityAlertHeaders())
      } else {
        return JSON.stringify(alerts, null, 2)
      }
    } catch (error) {
      console.error('Failed to export security alerts:', error)
      throw new Error(`Failed to export security alerts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Export error logs
   */
  async exportErrorLogs(options: ErrorLogQueryOptions, format: 'csv' | 'json'): Promise<string> {
    try {
      const errors = await this.getErrorLogs(options)
      
      if (format === 'csv') {
        return this.convertToCSV(errors.errors, this.getErrorLogHeaders())
      } else {
        return JSON.stringify(errors, null, 2)
      }
    } catch (error) {
      console.error('Failed to export error logs:', error)
      throw new Error(`Failed to export error logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Archive old logs
   */
  async archiveLogs(beforeDate: Date): Promise<number> {
    try {
      const cutoffTimestamp = Timestamp.fromDate(beforeDate)
      
      // Archive audit logs
      const auditArchiveCount = await this.archiveCollection(
        this.collections.auditLogs, 
        this.collections.archivedLogs,
        cutoffTimestamp
      )
      
      // Archive security alerts
      const securityArchiveCount = await this.archiveCollection(
        this.collections.securityAlerts,
        this.collections.archivedLogs,
        cutoffTimestamp
      )
      
      // Archive error logs
      const errorArchiveCount = await this.archiveCollection(
        this.collections.errorLogs,
        this.collections.archivedLogs,
        cutoffTimestamp
      )
      
      return auditArchiveCount + securityArchiveCount + errorArchiveCount
    } catch (error) {
      console.error('Failed to archive logs:', error)
      throw new Error(`Failed to archive logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete old logs
   */
  async deleteLogs(beforeDate: Date): Promise<number> {
    try {
      const cutoffTimestamp = Timestamp.fromDate(beforeDate)
      
      // Delete from archived logs
      const archivedQuery = query(
        collection(db, this.collections.archivedLogs),
        where('timestamp', '<', cutoffTimestamp)
      )
      
      const archivedSnapshot = await getDocs(archivedQuery)
      
      const batch = writeBatch(db)
      archivedSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      
      return archivedSnapshot.docs.length
    } catch (error) {
      console.error('Failed to delete logs:', error)
      throw new Error(`Failed to delete logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private isTimestamp(value: any): value is Timestamp {
    return value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function'
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    
    this.flushTimer = setInterval(() => {
      this.flushBuffer()
    }, this.flushInterval)
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return

    const batch = writeBatch(db)
    const currentBuffer = [...this.logBuffer]
    this.logBuffer = []

    try {
      currentBuffer.forEach(logItem => {
        if (logItem.type === 'audit') {
          batch.set(doc(collection(db, logItem.collection)), logItem.data)
        } else if (logItem.type === 'error') {
          batch.set(doc(collection(db, logItem.collection)), logItem.data)
        } else if (logItem.type === 'security') {
          batch.set(doc(collection(db, logItem.collection)), logItem.data)
        }
      })
      
      await batch.commit()
    } catch (error) {
      console.error('Failed to flush log buffer:', error)
      // Re-add failed items to buffer
      this.logBuffer.unshift(...currentBuffer)
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  private getInstanceId(): string {
    return 'admin-panel-' + (process.env.NODE_ENV || 'dev')
  }

  private getRetentionCategory(action: AuditAction): string {
    if (action.startsWith('create_user') || action.startsWith('delete_user') || action.startsWith('assign_role')) {
      return 'user_management'
    }
    if (action.startsWith('create_article') || action.startsWith('delete_article') || action.startsWith('publish_article')) {
      return 'content_management'
    }
    if (action.startsWith('system_config') || action.startsWith('permission_change')) {
      return 'system_administration'
    }
    if (action.startsWith('security_') || action.startsWith('suspicious_')) {
      return 'security'
    }
    return 'general'
  }

  private getRetentionPeriod(action: AuditAction): string {
    if (this.getRetentionCategory(action) === 'user_management') {
      return '3 years'
    }
    if (this.getRetentionCategory(action) === 'content_management') {
      return '2 years'
    }
    if (this.getRetentionCategory(action) === 'system_administration') {
      return '1 year'
    }
    if (this.getRetentionCategory(action) === 'security') {
      return '7 years'
    }
    return '1 year'
  }

  private generateAuditSummary(entries: AuditLogEntry[]) {
    const totalActions = entries.length
    const successCount = entries.filter(e => e.status === 'success').length
    const errorCount = entries.filter(e => e.status === 'failure').length
    
    const actionCounts = entries.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1
      return acc
    }, {} as Record<AuditAction, number>)
    
    const topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action: action as AuditAction, count }))
    
    const actorCounts = entries.reduce((acc, entry) => {
      const key = `${entry.actor.userId}-${entry.actor.userEmail}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topActors = Object.entries(actorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => {
        const [userId, userEmail] = key.split('-')
        return { userId, userEmail, count }
      })

    return {
      totalActions,
      successRate: totalActions > 0 ? (successCount / totalActions) * 100 : 0,
      errorRate: totalActions > 0 ? (errorCount / totalActions) * 100 : 0,
      topActions,
      topActors,
      timeRange: {
        start: entries.length > 0 && this.isTimestamp(entries[0].timestamp) ? (entries[0].timestamp as Timestamp).toDate().toISOString() : '',
        end: entries.length > 0 && this.isTimestamp(entries[entries.length - 1].timestamp) ? (entries[entries.length - 1].timestamp as Timestamp).toDate().toISOString() : ''
      }
    }
  }

  private generateSecuritySummary(alerts: SecurityAlert[]) {
    const totalAlerts = alerts.length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    const highAlerts = alerts.filter(a => a.severity === 'high').length
    const mediumAlerts = alerts.filter(a => a.severity === 'medium').length
    const lowAlerts = alerts.filter(a => a.severity === 'low').length
    const activeAlerts = alerts.filter(a => a.status === 'active').length
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length
    
    const typeCounts = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {} as Record<SecurityAlertType, number>)
    
    const topTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type: type as SecurityAlertType, count }))
    
    const sourceCounts = alerts.reduce((acc, alert) => {
      acc[alert.detection.source] = (acc[alert.detection.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topSources = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }))

    return {
      totalAlerts,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      activeAlerts,
      resolvedAlerts,
      topTypes,
      topSources,
      timeRange: {
        start: alerts.length > 0 && this.isTimestamp(alerts[0].timestamp) ? (alerts[0].timestamp as Timestamp).toDate().toISOString() : '',
        end: alerts.length > 0 && this.isTimestamp(alerts[alerts.length - 1].timestamp) ? (alerts[alerts.length - 1].timestamp as Timestamp).toDate().toISOString() : ''
      }
    }
  }

  private generateErrorSummary(errors: ErrorLogEntry[]) {
    const totalErrors = errors.length
    const criticalErrors = errors.filter(e => e.impact.severity === 'critical').length
    const systemErrors = errors.filter(e => e.error.type === 'system').length
    const userErrors = errors.filter(e => e.error.type === 'user').length
    const resolvedErrors = errors.filter(e => e.resolution?.resolved).length
    const unresolvedErrors = totalErrors - resolvedErrors
    
    const typeCounts = errors.reduce((acc, error) => {
      acc[error.error.name] = (acc[error.error.name] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topErrorTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }))
    
    const endpointCounts = errors.reduce((acc, error) => {
      const endpoint = error.context?.apiEndpoint || 'unknown'
      acc[endpoint] = (acc[endpoint] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topEndpoints = Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }))

    return {
      totalErrors,
      criticalErrors,
      systemErrors,
      userErrors,
      resolvedErrors,
      unresolvedErrors,
      topErrorTypes,
      topEndpoints,
      timeRange: {
        start: errors.length > 0 && this.isTimestamp(errors[0].timestamp) ? (errors[0].timestamp as Timestamp).toDate().toISOString() : '',
        end: errors.length > 0 && this.isTimestamp(errors[errors.length - 1].timestamp) ? (errors[errors.length - 1].timestamp as Timestamp).toDate().toISOString() : ''
      }
    }
  }

  private matchesSearchQuery(item: any, query: string): boolean {
    const searchLower = query.toLowerCase()
    const itemString = JSON.stringify(item).toLowerCase()
    return itemString.includes(searchLower)
  }

  private convertToCSV(data: any[], headers: string[]): string {
    const csvRows = [headers.join(',')]
    
    data.forEach(item => {
      const row = headers.map(header => {
        const value = this.getNestedValue(item, header)
        return this.escapeCSVValue(value)
      })
      csvRows.push(row.join(','))
    })
    
    return csvRows.join('\n')
  }

  private getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : ''
    }, obj)
  }

  private escapeCSVValue(value: string): string {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  private getAuditLogHeaders(): string[] {
    return [
      'timestamp',
      'level',
      'status',
      'actor.userId',
      'actor.userEmail',
      'actor.userRole',
      'action',
      'actionDescription',
      'resourceType',
      'resourceId',
      'resourceName',
      'context.ipAddress',
      'context.userAgent',
      'details.reason',
      'details.oldValue',
      'details.newValue'
    ]
  }

  private getSecurityAlertHeaders(): string[] {
    return [
      'timestamp',
      'type',
      'severity',
      'title',
      'description',
      'detection.rule',
      'detection.source',
      'detection.confidence',
      'actor.userId',
      'actor.userEmail',
      'target.resourceType',
      'target.resourceId',
      'context.ipAddress',
      'status',
      'occurrenceCount'
    ]
  }

  private getErrorLogHeaders(): string[] {
    return [
      'timestamp',
      'level',
      'error.name',
      'error.message',
      'error.type',
      'context.userId',
      'context.apiEndpoint',
      'context.ipAddress',
      'impact.severity',
      'impact.userAffected',
      'resolution.resolved'
    ]
  }

  private async archiveCollection(
    sourceCollection: string,
    targetCollection: string,
    cutoffTimestamp: Timestamp
  ): Promise<number> {
    const querySnapshot = await getDocs(
      query(
        collection(db, sourceCollection),
        where('timestamp', '<', cutoffTimestamp)
      )
    )

    const batch = writeBatch(db)
    querySnapshot.docs.forEach(documentSnapshot => {
      const data = documentSnapshot.data()
      batch.set(doc(collection(db, targetCollection)), {
        ...data,
        compliance: {
          ...data.compliance,
          archived: true,
          archivedAt: serverTimestamp()
        }
      });
      batch.delete(documentSnapshot.ref);
    })

    await batch.commit()
    return querySnapshot.docs.length
  }
}

// Export singleton instance
export const auditLogService = new AuditLogServiceClass()
