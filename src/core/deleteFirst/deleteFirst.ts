import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { findFirst } from '@/core/findFirst/findFirst'
import { CellValue } from '@/types/cellValue'
import { OperationConfigs } from '@/types/operationConfigs'
import { RawOperationResult } from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { IMetadataService } from '@/services/metadata/IMetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'
import { BaseOperationOptions } from '@/types/operationOptions'

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
 * @param configs - Optional configurations for the operation.
 * @returns A promise that resolves with the deleted record and optional metadata.
 *
 * @example
 * ```typescript
 * const deletedRecord = await deleteFirst<RecordType>({
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
export async function deleteFirst<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: BaseOperationOptions<RecordType>,
  configs?: OperationConfigs
): Promise<RawOperationResult<RecordType>> {
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

    if (!recordResult.data || !recordResult.row) {
      const duration = metadataService.calculateDuration(startTime)
      if (includeMetadata) {
        const metadata = metadataService.createMetadata({
          operationType: 'delete',
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

    const { data, row } = recordResult
    if (typeof row !== 'number') {
      throw new Error('Row must be a number')
    }

    // Delete the row using the deleteRows method from the interface
    await sheets.deleteRows(sheet, row - 1, row)

    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: [`${sheet}!${row}:${row}`],
        recordsAffected: 1,
        status: 'success',
        duration
      })
      return {
        data,
        row,
        range: `${sheet}!${row}:${row}`,
        metadata
      }
    }

    return {
      data,
      row,
      range: `${sheet}!${row}:${row}`
    }
  } catch (error: unknown) {
    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'delete',
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
