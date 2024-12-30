import {
  RawBatchOperationResult,
  RawOperationResult
} from '@/services/metadata/IMetadataService'
import {
  OperationResult,
  BatchOperationResult
} from '@/services/metadata/IMetadataService'

/**
 * Sanitizes an RawOperationResult by removing 'row' and 'range' keys.
 * Also removes 'metadata' if it's undefined.
 *
 * @param result - The original OperationResult.
 * @returns A OperationResult without 'row' and 'range'.
 */
export function sanitizeOperationResult<T>(
  result: RawOperationResult<T>
): OperationResult<T> {
  const { data, metadata } = result
  const sanitized: OperationResult<T> = { data }

  if (metadata !== undefined) {
    sanitized.metadata = metadata
  }

  return sanitized
}

/**
 * Sanitizes a RawBatchOperationResult by removing 'rows' and 'ranges' keys.
 * Also removes 'metadata' if it's undefined.
 *
 * @param result - The original BatchOperationResult.
 * @returns A BatchOperationResult without 'rows' and 'ranges'.
 */
export function sanitizeBatchOperationResult<T>(
  result: RawBatchOperationResult<T>
): BatchOperationResult<T> {
  const { data, metadata } = result
  const sanitized: BatchOperationResult<T> = { data }

  if (metadata !== undefined) {
    sanitized.metadata = metadata
  }

  return sanitized
}
