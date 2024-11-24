import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findFirst } from '@/core/findFirst/findFirst'
import { CellValue } from '@/types/cellValue'

/**
 * Updates the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the updateFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the updateFirst operation.
 * @param options.where - The where clause to filter records.
 * @param options.data - The data to update.
 * @returns A promise that resolves with the updated record.
 *
 * @example
 * ```typescript
 * await updateFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' },
 *   data: { status: 'inactive' }
 * });
 * ```
 */
export async function updateFirst<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  }
): Promise<RecordType> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, data } = options

  // Find the first record that matches the 'where' clause
  const record = await findFirst<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (!record) {
    throw new Error('No record found to update')
  }

  const { data: fields, range } = record

  // Combine the existing fields with the data to be updated
  const updatedFields = { ...fields, ...data } as RecordType

  // Update the values in Google Sheets
  await sheets.updateValues(range, [Object.values(updatedFields)], 'RAW')

  return updatedFields
}
