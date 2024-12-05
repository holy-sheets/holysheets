import {
  BatchOperationResult,
  OperationResult
} from '@/services/metadata/IMetadataService'
import {
  SanitizedOperationResult,
  SanitizedBatchOperationResult
} from '@/services/metadata/IMetadataService'

/**
 * Sanitizes an OperationResult by removing 'row' and 'range' keys.
 * Also removes 'metadata' if it's undefined.
 *
 * @param result - The original OperationResult.
 * @returns A SanitizedOperationResult without 'row' and 'range'.
 */
export function sanitizeOperationResult<T>(
  result: OperationResult<T>
): SanitizedOperationResult<T> {
  const { data, metadata } = result
  const sanitized: SanitizedOperationResult<T> = { data }

  if (metadata !== undefined) {
    sanitized.metadata = metadata
  }

  return sanitized
}

/**
 * Sanitizes a BatchOperationResult by removing 'rows' and 'ranges' keys.
 * Also removes 'metadata' if it's undefined.
 *
 * @param result - The original BatchOperationResult.
 * @returns A SanitizedBatchOperationResult without 'rows' and 'ranges'.
 */
export function sanitizeBatchOperationResult<T>(
  result: BatchOperationResult<T>
): SanitizedBatchOperationResult<T> {
  const { data, metadata } = result
  const sanitized: SanitizedBatchOperationResult<T> = { data }

  if (metadata !== undefined) {
    sanitized.metadata = metadata
  }

  return sanitized
}
