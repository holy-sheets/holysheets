import { ErrorCode, ErrorMessages } from '@/services/errors/errorMessages'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import {
  RawBatchOperationResult,
  IMetadataService
} from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { CellValue } from '@/types/cellValue'
import { OperationConfigs } from '@/types/operationConfigs'
import { SelectClause } from '@/types/select'
import { combine } from '@/utils/dataUtils/dataUtils'
import { getHeaders } from '@/utils/headers/headers'

/**
 * Retrieves all records from the specified sheet.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the getAllRecords operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the getAllRecords operation.
 * @param options.select - The select clause to specify fields to return.
 * @param options.includeEmptyRows - Whether to include empty rows in the result.
 * @param configs - Optional configurations for the operation.
 * @returns A batch operation result containing all records and metadata.
 *
 * @example
 * ```typescript
 * const allRecords = await findAll<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   select: { name: true, email: true },
 *   includeEmptyRows: false
 * }, {
 *   includeMetadata: true
 * });
 * ```
 */
export async function findAll<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options?: {
    select?: SelectClause<RecordType>
    includeEmptyRows?: boolean
  },
  configs?: OperationConfigs
): Promise<RawBatchOperationResult<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { select, includeEmptyRows = false } = options || {}
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Get headers from the sheet
    const headers = await getHeaders({
      sheet,
      sheets,
      spreadsheetId
    })

    // Define the range to retrieve all data starting from the second row
    const lastColumnLetter = String.fromCharCode(65 + headers.length - 1) // Adjusted to headers.length -1
    const range = `${sheet}!A2:${lastColumnLetter}`

    // Get all values within the range
    const allValues: CellValue[][] = await sheets.getValues(range)
    const allNonEmptyValues = allValues.filter(row => row.length > 0)
    const valuesToCombine = includeEmptyRows ? allValues : allNonEmptyValues

    // Combine values with selected headers
    const resultData: RecordType[] = valuesToCombine.map(row => {
      const selectedHeaders = headers.filter(header =>
        select ? select[header.name] : true
      )
      const data = combine<RecordType>(
        row ? (row.filter(value => value !== null) as string[]) : [],
        selectedHeaders
      )
      return data
    })

    const duration = metadataService.calculateDuration(startTime)
    const metadata = includeMetadata
      ? metadataService.createMetadata({
          operationType: 'find',
          spreadsheetId,
          sheetId: sheet,
          ranges: [range],
          recordsAffected: valuesToCombine.length,
          status: 'success',
          duration
        })
      : undefined

    return {
      data: resultData,
      rows: allValues.reduce((acc: number[], item, index) => {
        if (item.length > 0) {
          acc.push(index + 2) // Rows start at 2
        }
        return acc
      }, []),
      ranges: [range],
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
        operationType: 'find',
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
      : new Error('An unknown error occurred while finding data.')
  }
}
