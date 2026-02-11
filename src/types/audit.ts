/**
 * Audit and Logging Types
 * 
 * Types for comprehensive audit logging, security monitoring, and compliance
 */

// ============================================================================
// CORE AUDIT TYPES
// ============================================================================

export type AuditAction = 
  | 'create_user'
  | 'update_user'
  | 'deactivate_user'
  | 'delete_user'
  | 'assign_role'
  | 'remove_role'
  | 'reset_password'
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'create_article'
  | 'update_article'
  | 'delete_article'
  | 'publish_article'
  | 'unpublish_article'
  | 'bulk_delete_articles'
  | 'view_content'
  | 'export_data'
  | 'import_data'
  | 'system_config_change'
  | 'permission_change'
  | 'security_violation'
  | 'suspicious_activity'
  | 'system_error'
  | 'api_access'
  | 'data_backup'
  | 'data_restore'

export type ResourceType = 
  | 'user'
  | 'article'
  | 'content'
  | 'system'
  | 'config'
  | 'permission'
  | 'session'
  | 'api_key'
  | 'backup'
  | 'log'
  | 'security_event'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'
export type AuditStatus = 'success' | 'failure' | 'pending' | 'cancelled'

// ============================================================================
// AUDIT LOG ENTRY
// ============================================================================

export interface AuditLogEntry {
  id: string
  timestamp: import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue
  level: LogLevel
  status: AuditStatus
  
  // Actor Information
  actor: {
    userId: string
    userEmail: string
    userRole: string
    userDisplayName: string
  }
  
  // Action Information
  action: AuditAction
  actionDescription: string
  
  // Target Information
  resourceType: ResourceType
  resourceId?: string
  resourceName?: string
  
  // Context Information
  context: {
    ipAddress?: string
    userAgent?: string
    sessionId?: string
    requestId?: string
    apiEndpoint?: string
    httpMethod?: string
    httpStatus?: number
    responseTime?: number
  }
  
  // Details
  details: {
    reason?: string
    oldValue?: any
    newValue?: any
    metadata?: Record<string, any>
    error?: {
      code: string
      message: string
      stack?: string
    }
    warnings?: string[]
  }
  
  // System Information
  system: {
    version: string
    environment: string
    service: string
    instance: string
  }
  
  // Compliance Information
  compliance: {
    retentionCategory: string
    retentionPeriod: string
    archived: boolean
    archivedAt?: import('firebase/firestore').Timestamp
    deletedAt?: import('firebase/firestore').Timestamp
  }
}

// ============================================================================
// SECURITY ALERT TYPES
// ============================================================================

export type SecurityAlertType =
  | 'brute_force_attack'
  | 'unusual_access_pattern'
  | 'privilege_escalation'
  | 'data_exfiltration'
  | 'malicious_request'
  | 'failed_authentication'
  | 'suspicious_ip'
  | 'account_takeover'
  | 'policy_violation'
  | 'system_compromise'

export type SecurityAlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface SecurityAlert {
  id: string
  type: SecurityAlertType
  severity: SecurityAlertSeverity
  title: string
  description: string
  timestamp: import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue
  
  // Detection Information
  detection: {
    rule: string
    source: string
    confidence: number // 0-100
    firstDetected: import('firebase/firestore').Timestamp
    lastDetected: import('firebase/firestore').Timestamp
    occurrenceCount: number
  }
  
  // Actor Information
  actor?: {
    userId: string
    userEmail: string
    ipAddress: string
    userAgent: string
  }
  
  // Target Information
  target: {
    resourceType: ResourceType
    resourceId?: string
    resourceName?: string
    endpoint?: string
    method?: string
  }
  
  // Context
  context: {
    ipAddress: string
    userAgent: string
    sessionId?: string
    requestId?: string
    geoLocation?: {
      country: string
      region: string
      city: string
    }
  }
  
  // Status
  status: 'active' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
  resolvedAt?: import('firebase/firestore').Timestamp
  resolution?: string
  
  // Actions Taken
  actions: Array<{
    type: 'block_ip' | 'lock_account' | 'notify_admin' | 'escalate' | 'log_event'
    timestamp: import('firebase/firestore').Timestamp
    performedBy: string
    details: string
  }>
  
  // Metadata
  metadata: Record<string, any>
}

// ============================================================================
// ERROR LOG TYPES
// ============================================================================

export interface ErrorLogEntry {
  id: string
  timestamp: import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue
  level: LogLevel
  
  // Error Information
  error: {
    name: string
    message: string
    stack?: string
    code?: string
    type: 'system' | 'user' | 'network' | 'database' | 'security' | 'business'
  }
  
