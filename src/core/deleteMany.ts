import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { getSheetId } from '@/core/getSheetId'
import { findMany } from '@/core/findMany'
import { SheetRecord } from '@/types/sheetRecord'

/**
 * Deletes multiple records that match the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the deleteMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the deleteMany operation.
 * @param options.where - The where clause to filter records.
 * @returns An array of deleted records.
 *
 * @example
 * ```typescript
 * const deletedRecords = await deleteMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsClient,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'inactive' }
 * });
 * ```
 */
export async function deleteMany<RecordType extends Record<string, any>>(
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
    throw new Error('No records found to delete')
  }

  const sheetId = await getSheetId({ spreadsheetId, sheets, title: sheet })

  const requests = records
    .sort((a, b) => b.row - a.row)
    .map(record => ({
      deleteDimension: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: record.row - 1,
          endIndex: record.row
        }
      }
    }))

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests
    }
  })

  return records
}
