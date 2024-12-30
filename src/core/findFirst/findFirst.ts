import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { SelectClause } from '@/types/select'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import {
  createFullRange,
  createSingleColumnRange
} from '@/utils/rangeUtils/rangeUtils'
import { CellValue } from '@/types/cellValue'
import { OperationConfigs } from '@/types/operationConfigs'
import {
  IMetadataService,
  RawOperationResult
} from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorCode, ErrorMessages } from '@/services/errors/errorMessages'

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
): Promise<RawOperationResult<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, select } = options
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Get the headers from the sheet
    const headers = await getHeaders({ sheet, sheets, spreadsheetId })

    // Extract the columns from the 'where' clause
    const columns = Object.keys(where) as (keyof RecordType)[]
    if (columns.length === 0) {
      throw new Error('At least one condition is required in the where clause.')
    }
    const firstColumn = columns[0]

    // Find the header corresponding to the first column of the 'where'
    const header = headers.find(h => h.name === firstColumn)
    if (!header) {
      throw new Error(`Header not found for column ${String(firstColumn)}`)
    }

    // Create the range for the specific column
    const range = createSingleColumnRange({ sheet, column: header.column })

    // Get the values of the specific column
    const values = await sheets.getValues(range)

    // Find the index of the first row that meets the filter
    const rowIndex = values?.findIndex(row => {
      const filter = where[firstColumn]
      return (
        filter !== undefined &&
        checkWhereFilter(filter, row[0] as string | undefined)
      )
    })

    if (rowIndex === -1 || rowIndex === undefined) {
      const duration = metadataService.calculateDuration(startTime)
      if (includeMetadata) {
        const metadata = metadataService.createMetadata({
          operationType: 'find',
          spreadsheetId,
          sheetId: sheet,
          ranges: [range],
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
      return {
        data: undefined,
        row: undefined,
        range: undefined
      }
    }

    // Create the range for the found row
    const rowRange = createFullRange({
      sheet,
      startColumn: indexToColumn(0),
      endColumn: indexToColumn(headers.length - 1),
      startRow: rowIndex + 1,
      endRow: rowIndex + 1
    })

    // Get the values of the specific row
    const rowValues = await sheets.getValues(rowRange)

    if (!rowValues || rowValues.length === 0 || !rowValues[0]) {
      const duration = metadataService.calculateDuration(startTime)
      if (includeMetadata) {
        const metadata = metadataService.createMetadata({
          operationType: 'find',
          spreadsheetId,
          sheetId: sheet,
          ranges: [range, rowRange],
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
      return {
        data: undefined,
        row: undefined,
        range: undefined
      }
    }

    // Filter the headers based on the 'select' clause
    const selectedHeaders = headers.filter(header =>
      select ? select[header.name] : true
    )

    // Combine the row values with the selected headers
    const data = combine<RecordType>(rowValues[0] as string[], selectedHeaders)

    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: [range, rowRange],
        recordsAffected: 1,
        status: 'success',
        duration
      })
      return {
        data,
        row: rowIndex + 1,
        range: rowRange,
        metadata
      }
    }

    return {
      data,
      row: rowIndex + 1,
      range: rowRange
    }
  } catch (error: unknown) {
    const duration = metadataService.calculateDuration(startTime)
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        error:
          error instanceof Error
            ? `Error finding data: ${error.message}`
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
    // Re-throw the error if metadata is not requested
    if (error instanceof Error) {
      throw new Error(`Error finding data: ${error.message}`)
    }
    throw new Error('An unknown error occurred while finding data.')
  }
}
