import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { OperationError } from '@/services/errors/errors'
import { WhereClause } from '@/types/where'
import { SelectClause } from '@/types/select'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import { createSingleColumnRange } from '@/utils/rangeUtils/rangeUtils'
import { CellValue } from '@/types/cellValue'
import {
  IMetadataService,
  OperationResult
} from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { OperationConfigs } from '@/types/operationConfigs'

/**
 * Finds the first record that matches the provided where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the findFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the findFirst operation.
 * @param options.where - The where clause to filter records.
 * @param options.select - The select clause to specify fields to be returned.
 * @param includeMetadata - Flag indicating whether to include metadata in the response.
 * @returns An object containing the first matching record and optionally metadata, or undefined if no match is found.
 *
 * @example
 * ```typescript
 * const result = await findFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { name: 'John Doe' },
 *   select: { name: true, age: true }
 * }, true);
 *
 * if (result) {
 *   console.log(result.data); // The found record
 *   console.log(result.metadata); // Operation metadata
 * }
 * ```
 */
export async function findFirst<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    select?: SelectClause<RecordType>
  },
  configs?: OperationConfigs
): Promise<OperationResult<RecordType> | undefined> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, select } = options
  const { includeMetadata = false } = configs ?? {}

  // Initialize MetadataService
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Get the headers from the sheet
    const headers = await getHeaders({
      sheet,
      sheets,
      spreadsheetId
    })

    // Extract the columns from the 'where' clause
    const columns = Object.keys(where) as (keyof RecordType)[]
    const firstColumn = columns[0]

    // Find the header corresponding to the first column of the 'where'
    const header = headers.find(header => header.name === firstColumn)

    if (!header) {
      throw new Error(`Header not found for column ${String(firstColumn)}`)
    }

    // Create the range for the specific column
    const range = createSingleColumnRange({
      sheet,
      column: header.column
    })

    // Get the values from the specific column
    const values: CellValue[][] = await sheets.getValues(range)

    // Find the index of the first row that meets the filter
    const rowIndex = values?.findIndex(row => {
      const filter = where[firstColumn]
      return (
        filter !== undefined &&
        checkWhereFilter(filter, row[0] as string | undefined)
      )
    })

    if (rowIndex === -1 || rowIndex === undefined) {
      if (includeMetadata) {
        const duration = metadataService.calculateDuration(startTime)
        const metadata = metadataService.createMetadata(
          'find',
          spreadsheetId,
          sheet,
          [range],
          0,
          'failure',
          'No records found matching the criteria.'
        )
        metadata.duration = duration

        return { data: undefined, metadata, row: undefined, range: undefined }
      }
      return undefined
    }

    // Create the range for the found row
    const rowRange = `${sheet}!A${rowIndex + 1}:${indexToColumn(
      headers.length - 1
    )}${rowIndex + 1}`

    // Get the values from the specific row
    const rowValues: CellValue[][] = await sheets.getValues(rowRange)

    if (!rowValues || rowValues.length === 0 || !rowValues[0]) {
      if (includeMetadata) {
        const duration = metadataService.calculateDuration(startTime)
        const metadata = metadataService.createMetadata(
          'find',
          spreadsheetId,
          sheet,
          [rowRange],
          0,
          'failure',
          'No data found in the targeted row.'
        )
        metadata.duration = duration

        return { data: undefined, metadata, row: undefined, range: undefined }
      }
      return undefined
    }

    // Filter the headers based on the 'select' clause
    const selectedHeaders = headers.filter(header =>
      select ? select[header.name] : true
    )

    // Combine the row values with the selected headers
    const data = combine<RecordType>(
      rowValues[0].filter(value => value !== null) as string[],
      selectedHeaders
    )

    if (includeMetadata) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = metadataService.createMetadata(
        'find',
        spreadsheetId,
        sheet,
        [rowRange],
        1,
        'success'
      )
      metadata.duration = duration

      return { data, metadata, row: undefined, range: undefined }
    }

    return {
      range: rowRange,
      row: rowIndex + 1,
      data
    }
  } catch (error: unknown) {
    if (includeMetadata) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = metadataService.createMetadata(
        'find',
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
      console.error('Error finding data:', error.message) // eslint-disable-line no-console
      throw new OperationError(`Error finding data: ${error.message}`, {
        operationId: metadataService.generateOperationId(),
        timestamp: new Date().toISOString(),
        duration: metadataService.calculateDuration(startTime),
        recordsAffected: 0,
        status: 'failure',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: error.message,
        userId: undefined // Replace with actual userId if available
      })
    }

    console.error('Error finding data:', error) // eslint-disable-line no-console
    throw new OperationError('An unknown error occurred while finding data.', {
      operationId: metadataService.generateOperationId(),
      timestamp: new Date().toISOString(),
      duration: metadataService.calculateDuration(startTime),
      recordsAffected: 0,
      status: 'failure',
      operationType: 'find',
      spreadsheetId,
      sheetId: sheet,
      ranges: [],
      error: 'Unknown error',
      userId: undefined // Replace with actual userId if available
    })
  }
}
