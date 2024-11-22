import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { getSheetId } from '@/core/getSheetId'
import { findFirst } from '@/core/findFirst/findFirst'
import { SheetRecord } from '@/types/sheetRecord'

/**
 * Deletes the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the deleteFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the deleteFirst operation.
 * @param options.where - The where clause to filter records.
 * @returns The deleted record.
 *
 * @example
 * ```typescript
 * const deletedRecord = await deleteFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsClient,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' }
 * });
 * ```
 */
export async function deleteFirst<RecordType extends Record<string, any>>(
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

  const sheetId = await getSheetId({ spreadsheetId, sheets, title: sheet })
  const record = await findFirst<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (!record) {
    throw new Error('No record found to delete')
  }

  const requests = [
    {
      deleteDimension: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: record.row - 1,
          endIndex: record.row
        }
      }
    }
  ]

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests
    }
  })

  return record
}
