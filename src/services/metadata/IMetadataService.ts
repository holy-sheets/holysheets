export type OperationType = 'insert' | 'update' | 'delete' | 'find' | 'clear'

export interface OperationMetadata {
  operationId: string
  timestamp: string
  duration: string
  recordsAffected: number
  status: 'success' | 'failure'
  operationType: OperationType
  spreadsheetId: string
  sheetId: string
  ranges: string[]
  error?: string
  userId?: string
}

export interface IMetadataService {
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
  createMetadata: (options: {
    operationType: OperationType
    spreadsheetId: string
    sheetId: string
    ranges: string[]
    recordsAffected: number
    status: 'success' | 'failure'
    error?: string
    duration?: string
    userId?: string
  }) => OperationMetadata

  /**
   * Generates a unique operation ID.
   *
   * @returns A string representing the unique operation ID.
   */
  generateOperationId: () => string

  /**
   * Calculates the duration of an operation based on the start time.
   *
   * @param startTime - The start time of the operation in milliseconds.
   * @returns A string representing the duration of the operation.
   */
  calculateDuration: (startTime: number) => string
}

export interface OperationResult<T> {
  row: number | undefined
  range: string | undefined
  data: T | undefined
  metadata?: OperationMetadata
}
