import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findFirst } from '@/core/findFirst/findFirst'
import { CellValue } from '@/types/cellValue'
import {
  IMetadataService,
  OperationResult
} from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { OperationError } from '@/services/errors/errors'
import { OperationConfigs } from '@/types/operationConfigs'

/**
 * Deletes the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the deleteFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the deleteFirst operation.
 * @param options.where - The where clause to filter records.
 * @param configs - Configuration options for the operation.
 * @returns An object containing the deleted record and optionally metadata, or undefined if no match is found.
 *
 * @example
 * ```typescript
 * const result = await deleteFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' }
 * }, { includeMetadata: true });
 *
 * if (result.data) {
 *   console.log('Deleted record:', result.data);
 *   console.log('Operation metadata:', result.metadata);
 * }
 * ```
 */
export async function deleteFirst<RecordType extends Record<string, CellValue>>(
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

  // Initialize MetadataService
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Find the first record that matches the where clause
    const findResult = await findFirst<RecordType>(
      { spreadsheetId, sheets, sheet },
      { where },
      { includeMetadata }
    )

    if (!findResult || !findResult.data || findResult.row === undefined) {
      if (includeMetadata && findResult && findResult.metadata) {
        // No record found, return metadata indicating failure
        return {
          data: undefined,
          metadata: findResult.metadata,
          row: undefined,
          range: undefined
        }
      }
      return { data: undefined, row: undefined, range: undefined }
    }

    const { data, row, range } = findResult

    // Delete the row using the deleteRows method from the interface
    await sheets.deleteRows(sheet, row, row)

    if (includeMetadata) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = metadataService.createMetadata(
        'delete',
        spreadsheetId,
        sheet,
        range ? [range] : [],
        1,
        'success'
      )
      metadata.duration = duration

      return { data, metadata, row, range }
    }

    return { data, row, range }
  } catch (error: unknown) {
    if (includeMetadata) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = metadataService.createMetadata(
        'delete',
        spreadsheetId,
        sheet,
        [],
        0,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      )
      metadata.duration = duration

      return { data: undefined, metadata, row: undefined, range: undefined }
    }

    // Re-throw the error if metadata is not requested
    if (error instanceof Error) {
      console.error('Error deleting record:', error.message) // eslint-disable-line no-console
      throw new OperationError(`Error deleting record: ${error.message}`, {
        operationId: metadataService.generateOperationId(),
        timestamp: new Date().toISOString(),
        duration: metadataService.calculateDuration(startTime),
        recordsAffected: 0,
        status: 'failure',
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: error.message
      })
    }

    console.error('Error deleting record:', error) // eslint-disable-line no-console
    throw new OperationError(
      'An unknown error occurred while deleting the record.',
      {
        operationId: metadataService.generateOperationId(),
        timestamp: new Date().toISOString(),
        duration: metadataService.calculateDuration(startTime),
        recordsAffected: 0,
        status: 'failure',
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: 'Unknown error'
      }
    )
  }
}
