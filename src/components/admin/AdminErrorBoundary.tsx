import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { auditLogService } from '../../services/auditLogService'

interface AdminErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface AdminErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

/**
 * AdminErrorBoundary Component
 * 
 * Catches and handles errors in admin components with proper logging
 * and user-friendly error display
 */
export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.generateErrorId()
    
    this.setState({
      error,
      errorInfo,
      errorId
    })

    // Log the error to audit service
    this.logError(error, errorInfo, errorId)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to console for debugging
    console.error('Admin Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId,
      timestamp: new Date().toISOString()
    })
  }

  private async logError(error: Error, errorInfo: ErrorInfo, errorId: string): Promise<void> {
    try {
      await auditLogService.logError({
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          type: 'system',
          code: 'ADMIN_COMPONENT_ERROR'
        },
        level: 'error' as const,
        context: {
          sessionId: this.generateSessionId(),
          requestId: this.generateRequestId(),
          userAgent: navigator.userAgent
        },
        system: {
          version: '1.0.0',
          environment: 'production',
          service: 'admin-panel',
          instance: 'admin-error-boundary'
        },
        impact: {
          userAffected: true,
          systemAffected: false,
          dataAffected: false,
          severity: 'high'
        }
      })
    } catch (logError) {
      console.error('Failed to log admin error:', logError)
      console.error('Failed to log error to audit service:', logError)
    }
  }

  private generateSessionId(): string {
    return `admin_session_${Date.now()}`
  }

  private generateRequestId(): string {
    return `admin_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateErrorId(): string {
    return `admin_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  private handleGoHome = () => {
    window.location.href = '/admin'
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Admin System Error
              </h1>
              
              <p className="text-gray-600 mb-4">
                Something went wrong in the admin interface. Our team has been notified.
              </p>

              {this.state.errorId && (
                <div className="bg-gray-100 rounded p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Error ID:</p>
                  <p className="text-xs font-mono text-gray-700">{this.state.errorId}</p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-xs text-red-800 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>

                  <button
                    onClick={this.handleReload}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  If this problem persists, please contact your system administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * AdminErrorFallback Component
 * 
 * Standard fallback component for admin errors
 */
export const AdminErrorFallback: React.FC<{ 
  title?: string
  message?: string
  onRetry?: () => void
  onGoHome?: () => void
}> = ({ 
  title = 'Admin System Error',
  message = 'Something went wrong in the admin interface.',
  onRetry,
  onGoHome
}) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    } else {
      window.location.href = '/admin'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h1>
          
          <p className="text-gray-600 mb-4">
            {message}
          </p>

          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            )}

            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              If this problem persists, please contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * AdminRouteErrorBoundary Component
 * 
 * Specialized error boundary for admin routes
 */
export const AdminRouteErrorBoundary: React.FC<{
  children: ReactNode
  routeName: string
}> = ({ children, routeName }) => {
  return (
    <AdminErrorBoundary
      onError={(error, errorInfo) => {
        // Additional route-specific error handling
        console.error(`Error in admin route: ${routeName}`, { error, errorInfo })
      }}
    >
      {children}
    </AdminErrorBoundary>
  )
}

/**
 * withAdminErrorBoundary HOC
 * 
 * Higher-order component to wrap admin components with error boundary
 */
export function withAdminErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
  }
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <AdminErrorBoundary {...options}>
        <Component {...props} />
      </AdminErrorBoundary>
    )
  }
}
