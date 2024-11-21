import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { findFirst } from '@/core/findFirst'
import { insert } from '@/core/insert'

/**
 * Updates the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the updateFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the updateFirst operation.
 * @param options.where - The where clause to filter records.
 * @param options.data - The data to update.
 * @returns A promise that resolves when the update is complete.
 *
 * @example
 * ```typescript
 * await updateFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsClient,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' },
 *   data: { status: 'inactive' }
 * });
 * ```
 */
export async function updateFirst<RecordType extends Record<string, any>>(
  params: {
    spreadsheetId: string
    sheets: sheets_v4.Sheets
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  }
): Promise<RecordType> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, data } = options

  const record = await findFirst<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (!record) {
    throw new Error('No record found to update')
  }

  const { fields } = record
  const updatedFields = { ...fields, ...data } as RecordType
  await insert<RecordType>(
    { spreadsheetId, sheets, sheet },
    { data: [updatedFields] }
  )
  return updatedFields
}
