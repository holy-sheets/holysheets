import { sheets_v4 } from 'googleapis'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import { decombine } from '@/utils/dataUtils/dataUtils'
import { getHeaders } from '@/utils/headers/headers'
import { write } from '@/utils/write/write'
import {
  addSheetToRange,
  createMultipleRowsRange
} from '@/utils/rangeUtils/rangeUtils'

export interface InsertParams {
  spreadsheetId: string
  sheets: sheets_v4.Sheets
  sheet: string
}

export async function insert<RecordType extends Record<string, any>>(
  params: InsertParams,
  options: { data: RecordType[] }
): Promise<void> {
  const { spreadsheetId, sheets, sheet } = params
  const { data } = options

  // Fetch the current data to find the last line
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: addSheetToRange({ sheet, range: 'A:Z' })
  })

  if (!response.data.values) {
    throw new Error('No data found in the sheet.')
  }

  const lastLine = response.data.values.length

  // Get headers
  const headers = await getHeaders({
    sheet,
    sheets,
    spreadsheetId
  })

  // Transform records into values
  const valuesFromRecords = data.map(record => decombine(record, headers))

  // Define the range for the new data
  const range = createMultipleRowsRange({
    sheet: sheet,
    startRow: lastLine + 1,
    endRow: lastLine + valuesFromRecords.length,
    lastColumnIndex: headers.length - 1
  })

  // Write to the sheet
  await write({
    tableName: sheet,
    range,
    values: valuesFromRecords,
    spreadsheetId,
    sheets
  })
}
