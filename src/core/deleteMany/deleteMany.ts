import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService' // Type import only
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany/findMany'
import { SheetRecord } from '@/types/sheetRecord'
import { CellValue } from '@/types/cellValue'

/**
 * Deletes multiple records that match the provided where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the deleteMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the deleteMany operation.
 * @param options.where - The where clause to filter records.
 * @returns An array of deleted records.
 *
 * @example
 * ```typescript
 * const deletedRecords = await deleteMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'inactive' }
 * });
 * ```
 */
export async function deleteMany<RecordType extends Record<string, CellValue>>(
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

  try {
    // Find all records that match the where clause
    const records = await findMany<RecordType>(
      { spreadsheetId, sheets, sheet },
      { where }
    )

    if (records.length === 0) {
      throw new Error('No records found to delete.')
    }

    // Extract the row indices (0-based)
    const rowIndices = records.map(record => record.row - 1)

    // Delete all rows in a single batch operation
    await sheets.batchDeleteRows(sheet, rowIndices)

    return records
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting records:', error.message) // eslint-disable-line no-console
      throw new Error(`Error deleting records: ${error.message}`)
    }
    console.error('Error deleting records:', error) // eslint-disable-line no-console
    throw new Error('An unknown error occurred while deleting records.')
  }
}