  // Context Information
  context: {
    userId?: string
    sessionId?: string
    requestId?: string
    apiEndpoint?: string
    httpMethod?: string
    httpStatus?: number
    userAgent?: string
    ipAddress?: string
  }
  
  // Request Information
  request?: {
    url: string
    method: string
    headers: Record<string, string>
    body?: any
    query?: Record<string, string>
    params?: Record<string, string>
  }
  
  // System Information
  system: {
    service: string
    version: string
    environment: string
    instance: string
    memoryUsage?: number
    cpuUsage?: number
  }
  
  // Impact Assessment
  impact: {
    userAffected: boolean
    systemAffected: boolean
    dataAffected: boolean
    severity: 'low' | 'medium' | 'high' | 'critical'
    estimatedUsers?: number
  }
  
  // Resolution
  resolution?: {
    resolved: boolean
    resolvedAt?: import('firebase/firestore').Timestamp
    resolvedBy?: string
    resolutionMethod: string
    preventionMeasures?: string[]
  }
}

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface AuditQueryOptions {
  // Time Range
  startDate?: import('firebase/firestore').Timestamp
  endDate?: import('firebase/firestore').Timestamp
  
  // Actor Filters
  actorUserId?: string
  actorRole?: string
  actorEmail?: string
  
  // Action Filters
  actions?: AuditAction[]
  actionCategories?: string[]
  
  // Resource Filters
  resourceType?: ResourceType
  resourceId?: string
  
  // Status & Level Filters
  status?: AuditStatus
  level?: LogLevel
  
  // Context Filters
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  
  // Pagination
  limit?: number
  offset?: import('firebase/firestore').Timestamp
  sortBy?: 'timestamp' | 'level' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface SecurityAlertQueryOptions {
  // Time Range
  startDate?: import('firebase/firestore').Timestamp
  endDate?: import('firebase/firestore').Timestamp
  
  // Alert Filters
  types?: SecurityAlertType[]
  severity?: SecurityAlertSeverity[]
  status?: SecurityAlert['status'][]
  
  // Actor Filters
  actorUserId?: string
  actorEmail?: string
  ipAddress?: string
  
  // Target Filters
  resourceType?: ResourceType
  resourceId?: string
  
  // Detection Filters
  source?: string
  confidence?: {
    min?: number
    max?: number
  }
  
  // Pagination
  limit?: number
  offset?: number
  sortBy?: 'timestamp' | 'severity' | 'occurrenceCount'
  sortOrder?: 'asc' | 'desc'
}

export interface ErrorLogQueryOptions {
  // Time Range
  startDate?: import('firebase/firestore').Timestamp
  endDate?: import('firebase/firestore').Timestamp
  
  // Error Filters
  errorTypes?: string[]
  errorCategories?: ErrorLogEntry['error']['type'][]
  severity?: ErrorLogEntry['impact']['severity'][]
  
  // Context Filters
  userId?: string
  sessionId?: string
  apiEndpoint?: string
  ipAddress?: string
  
  // Status Filters
  resolved?: boolean
  
  // Pagination
  limit?: number
  offset?: number
  sortBy?: 'timestamp' | 'level' | 'impact.severity'
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface AuditLogResult {
  entries: AuditLogEntry[]
  totalCount: number
  hasMore: boolean
  cursor?: import('firebase/firestore').Timestamp
  summary: {
    totalActions: number
    successRate: number
    errorRate: number
    topActions: Array<{ action: AuditAction; count: number }>
    topActors: Array<{ userId: string; userEmail: string; count: number }>
    timeRange: { start: string; end: string }
  }
}

export interface SecurityAlertResult {
  alerts: SecurityAlert[]
  totalCount: number
  hasMore: boolean
  summary: {
    totalAlerts: number
    criticalAlerts: number
    highAlerts: number
    mediumAlerts: number
    lowAlerts: number
    activeAlerts: number
    resolvedAlerts: number
    topTypes: Array<{ type: SecurityAlertType; count: number }>
    topSources: Array<{ source: string; count: number }>
    timeRange: { start: string; end: string }
  }
}

export interface ErrorLogResult {
  errors: ErrorLogEntry[]
  totalCount: number
  hasMore: boolean
  summary: {
    totalErrors: number
    criticalErrors: number
    systemErrors: number
    userErrors: number
    resolvedErrors: number
    unresolvedErrors: number
    topErrorTypes: Array<{ type: string; count: number }>
    topEndpoints: Array<{ endpoint: string; count: number }>
    timeRange: { start: string; end: string }
  }
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface AuditLogService {
  // Logging Operations
  logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string>
  logError(entry: Omit<ErrorLogEntry, 'id' | 'timestamp'>): Promise<string>
  logSecurityAlert(entry: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<string>
  
  // Query Operations
  getAuditLogs(options?: AuditQueryOptions): Promise<AuditLogResult>
  getSecurityAlerts(options?: SecurityAlertQueryOptions): Promise<SecurityAlertResult>
  getErrorLogs(options?: ErrorLogQueryOptions): Promise<ErrorLogResult>
  
  // Search Operations
  searchAuditLogs(query: string, options?: AuditQueryOptions): Promise<AuditLogResult>
  searchSecurityAlerts(query: string, options?: SecurityAlertQueryOptions): Promise<SecurityAlertResult>
  searchErrorLogs(query: string, options?: ErrorLogQueryOptions): Promise<ErrorLogResult>
  
  // Analytics Operations
  getAuditSummary(timeRange: { start: Date; end: Date }): Promise<any>
  getSecurityMetrics(timeRange: { start: Date; end: Date }): Promise<any>
  getErrorMetrics(timeRange: { start: Date; end: Date }): Promise<any>
  
  // Export Operations
  exportAuditLogs(options: AuditQueryOptions, format: 'csv' | 'json'): Promise<string>
  exportSecurityAlerts(options: SecurityAlertQueryOptions, format: 'csv' | 'json'): Promise<string>
  exportErrorLogs(options: ErrorLogQueryOptions, format: 'csv' | 'json'): Promise<string>
  
  // Retention Operations
  archiveLogs(beforeDate: Date): Promise<number>
  deleteLogs(beforeDate: Date): Promise<number>
  getRetentionStats(): Promise<any>
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseAuditLogsResult {
  data: AuditLogResult | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  search: (query: string) => Promise<void>
  filter: (filters: AuditQueryOptions) => Promise<void>
  export: (format: 'csv' | 'json') => Promise<void>
}

export interface UseSecurityAlertsResult {
  data: SecurityAlertResult | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  search: (query: string) => Promise<void>
  filter: (filters: SecurityAlertQueryOptions) => Promise<void>
  acknowledgeAlert: (alertId: string) => Promise<void>
  resolveAlert: (alertId: string, resolution: string) => Promise<void>
  export: (format: 'csv' | 'json') => Promise<void>
}

export interface UseErrorLogsResult {
  data: ErrorLogResult | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  search: (query: string) => Promise<void>
  filter: (filters: ErrorLogQueryOptions) => Promise<void>
  resolveError: (errorId: string, resolution: string) => Promise<void>
  export: (format: 'csv' | 'json') => Promise<void>
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface AuditLogValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  required: string[]
  optional: string[]
}

export interface SecurityAlertValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  severity: SecurityAlertSeverity
  confidence: number
}

export interface ErrorLogValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  impact: ErrorLogEntry['impact']
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AuditConfig {
  logging: {
    level: LogLevel
    enableConsole: boolean
    enableFile: boolean
    enableDatabase: boolean
    batchSize: number
    flushInterval: number
  }
  
  retention: {
    auditLogs: {
      hot: '30 days'
      warm: '1 year'
      cold: '7 years'
      deleteAfter: '7 years'
    }
    securityAlerts: {
      hot: '90 days'
      warm: '2 years'
      cold: '7 years'
      deleteAfter: '7 years'
    }
    errorLogs: {
      hot: '30 days'
      warm: '6 months'
      cold: '1 year'
      deleteAfter: '1 year'
    }
  }
  
  security: {
    enableEncryption: boolean
    enableHashing: boolean
    enableTamperDetection: boolean
    enableBackup: boolean
    backupInterval: number
  }
  
  performance: {
    maxBatchSize: number
    maxConcurrentWrites: number
    timeoutMs: number
    retryAttempts: number
  }
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export interface ComplianceReport {
  period: {
    start: Date
    end: Date
  }
  
  summary: {
    totalLogs: number
    totalActions: number
    totalErrors: number
    totalSecurityAlerts: number
    complianceScore: number
  }
  
  categories: {
    userManagement: {
      totalActions: number
      successRate: number
      violations: number
    }
    contentManagement: {
      totalActions: number
      successRate: number
      violations: number
    }
    systemAdministration: {
      totalActions: number
      successRate: number
      violations: number
    }
    security: {
      totalAlerts: number
      criticalAlerts: number
      resolvedAlerts: number
      responseTime: number
    }
  }
  
  violations: Array<{
    timestamp: import('firebase/firestore').Timestamp
    type: string
    severity: string
    description: string
    actor: string
    action: string
    target: string
  }>
  
  recommendations: Array<{
    category: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    description: string
    action: string
  }>
}
