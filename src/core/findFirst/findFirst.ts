import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { SelectClause } from '@/types/select'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import { SheetRecord } from '@/types/sheetRecord'
import { createSingleColumnRange } from '@/utils/rangeUtils/rangeUtils'
import { CellValue } from '@/types/cellValue'

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
 * @returns The first matching record or undefined if none is found.
 *
 * @example
 * ```typescript
 * const record = await findFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { name: 'John Doe' },
 *   select: { name: true, age: true }
 * });
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
  }
): Promise<SheetRecord<RecordType> | undefined> {
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
      return undefined
    }

    // Create the range for the found row
    const rowRange = `${sheet}!A${rowIndex + 1}:${indexToColumn(headers.length - 1)}${rowIndex + 1}`

    // Get the values from the specific row
    const rowValues: CellValue[][] = await sheets.getValues(rowRange)

    if (!rowValues || rowValues.length === 0 || !rowValues[0]) {
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

    return {
      range: rowRange,
      row: rowIndex + 1,
      data
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error finding data', error.message) // eslint-disable-line no-console
      throw new Error(`Error finding data: ${error.message}`)
    }
    console.error('Error finding data', error) // eslint-disable-line no-console
    throw new Error('An unknown error occurred while finding data.')
  }
}
