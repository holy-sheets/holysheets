import type { sheets_v4 } from 'googleapis'
import { CellValue } from '@/types/cellValue'
import { AuthClient } from '@/types/credentials'

export interface IGoogleSheetsService {
  /**
   * Gets values from a specific range in the spreadsheet.
   *
   * @param range - The range of cells to retrieve (e.g., 'Sheet1!A1:B2').
   * @returns A promise that resolves with the retrieved values.
   */
  getValues: (range: string) => Promise<CellValue[][]>

  /**
   * Gets values from multiple ranges in the spreadsheet.
   *
   * @param ranges - An array of cell ranges to retrieve.
   * @returns A promise that resolves with the retrieved values.
   */
  batchGetValues: (
    ranges: string[]
  ) => Promise<{ valueRanges: { range: string; values?: CellValue[][] }[] }>

  /**
   * Updates values in a specific range in the spreadsheet.
   *
   * @param range - The range of cells to update (e.g., 'Sheet1!A1:B2').
   * @param values - The new values to insert.
   * @param valueInputOption - How the input data should be interpreted ('RAW' or 'USER_ENTERED').
   * @returns A promise that resolves when the update is complete.
   */
  updateValues: (
    range: string,
    values: CellValue[][],
    valueInputOption?: 'RAW' | 'USER_ENTERED'
  ) => Promise<void>

  /**
   * Performs a batch update on multiple ranges in the spreadsheet.
   *
   * @param data - An array of objects containing the range and values to be updated.
   * @param valueInputOption - How the input data should be interpreted ('RAW' or 'USER_ENTERED').
   * @returns A promise that resolves when all updates are complete.
   */
  batchUpdateValues: (
    data: { range: string; values: CellValue[][] }[],
    valueInputOption?: 'RAW' | 'USER_ENTERED'
  ) => Promise<void>

  /**
   * Clears values from a specific range in the spreadsheet.
   *
   * @param range - The range of cells to clear (e.g., 'Sheet1!A1:B2').
   * @returns A promise that resolves when the clear operation is complete.
   */
  clearValues: (range: string) => Promise<void>

  /**
   * Clears values from multiple ranges in the spreadsheet.
   *
   * @param ranges - An array of cell ranges to clear.
   * @returns A promise that resolves when all clear operations are complete.
   */
  batchClearValues: (ranges: string[]) => Promise<void>

  /**
   * Deletes a range of rows in the spreadsheet.
   *
   * @param sheetName - The name of the sheet from which the rows will be deleted.
   * @param startIndex - The starting index of the rows to be deleted (0-based, inclusive).
   * @param endIndex - The ending index of the rows to be deleted (0-based, exclusive).
   * @returns A promise that resolves when the delete operation is complete.
   */
  deleteRows: (
    sheetName: string,
    startIndex: number,
    endIndex: number
  ) => Promise<void>

  /**
   * Deletes multiple rows in the spreadsheet in a single batch operation.
   *
   * @param sheetName - The name of the sheet from which the rows will be deleted.
   * @param rowIndices - An array of row indices to be deleted (0-based).
   * @returns A promise that resolves when all delete operations are complete.
   */
  batchDeleteRows: (sheetName: string, rowIndices: number[]) => Promise<void>

  /**
   * Gets the complete metadata of the spreadsheet.
   *
   * @returns A promise that resolves with the spreadsheet metadata.
   */
  getSpreadsheet: () => Promise<sheets_v4.Schema$Spreadsheet>

  /**
   * Gets the authentication client used to access the Google Sheets API.
   *
   * @returns {AuthClient} The authentication client.
   */
  getAuth: () => AuthClient
}
