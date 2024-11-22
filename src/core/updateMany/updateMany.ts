import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany'
import { SheetRecord } from '@/types/sheetRecord'

/**
 * Updates multiple records that match the given where clause using batchUpdate.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the updateMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the updateMany operation.
 * @param options.where - The where clause to filter records.
 * @param options.data - The data to update.
 * @returns A promise that resolves with an array of updated records.
 *
 * @example
 * ```typescript
 * await updateMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsClient,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'active' },
 *   data: { status: 'inactive' }
 * });
 * ```
 */
export async function updateMany<RecordType extends Record<string, any>>(
  params: {
    spreadsheetId: string
    sheets: sheets_v4.Sheets
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  }
): Promise<RecordType[]> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, data } = options

  // Find all matching records
  const records = await findMany<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (records.length === 0) {
    throw new Error('No records found to update')
  }

  // Prepare the data for batchUpdate
  const batchUpdateData: sheets_v4.Schema$ValueRange[] = records.map(record => {
    const { range, fields } = record
    const updatedFields = { ...fields, ...data } as RecordType

    return {
      range, // e.g., 'Sheet1!A2:B2'
      values: [Object.values(updatedFields)]
    }
  })

  // Execute batchUpdate to update all records in a single API call
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW', // Use 'USER_ENTERED' if you want Google Sheets to parse the values
      data: batchUpdateData
    }
  })

  // Return the updated records
  return records.map(record => ({ ...record.fields, ...data }) as RecordType)
}
