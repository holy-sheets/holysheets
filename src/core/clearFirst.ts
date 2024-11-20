import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { findFirst } from '@/core/findFirst'
import { SheetRecord } from '@/types/sheetRecord'

/**
 * Clears the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the clearFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the clearFirst operation.
 * @param options.where - The where clause to filter records.
 * @returns The cleared record.
 *
 * @example
 * ```typescript
 * const clearedRecord = await clearFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsClient,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' }
 * });
 * ```
 */
export async function clearFirst<RecordType extends Record<string, any>>(
  params: {
    spreadsheetId: string
    sheets: sheets_v4.Sheets
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
  }
): Promise<SheetRecord<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where } = options

  const record = await findFirst<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (!record) {
    throw new Error('No record found to clear')
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: record.range
  })

  return record
}
