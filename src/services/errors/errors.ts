import { OperationMetadata } from '@/services/metadata/IMetadataService'

/**
 * OperationError is a custom error class that includes operation metadata.
 */
export class OperationError extends Error {
  public metadata: OperationMetadata

  /**
   * Constructs a new OperationError instance.
   *
   * @param message - A descriptive error message.
   * @param metadata - The metadata associated with the operation that failed.
   */
  constructor(message: string, metadata: OperationMetadata) {
    super(message)
    this.name = 'OperationError'
    this.metadata = metadata

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OperationError)
    }
  }
}

/**
 * NotFoundError is a custom error class indicating that a requested resource was not found.
 */
export class NotFoundError extends OperationError {
  /**
   * Constructs a new NotFoundError instance.
   *
   * @param message - A descriptive error message.
   * @param metadata - The metadata associated with the operation that failed.
   */
  constructor(message: string, metadata: OperationMetadata) {
    super(message, metadata)
    this.name = 'NotFoundError'
  }
}
