import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findFirst } from '@/core/findFirst/findFirst'
import { SheetRecord } from '@/types/sheetRecord'
import { CellValue } from '@/types/cellValue'

/**
 * Deletes the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the deleteFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the deleteFirst operation.
 * @param options.where - The where clause to filter records.
 * @returns The deleted record.
 *
 * @example
 * ```typescript
 * const deletedRecord = await deleteFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' }
 * });
 * ```
 */
export async function deleteFirst<RecordType extends Record<string, CellValue>>(
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
    throw new Error('No record found to delete')
  }

  // Delete the row using the deleteRows method from the interface
  await sheets.deleteRows(sheet, record.row - 1, record.row)

  return record
}
