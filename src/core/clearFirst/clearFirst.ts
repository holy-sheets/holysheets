import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findFirst } from '@/core/findFirst/findFirst'
import { SheetRecord } from '@/types/sheetRecord'
import { CellValue } from '@/types/cellValue'

/**
 * Clears the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the clearFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the clearFirst operation.
 * @param options.where - The where clause to filter records.
 * @returns A promise that resolves with the cleared record.
 *
 * @example
 * ```typescript
 * const clearedRecord = await clearFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' }
 * });
 * ```
 */
export async function clearFirst<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
  }
): Promise<SheetRecord<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where } = options

  // Find the first record that matches the where clause
  const record = await findFirst<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (!record) {
    throw new Error('No record found to clear')
  }

  try {
    // Clear the values in the specified range using the interface method
    await sheets.clearValues(record.range)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error clearing record:', error.message) // eslint-disable-line no-console
      throw new Error(`Error clearing record: ${error.message}`)
    }
    console.error('Error clearing record:', error) // eslint-disable-line no-console
    throw new Error('An unknown error occurred while clearing the record.')
  }

  return record
}
