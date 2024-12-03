import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findFirst } from '@/core/findFirst/findFirst'
import { CellValue } from '@/types/cellValue'
import { OperationConfigs } from '@/types/operationConfigs'
import { OperationResult } from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { IMetadataService } from '@/services/metadata/IMetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

/**
 * Clears the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the clearFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the clearFirst operation.
 * @param options.where - The where clause to filter records.
 * @param configs - Optional configurations for the operation.
 * @returns A promise that resolves with the cleared record and optional metadata.
 *
 * @example
 * ```typescript
 * const clearedRecord = await clearFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' }
 * }, {
 *   includeMetadata: true
 * });
 * ```
 */
export async function clearFirst<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
  },
  configs?: OperationConfigs
): Promise<OperationResult<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where } = options
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Find the first record that matches the where clause
    const recordResult = await findFirst<RecordType>(
      { spreadsheetId, sheets, sheet },
      { where },
      { includeMetadata }
    )

    if (!recordResult.data || !recordResult.range) {
      const duration = metadataService.calculateDuration(startTime)
      if (includeMetadata) {
        const metadata = metadataService.createMetadata({
          operationType: 'clear',
          spreadsheetId,
          sheetId: sheet,
          ranges: recordResult.metadata?.ranges ?? [],
          recordsAffected: 0,
          status: 'failure',
          error: ErrorMessages[ErrorCode.NoRecordFound],
          duration
        })
        return {
          data: undefined,
          row: undefined,
          range: undefined,
          metadata
        }
      }
      throw new Error(ErrorMessages[ErrorCode.NoRecordFound])
    }

    const { data, range, row } = recordResult

    // Clear the values in the specified range using the interface method
    await sheets.clearValues(range)

    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges: [range],
        recordsAffected: 1,
        status: 'success',
        duration
      })
      return {
        data,
        row,
        range,
        metadata
      }
    }

    return {
      data,
      row,
      range
    }
  } catch (error: unknown) {
    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        error:
          error instanceof Error
            ? error.message
            : ErrorMessages[ErrorCode.UnknownError],
        duration
      })
      return {
        data: undefined,
        row: undefined,
        range: undefined,
        metadata
      }
    }
    throw error
  }
}
