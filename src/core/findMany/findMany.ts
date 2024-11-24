import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { SelectClause } from '@/types/select'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import { SheetRecord } from '@/types/sheetRecord'
import {
  createSingleColumnRange,
  createSingleRowRange
} from '@/utils/rangeUtils/rangeUtils'
import { CellValue } from '@/types/cellValue'

/**
 * Finds multiple records that match the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the findMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the findMany operation.
 * @param options.where - The where clause to filter records.
 * @param options.select - The select clause to specify fields to return.
 * @returns An array of matching records.
 *
 * @example
 * ```typescript
 * const records = await findMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'active' },
 *   select: { name: true, email: true }
 * });
 * ```
 */
export async function findMany<RecordType extends Record<string, any>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    select?: SelectClause<RecordType>
  }
): Promise<SheetRecord<RecordType>[]> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, select } = options

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

  try {
    // Get the values of the specific column
    const values: CellValue[][] = await sheets.getValues(range)

    // Find the indexes of the rows that meet the filter
    const rowIndexes = values?.reduce((acc: number[], row, index) => {
      const filter = where[firstColumn]
      if (
        filter !== undefined &&
        checkWhereFilter(filter, row[0] as string | undefined)
      ) {
        acc.push(index)
      }
      return acc
    }, [])

    if (!rowIndexes || rowIndexes.length === 0) {
      return []
    }

    // Create the ranges for the found rows
    const ranges = rowIndexes.map(index =>
      createSingleRowRange({
        sheet,
        row: index + 1,
        lastColumnIndex: headers.length - 1
      })
    )

    // Get the values of the specific rows using batchGetValues
    const batchGetResponse = await sheets.batchGetValues(ranges)

    if (!batchGetResponse.valueRanges) {
      return []
    }

    // Map the results to associate ranges and rows
    const rowsResponse = batchGetResponse.valueRanges.map(
      (valueRange, index) => ({
        range: ranges[index],
        values: valueRange.values,
        row: rowIndexes[index] + 1
      })
    )

    // Combine the values with the selected headers
    return rowsResponse.map(({ range, values, row }) => {
      const selectedHeaders = headers.filter(header =>
        select ? select[header.name] : true
      )
      const fields = combine<RecordType>(
        values ? (values[0].filter(value => value !== null) as string[]) : [],
        selectedHeaders
      )
      return { range, row, fields }
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error finding data', error.message) // eslint-disable-line no-console
      throw new Error(`Error finding data: ${error.message}`)
    }
    console.error('Error finding data', error) // eslint-disable-line no-console
    throw new Error('An unknown error occurred while finding data.')
  }
}
