import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany/findMany'
import { CellValue } from '@/types/cellValue'
import { OperationConfigs } from '@/types/operationConfigs'
import { MetadataService } from '@/services/metadata/MetadataService'
import {
  IMetadataService,
  BatchOperationResult
} from '@/services/metadata/IMetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

/**
 * Clears multiple records that match the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the clearMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the clearMany operation.
 * @param options.where - The where clause to filter records.
 * @param configs - Optional configurations for the operation.
 * @returns A batch operation result containing cleared records and metadata.
 *
 * @example
 * ```typescript
 * const clearedRecords = await clearMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1',
 * }, {
 *   where: { status: 'inactive' },
 * }, {
 *   includeMetadata: true,
 * });
 * ```
 */
export async function clearMany<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
  },
  configs?: OperationConfigs
): Promise<BatchOperationResult<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where } = options
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Find all records that match the where clause
    const findResult = await findMany<RecordType>(
      { spreadsheetId, sheets, sheet },
      { where },
      { includeMetadata }
    )

    if (!findResult.data || findResult.data.length === 0) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = includeMetadata
        ? metadataService.createMetadata({
            operationType: 'clear',
            spreadsheetId,
            sheetId: sheet,
            ranges: findResult.ranges || [],
            recordsAffected: 0,
            status: 'failure',
            error: ErrorMessages[ErrorCode.NoRecordFound],
            duration
          })
        : undefined
      return {
        data: [],
        rows: [],
        ranges: [],
        metadata
      }
    }

    const { data: records, rows, ranges } = findResult

    // Clear the values in the specified ranges using the interface method
    await sheets.batchClearValues(ranges as string[])

    const duration = metadataService.calculateDuration(startTime)
    const metadata = includeMetadata
      ? metadataService.createMetadata({
          operationType: 'clear',
          spreadsheetId,
          sheetId: sheet,
          ranges: ranges as string[],
          recordsAffected: records.length,
          status: 'success',
          duration
        })
      : undefined

    return {
      data: records,
      rows,
      ranges,
      metadata
    }
  } catch (error: unknown) {
    const duration = metadataService.calculateDuration(startTime)
    const errorMessage =
      error instanceof Error
        ? error.message
        : ErrorMessages[ErrorCode.UnknownError]
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        error: errorMessage,
        duration
      })
      return {
        data: undefined,
        rows: undefined,
        ranges: undefined,
        metadata
      }
    }
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred while clearing records.')
  }
}
