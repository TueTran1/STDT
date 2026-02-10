/**
 * Runtime Assertions for Admin System
 * 
 * Provides defensive programming utilities to prevent runtime errors
 * and ensure data integrity throughout the admin interface
 */

/**
 * Asserts that a value is not null or undefined
 */
export function assertNonNull<T>(
  value: T | null | undefined,
  message: string = 'Value cannot be null or undefined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

/**
 * Asserts that a string is not empty
 */
export function assertNonEmpty(
  value: string,
  message: string = 'String cannot be empty'
): asserts value is string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

/**
 * Asserts that a value is of the expected type
 */
export function assertType<T>(
  value: unknown,
  typeCheck: (value: unknown) => value is T,
  message: string = 'Value is of unexpected type'
): asserts value is T {
  if (!typeCheck(value)) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

/**
 * Asserts that a user has the required permissions
 */
export function assertPermission(
  permissions: string[],
  requiredPermission: string,
  message: string = `Missing required permission: ${requiredPermission}`
): void {
  if (!permissions.includes(requiredPermission)) {
    throw new Error(`Permission assertion failed: ${message}`)
  }
}

/**
 * Asserts that a user is not trying to modify themselves
 */
export function assertNotSelfModification(
  currentUserId: string,
  targetUserId: string,
  message: string = 'Users cannot modify their own accounts'
): void {
  if (currentUserId === targetUserId) {
    throw new Error(`Self-modification assertion failed: ${message}`)
  }
}

/**
 * Asserts that an admin user is not being deleted
 */
export function assertNotAdminDeletion(
  targetUserRole: string,
  message: string = 'Admin users cannot be deleted'
): void {
  if (targetUserRole === 'admin') {
    throw new Error(`Admin deletion assertion failed: ${message}`)
  }
}

/**
 * Asserts that an email is valid
 */
export function assertValidEmail(
  email: string,
  message: string = 'Invalid email format'
): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error(`Email assertion failed: ${message}`)
  }
}

/**
 * Asserts that a value is within the allowed range
 */
export function assertRange(
  value: number,
  min: number,
  max: number,
  message: string = `Value must be between ${min} and ${max}`
): void {
  if (value < min || value > max) {
    throw new Error(`Range assertion failed: ${message}`)
  }
}

/**
 * Asserts that an array contains expected elements
 */
export function assertArrayContains<T>(
  array: T[],
  expectedItem: T,
  message: string = 'Array does not contain expected item'
): void {
  if (!array.includes(expectedItem)) {
    throw new Error(`Array assertion failed: ${message}`)
  }
}

/**
 * Asserts that an object has required properties
 */
export function assertHasProperties<T extends Record<string, any>>(
  obj: T,
  requiredProperties: (keyof T)[],
  message: string = 'Object is missing required properties'
): void {
  const missingProperties = requiredProperties.filter(prop => !(prop in obj))
  if (missingProperties.length > 0) {
    throw new Error(`Property assertion failed: ${message}. Missing: ${missingProperties.join(', ')}`)
  }
}

/**
 * Asserts that a URL is valid
 */
export function assertValidUrl(
  url: string,
  message: string = 'Invalid URL format'
): void {
  try {
    new URL(url)
  } catch {
    throw new Error(`URL assertion failed: ${message}`)
  }
}

/**
 * Asserts that a timestamp is valid
 */
export function assertValidTimestamp(
  timestamp: any,
  message: string = 'Invalid timestamp'
): void {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    throw new Error(`Timestamp assertion failed: ${message}`)
  }
}

/**
 * Asserts that a role is valid
 */
export function assertValidRole(
  role: string,
  validRoles: string[],
  message: string = 'Invalid user role'
): void {
  if (!validRoles.includes(role)) {
    throw new Error(`Role assertion failed: ${message}. Valid roles: ${validRoles.join(', ')}`)
  }
}

/**
 * Asserts that a status is valid
 */
export function assertValidStatus(
  status: string,
  validStatuses: string[],
  message: string = 'Invalid status'
): void {
  if (!validStatuses.includes(status)) {
    throw new Error(`Status assertion failed: ${message}. Valid statuses: ${validStatuses.join(', ')}`)
  }
}

/**
 * Asserts that a pagination is valid
 */
