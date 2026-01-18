/**
 * CENTRALIZED ERROR HANDLING UTILITY
 * 
 * Provides consistent error handling and user messaging
 * for all CRUD operations in the military editorial system
 */

export type ErrorType = 
  | 'network'
  | 'permission'
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'timeout'
  | 'server_error'
  | 'auth_error'
  | 'unknown'

export interface ErrorInfo {
  type: ErrorType
  title: string
  message: string
  details?: string
  action?: string
  canRetry?: boolean
  userFriendly?: boolean
}

/**
 * VIETNAMESE ERROR MESSAGES
 * 
 * Formal, calm, professional messaging for military users
 */
const ERROR_MESSAGES: Record<ErrorType, Omit<ErrorInfo, 'type'>> = {
  network: {
    title: 'Lỗi kết nối mạng',
    message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
    action: 'Kiểm tra kết nối mạng và thử lại',
    canRetry: true,
    userFriendly: true
  },
  
  permission: {
    title: 'Lỗi quyền truy cập',
    message: 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.',
    action: 'Liên hệ quản trị viên',
    canRetry: false,
    userFriendly: true
  },
  
  validation: {
    title: 'Lỗi xác thực dữ liệu',
    message: 'Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại các thông tin bắt buộc.',
    action: 'Kiểm tra lại các thông tin',
    canRetry: false,
    userFriendly: true
  },
  
  not_found: {
    title: 'Không tìm thấy',
    message: 'Bài viết hoặc tài nguyên bạn tìm kiếm không tồn tại hoặc đã bị xóa.',
    action: 'Quay lại danh sách',
    canRetry: false,
    userFriendly: true
  },
  
  conflict: {
    title: 'Xung đột dữ liệu',
    message: 'Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang và thử lại.',
    action: 'Tải lại trang',
    canRetry: true,
    userFriendly: true
  },
  
  timeout: {
    title: 'Hết thời gian chờ',
    message: 'Thao tác mất quá nhiều thời gian. Vui lòng thử lại với kết nối tốt hơn.',
    action: 'Thử lại',
    canRetry: true,
    userFriendly: true
  },
  
  server_error: {
    title: 'Lỗi máy chủ',
    message: 'Đã xảy ra lỗi từ phía máy chủ. Vui lòng thử lại sau hoặc liên hệ bộ phận kỹ thuật.',
    action: 'Thử lại sau hoặc liên hệ bộ phận kỹ thuật',
    canRetry: true,
    userFriendly: true
  },
  
  auth_error: {
    title: 'Lỗi xác thực',
    message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
    action: 'Đăng nhập lại',
    canRetry: true,
    userFriendly: true
  },
  
  unknown: {
    title: 'Lỗi không xác định',
    message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ bộ phận kỹ thuật.',
    action: 'Thử lại hoặc liên hệ bộ phận kỹ thuật',
    canRetry: true,
    userFriendly: true
  }
}

/**
 * Get error information by type
 */
export const getErrorInfo = (type: ErrorType, customMessage?: string): ErrorInfo => {
  const baseError = ERROR_MESSAGES[type]
  
  return {
    type,
    ...baseError,
    message: customMessage || baseError.message
  }
}

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: any): ErrorInfo => {
  // Network errors
  if (error.code === 'unavailable' || error.code === 'timeout') {
    return getErrorInfo('timeout')
  }
  
  // Permission errors
  if (error.message?.includes('permission-denied') || error.message?.includes('PERMISSION_DENIED')) {
    return getErrorInfo('permission')
  }
  
  // Authentication errors
  if (error.code?.startsWith('auth/') || error.message?.includes('authentication')) {
    return getErrorInfo('auth_error')
  }
  
  // Not found errors
  if (error.code === 'not-found' || error.message?.includes('not found')) {
    return getErrorInfo('not_found')
  }
  
  // Conflict errors
  if (error.code === 'conflict' || error.message?.includes('conflict')) {
    return getErrorInfo('conflict')
  }
  
  // Server errors
  if (error.code >= 500) {
    return getErrorInfo('server_error')
  }
  
  // Default to unknown error
  return getErrorInfo('unknown', error.message)
}

/**
 * Check if error is user-friendly (show to users) vs system (log only)
 */
export const isUserFriendlyError = (error: ErrorInfo): boolean => {
  return error.userFriendly !== false
}
