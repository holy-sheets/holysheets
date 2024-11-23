import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { decombine } from '@/utils/dataUtils/dataUtils'
import { getHeaders } from '@/utils/headers/headers'
import { write } from '@/utils/write/write'
import {
  addSheetToRange,
  createMultipleRowsRange
} from '@/utils/rangeUtils/rangeUtils'
import { CellValue } from '@/types/cellValue'

/**
 * Parameters required for the insert operation.
 */
export interface InsertParams {
  spreadsheetId: string
  sheets: IGoogleSheetsService
  sheet: string
}

/**
 * Inserts multiple records into a Google Sheets spreadsheet.
 *
 * @typeparam RecordType - The type of the records being inserted.
 * @param params - The parameters for the insert operation.
 * @param options - The options containing the data to insert.
 * @returns A promise that resolves when the insert operation is complete.
 *
 * @example
 * ```typescript
 * const params: InsertParams = {
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1',
 * };
 * const options = {
 *   data: [
 *     { Name: 'Alice', Age: 30 },
 *     { Name: 'Bob', Age: 25 },
 *   ],
 * };
 * await insert(params, options);
 * ```
 */
export async function insert<RecordType extends Record<string, CellValue>>(
  params: InsertParams,
  options: { data: RecordType[] }
): Promise<void> {
  const { spreadsheetId, sheets, sheet } = params
  const { data } = options

  // Fetch the current data to find the last line
  const currentData = await sheets.getValues(
    addSheetToRange({ sheet, range: 'A:Z' })
  )

  if (!currentData || currentData.length === 0) {
    throw new Error('No data found in the sheet.')
  }

  const lastLine = currentData.length

  // Get headers
  const headers = await getHeaders({
    sheet,
    sheets,
    spreadsheetId
  })

  // Transform records into values
  const valuesFromRecords = data.map(record => decombine(record, headers))

  // Define the range for the new data
  const range = createMultipleRowsRange({
    sheet: sheet,
    startRow: lastLine + 1,
    endRow: lastLine + valuesFromRecords.length,
    lastColumnIndex: headers.length - 1
  })

  // Write to the sheet using the updated write function
  await write({
    range,
    values: valuesFromRecords,
    spreadsheetId,
    sheets
  })
}
