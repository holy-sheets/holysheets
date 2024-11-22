import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany'

/**
 * Updates multiple records that match the given where clause.
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

  // Prepare updates for each record
  const updatePromises = records.map(async record => {
    const { fields, range } = record
    const updatedFields = { ...fields, ...data } as RecordType

    // Update the specific range with new values
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW', // or 'USER_ENTERED' based on your needs
      requestBody: {
        values: [Object.values(updatedFields)]
      }
    })

    return updatedFields
  })

  // Execute all update operations
  const updatedRecords = await Promise.all(updatePromises)

  return updatedRecords
}
