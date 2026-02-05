import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { handleApiError, ErrorInfo } from '../../utils/errorHandler'
import './ErrorBoundary.css'

interface ErrorBoundaryState {
  hasError: boolean
  error: ErrorInfo | null
  errorId: string
}

/**
 * ErrorBoundary Component
 * 
 * PURPOSE: Catch React errors and display military-themed error pages
 * 
 * FEATURES:
 * - Catches all React rendering errors
 * - Provides recovery options
 * - Maintains military theme
 * - Logs errors for debugging
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorInfo = handleApiError(error)
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error: errorInfo,
      errorId
    }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Log error for debugging
    
    // You could also send this to an error reporting service
    // reportError(error, errorInfo, this.state.errorId)
  }

  handleRetry = () => {
    // Clear error state and retry
    this.setState({
      hasError: false,
      error: null,
      errorId: ''
    })
  }

  handleReload = () => {
    // Hard reload the page
    window.location.reload()
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <AlertTriangle size={64} />
            </div>
            
            <div className="error-content">
              <h1 className="error-title">{this.state.error.title}</h1>
              
              <div className="error-message">
                <p>{this.state.error.message}</p>
                
                {this.state.error.details && (
                  <div className="error-details">
                    <strong>Chi tiết lỗi:</strong>
                    <p>{this.state.error.details}</p>
                  </div>
                )}
              </div>
              
              <div className="error-actions">
                {this.state.error.canRetry && (
                  <button 
                    onClick={this.handleRetry}
                    className="retry-button"
                  >
                    <RefreshCw size={20} />
                    <span>Thử lại</span>
                  </button>
                )}
                
                <button 
                  onClick={this.handleReload}
                  className="reload-button"
                >
                  <RefreshCw size={20} />
                  <span>Tải lại trang</span>
                </button>
              </div>
              
              {this.state.error.action && (
                <div className="error-action-hint">
                  <strong>Đề xuất:</strong> {this.state.error.action}
                </div>
              )}
              
              <div className="error-support">
                <p>
                  Nếu lỗi vẫn tiếp diễn ra, vui lòng liên hệ:
                </p>
                <div className="support-info">
                  <p><strong>Bộ phận kỹ thuật:</strong></p>
                  <p>Email: kythuat@ludoan83.vn</p>
                  <p>Điện thoại: (024) 1234 5678</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
