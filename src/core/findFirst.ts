import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { SelectClause } from '@/types/select'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import { SheetRecord } from '@/types/sheetRecord'
import { createSingleColumnRange } from '@/utils/rangeUtils/rangeUtils'

/**
 * Finds the first record that matches the provided where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the findFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
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
 *   sheets: googleSheetsClient,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { name: 'John Doe' },
 *   select: { name: true, age: true }
 * });
 * ```
 */
export async function findFirst<RecordType extends Record<string, any>>(
  params: {
    spreadsheetId: string
    sheets: sheets_v4.Sheets
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    select?: SelectClause<RecordType>
  }
): Promise<SheetRecord<RecordType> | undefined> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, select } = options

  const headers = await getHeaders({
    sheet,
    sheets,
    spreadsheetId
  })
  const columns = Object.keys(where) as (keyof RecordType)[]
  const header = headers.find(header => header.name === columns[0])
  if (!header) {
    throw new Error(`Header not found for column ${String(columns[0])}`)
  }
  const range = createSingleColumnRange({
    sheet,
    column: header.column
  })

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    })
    const rowIndex = response.data.values?.findIndex(row => {
      const filter = where[columns[0]]
      return filter !== undefined && checkWhereFilter(filter, row[0])
    })

    if (rowIndex === -1 || rowIndex === undefined) {
      return undefined
    }

    const rowRange = `${sheet}!A${rowIndex + 1}:${indexToColumn(
      headers.length - 1
    )}${rowIndex + 1}`
    const rowResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rowRange
    })

    if (!rowResponse.data.values) {
      return undefined
    }

    const selectedHeaders = headers.filter(header =>
      select ? select[header.name] : true
    )
    const fields = combine<RecordType>(
      rowResponse.data.values[0],
      selectedHeaders
    )
    return {
      range: rowRange,
      row: rowIndex + 1,
      fields
    }
  } catch (error) {
    console.error('Error finding data', error)
    throw error
  }
}
