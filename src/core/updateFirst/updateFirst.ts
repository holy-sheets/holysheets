// updateFirst.ts

import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findFirst } from '@/core/findFirst/findFirst'
import { CellValue } from '@/types/cellValue'
import { OperationConfigs } from '@/types/operationConfigs'
import { MetadataService } from '@/services/metadata/MetadataService'
import {
  IMetadataService,
  OperationResult
} from '@/services/metadata/IMetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

/**
 * Updates the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the updateFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the updateFirst operation.
 * @param options.where - The where clause to filter records.
 * @param options.data - The data to update.
 * @param configs - Optional configurations for the operation.
 * @returns A promise that resolves with the updated record and optional metadata.
 *
 * @example
 * ```typescript
 * const result = await updateFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' },
 *   data: { status: 'inactive' }
 * }, {
 *   includeMetadata: true
 * });
 * ```
 */
export async function updateFirst<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  },
  configs?: OperationConfigs
): Promise<OperationResult<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, data } = options
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Find the first record that matches the 'where' clause
    const recordResult = await findFirst<RecordType>(
      { spreadsheetId, sheets, sheet },
      { where },
      { includeMetadata }
    )

    if (!recordResult.data || !recordResult.range) {
      const duration = metadataService.calculateDuration(startTime)
      if (includeMetadata) {
        const metadata = metadataService.createMetadata({
          operationType: 'update',
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

    const { data: existingData, range } = recordResult

    // Combine the existing fields with the data to be updated
    const updatedFields = { ...existingData, ...data } as RecordType

    // Update the values in Google Sheets
    await sheets.updateValues(range, [Object.values(updatedFields)], 'RAW')

    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'update',
        spreadsheetId,
        sheetId: sheet,
        ranges: [range],
        recordsAffected: 1,
        status: 'success',
        duration
      })
      return {
        data: updatedFields,
        row: recordResult.row,
        range,
        metadata
      }
    }

    return {
      data: updatedFields,
      row: recordResult.row,
      range
    }
  } catch (error: unknown) {
    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'update',
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
