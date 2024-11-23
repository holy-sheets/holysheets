import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany'
import { SheetRecord } from '@/types/sheetRecord'

/**
 * Clears multiple records that match the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the clearMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the clearMany operation.
 * @param options.where - The where clause to filter records.
 * @returns A promise that resolves with an array of cleared records.
 *
 * @example
 * ```typescript
 * const clearedRecords = await clearMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'inactive' }
 * });
 * ```
 */
export async function clearMany<RecordType extends Record<string, any>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
  }
): Promise<SheetRecord<RecordType>[]> {
  const { spreadsheetId, sheets, sheet } = params
  const { where } = options

  // Find all records that match the where clause
  const records = await findMany<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (records.length === 0) {
    throw new Error('No records found to clear')
  }

  // Extract the ranges from the records
  const ranges = records.map(record => record.range)

  try {
    // Clear the values in the specified ranges using the interface method
    await sheets.batchClearValues(ranges)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error clearing records:', error.message)
      throw new Error(`Error clearing records: ${error.message}`)
    }
    console.error('Error clearing records:', error)
    throw new Error('An unknown error occurred while clearing records.')
  }

  return records
}