export function assertValidPagination(
  page: number,
  limit: number,
  maxLimit: number = 100,
  message: string = 'Invalid pagination parameters'
): void {
  if (page < 1) {
    throw new Error(`Pagination assertion failed: ${message}. Page must be >= 1`)
  }
  if (limit < 1 || limit > maxLimit) {
    throw new Error(`Pagination assertion failed: ${message}. Limit must be between 1 and ${maxLimit}`)
  }
}

/**
 * Asserts that a sort direction is valid
 */
export function assertValidSortDirection(
  direction: string,
  message: string = 'Invalid sort direction'
): void {
  if (!['asc', 'desc'].includes(direction)) {
    throw new Error(`Sort direction assertion failed: ${message}. Must be 'asc' or 'desc'`)
  }
}

/**
 * Asserts that a file size is within limits
 */
export function assertFileSize(
  fileSize: number,
  maxSize: number,
  message: string = 'File size exceeds limit'
): void {
  if (fileSize > maxSize) {
    throw new Error(`File size assertion failed: ${message}. Max size: ${maxSize} bytes`)
  }
}

/**
 * Asserts that a file type is allowed
 */
export function assertFileType(
  fileType: string,
  allowedTypes: string[],
  message: string = 'File type not allowed'
): void {
  if (!allowedTypes.includes(fileType)) {
    throw new Error(`File type assertion failed: ${message}. Allowed types: ${allowedTypes.join(', ')}`)
  }
}

/**
 * Asserts that a date is not in the past (for future events)
 */
export function assertNotPastDate(
  date: Date,
  message: string = 'Date cannot be in the past'
): void {
  if (date < new Date()) {
    throw new Error(`Date assertion failed: ${message}`)
  }
}

/**
 * Asserts that a date is not in the future (for past events)
 */
export function assertNotFutureDate(
  date: Date,
  message: string = 'Date cannot be in the future'
): void {
  if (date > new Date()) {
    throw new Error(`Date assertion failed: ${message}`)
  }
}

/**
 * Asserts that a string length is within bounds
 */
export function assertStringLength(
  str: string,
  minLength: number,
  maxLength: number,
  message: string = 'String length out of bounds'
): void {
  if (str.length < minLength || str.length > maxLength) {
    throw new Error(`String length assertion failed: ${message}. Length must be between ${minLength} and ${maxLength}`)
  }
}

/**
 * Asserts that a numeric ID is valid
 */
export function assertValidId(
  id: string,
  message: string = 'Invalid ID format'
): void {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new Error(`ID assertion failed: ${message}`)
  }
  
  // Check for common ID patterns (UUID, ObjectId, etc.)
  const idPatterns = [
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i, // UUID
    /^[a-f0-9]{24}$/, // MongoDB ObjectId
    /^[a-zA-Z0-9_-]+$/, // Alphanumeric with underscore and dash
  ]
  
  const isValidId = idPatterns.some(pattern => pattern.test(id))
  if (!isValidId) {
    throw new Error(`ID assertion failed: ${message}. ID must match a valid pattern`)
  }
}

/**
 * Asserts that a batch operation is within limits
 */
export function assertBatchSize(
  batchSize: number,
  maxBatchSize: number,
  message: string = 'Batch size exceeds limit'
): void {
  if (batchSize > maxBatchSize) {
    throw new Error(`Batch size assertion failed: ${message}. Max batch size: ${maxBatchSize}`)
  }
}

/**
 * Asserts that a cooldown period has passed
 */
export function assertCooldownPassed(
  lastAction: Date,
  cooldownMs: number,
  message: string = 'Cooldown period has not passed'
): void {
  const timeSinceLastAction = Date.now() - lastAction.getTime()
  if (timeSinceLastAction < cooldownMs) {
    const remainingTime = Math.ceil((cooldownMs - timeSinceLastAction) / 1000)
    throw new Error(`Cooldown assertion failed: ${message}. Please wait ${remainingTime} seconds`)
  }
}

/**
 * Asserts that a user is active
 */
export function assertUserActive(
  user: { isActive: boolean },
  message: string = 'User account is not active'
): void {
  if (!user.isActive) {
    throw new Error(`User activity assertion failed: ${message}`)
  }
}

/**
 * Asserts that a resource exists
 */
export function assertResourceExists(
  resource: any,
  resourceName: string,
  message: string = 'Resource does not exist'
): void {
  if (!resource) {
    throw new Error(`Resource existence assertion failed: ${resourceName} - ${message}`)
  }
}
