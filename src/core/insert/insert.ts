import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { decombine } from '@/utils/dataUtils/dataUtils'
import { getHeaders } from '@/utils/headers/headers'
import { write } from '@/utils/write/write'
import {
  addSheetToRange,
  createMultipleRowsRange
} from '@/utils/rangeUtils/rangeUtils'
import { CellValue } from '@/types/cellValue'
import { OperationConfigs } from '@/types/operationConfigs'
import { RawOperationResult } from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { IMetadataService } from '@/services/metadata/IMetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

/**
 * Parameters required for the insert operation.
 */
export interface InsertParams {
  spreadsheetId: string
  sheets: IGoogleSheetsService
  sheet: string
}

/**
 * Inserts multiple records into a Google Sheets spreadsheet.
 *
 * @typeparam RecordType - The type of the records being inserted.
 * @param params - The parameters for the insert operation.
 * @param options - The options containing the data to insert.
 * @param configs - Optional configurations for the operation.
 * @returns A promise that resolves with the operation result.
 *
 * @example
 * ```typescript
 * const params: InsertParams = {
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1',
 * };
 * const options = {
 *   data: [
 *     { Name: 'Alice', Age: 30 },
 *     { Name: 'Bob', Age: 25 },
 *   ],
 * };
 * await insert(params, options, { includeMetadata: true });
 * ```
 */
export async function insert<RecordType extends Record<string, CellValue>>(
  params: InsertParams,
  options: { data: RecordType[] },
  configs?: OperationConfigs
): Promise<RawOperationResult<RecordType[]>> {
  const { spreadsheetId, sheets, sheet } = params
  const { data } = options
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Fetch the current data to find the last line
    const currentData = await sheets.getValues(
      addSheetToRange({ sheet, range: 'A:Z' })
    )

    if (!currentData || currentData.length === 0) {
      const duration = metadataService.calculateDuration(startTime)
      const errorMessage = 'No data found in the sheet.'
      if (includeMetadata) {
        const metadata = metadataService.createMetadata({
          operationType: 'insert',
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
          row: undefined,
          range: undefined,
          metadata
        }
      }
      throw new Error(errorMessage)
    }

    const lastLine = currentData.length

    // Get headers
    const headers = await getHeaders({
      sheet,
      sheets,
      spreadsheetId
    })

    // Transform records into values
    const valuesFromRecords = data.map(record => decombine(record, headers))

    // Define the range for the new data
    const startRow = lastLine + 1
    const endRow = lastLine + valuesFromRecords.length
    const range = createMultipleRowsRange({
      sheet: sheet,
      startRow: startRow,
      endRow: endRow,
      lastColumnIndex: headers.length - 1
    })

    // Write to the sheet using the updated write function
    await write({
      range,
      values: valuesFromRecords,
      spreadsheetId,
      sheets
    })

    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'insert',
        spreadsheetId,
        sheetId: sheet,
        ranges: [range],
        recordsAffected: data.length,
        status: 'success',
        duration
      })
      return {
        data: data,
        row: Array.from({ length: data.length }, (_, i) => startRow + i),
        range: range,
        metadata
      }
    }

    return {
      data: data,
      row: Array.from({ length: data.length }, (_, i) => startRow + i),
      range: range
    }
  } catch (error: unknown) {
    const duration = metadataService.calculateDuration(startTime)
    const errorMessage =
      error instanceof Error
        ? error.message
        : ErrorMessages[ErrorCode.UnknownError]
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'insert',
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
        row: undefined,
        range: undefined,
        metadata
      }
    }
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred during the insert operation.')
  }
}
