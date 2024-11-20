import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { SelectClause } from '@/types/select'
import { getHeaders } from '@/utils/headers'
import { checkWhereFilter } from '@/utils/where'
import { combine } from '@/utils/dataUtils'
import { indexToColumn } from '@/utils/columnUtils'
import { SheetRecord } from '@/types/sheetRecord'
import {
  createSingleColumnRange,
  createSingleRowRange
} from '@/utils/rangeUtils'
/**
 * Finds multiple records that match the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the findMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
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
 *   sheets: googleSheetsClient,
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
    sheets: sheets_v4.Sheets
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    select?: SelectClause<RecordType>
  }
): Promise<SheetRecord<RecordType>[]> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, select } = options

  const headers = await getHeaders({
    sheet,
    sheets,
    spreadsheetId
  })
  const columns = Object.keys(where)
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

    const rowIndexes = response.data.values?.reduce(
      (acc: number[], row, index) => {
        const filter = where[columns[0]]
        if (filter !== undefined && checkWhereFilter(filter, row[0])) {
          acc.push(index)
        }
        return acc
      },
      []
    )

    if (!rowIndexes || rowIndexes.length === 0) {
      return []
    }

    const ranges = rowIndexes.map(index =>
      createSingleRowRange({
        sheet,
        row: index + 1,
        lastColumnIndex: headers.length - 1
      })
    )
    const batchGetResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges
    })

    if (!batchGetResponse.data.valueRanges) {
      return []
    }

    const rowsResponse = batchGetResponse.data.valueRanges.map(
      (valueRange, index) => ({
        range: ranges[index],
        values: valueRange.values,
        row: rowIndexes[index] + 1
      })
    )

    return rowsResponse.map(({ range, values, row }) => {
      const selectedHeaders = headers.filter(header =>
        select ? select[header.name] : true
      )
      const fields = combine<RecordType>(
        values ? values[0] : [],
        selectedHeaders
      )
      return { range, row, fields }
    })
  } catch (error) {
    console.error('Error finding data', error)
    throw error
  }
}
