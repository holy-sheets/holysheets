import {
  IMetadataService,
  OperationType,
  OperationMetadata
} from '@/services/metadata/IMetadataService'
import { v4 as uuidv4 } from 'uuid'

/**
 * MetadataService is responsible for creating and managing operation metadata.
 * It implements the IMetadataService interface.
 */
export class MetadataService implements IMetadataService {
  /**
   * Generates a unique operation ID using UUID v4.
   *
   * @returns A string representing the unique operation ID.
   */
  generateOperationId(): string {
    return uuidv4()
  }

  /**
   * Calculates the duration of an operation based on the start time.
   *
   * @param startTime - The start time of the operation in milliseconds.
   * @returns A string representing the duration of the operation.
   */
  calculateDuration(startTime: number): string {
    const duration = Date.now() - startTime
    return `${duration}ms`
  }

  /**
   * Creates metadata for an operation.
   *
   * @param operationType - The type of operation performed.
   * @param spreadsheetId - The ID of the spreadsheet.
   * @param sheetId - The ID of the sheet.
   * @param ranges - The ranges affected by the operation.
   * @param recordsAffected - The number of records affected.
   * @param status - The status of the operation ('success' | 'failure').
   * @param error - The error message, if any.
   * @param userId - The ID of the user who performed the operation.
   * @returns An object containing the operation metadata.
   */
  createMetadata(
    operationType: OperationType,
    spreadsheetId: string,
    sheetId: string,
    ranges: string[],
    recordsAffected: number,
    status: 'success' | 'failure',
    error?: string,
    userId?: string
  ): OperationMetadata {
    const operationId = this.generateOperationId()
    const timestamp = new Date().toISOString()

    const metadata: OperationMetadata = {
      operationId,
      timestamp,
      duration: '',
      recordsAffected,
      status,
      operationType,
      spreadsheetId,
      sheetId,
      ranges,
      ...(error && { error }),
      ...(userId && { userId })
    }

    return metadata
  }
}
