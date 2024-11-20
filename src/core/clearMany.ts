import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany'
import { SheetRecord } from '@/types/sheetRecord'

/**
 * Clears multiple records that match the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the clearMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the clearMany operation.
 * @param options.where - The where clause to filter records.
 * @returns An array of cleared records.
 *
 * @example
 * ```typescript
 * const clearedRecords = await clearMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsClient,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'inactive' }
 * });
 * ```
 */
export async function clearMany<RecordType extends Record<string, any>>(
  params: {
    spreadsheetId: string
    sheets: sheets_v4.Sheets
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
  }
): Promise<SheetRecord<RecordType>[]> {
  const { spreadsheetId, sheets, sheet } = params
  const { where } = options

  const records = await findMany<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (records.length === 0) {
    throw new Error('No records found to clear')
  }

  const ranges = records.map(record => record.range)

  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    requestBody: {
      ranges
    }
  })

  return records
}
