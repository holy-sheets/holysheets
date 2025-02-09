/**
 * Interface representing a service for interacting with sheets.
 */

import { sheets_v4 } from 'googleapis'
import { AuthClient } from '@/services/google-sheets/types/credentials.type'

/**
 * Retrieves multiple columns from the specified sheet.
 *
 * @param sheetName - The name of the sheet from which to retrieve the columns.
 * @param columnIndexes - An array of indexes of the columns to retrieve.
 * @returns A promise that resolves to a 2D array of strings representing the columns data.
 */
/**
 * Interface representing a service for interacting with Google Sheets.
 */
export interface SheetsAdapterService {
  /**
   * Retrieves a single row from the specified sheet.
   *
   * @param sheetName - The name of the sheet from which to retrieve the row.
   * @param rowIndex - The index of the row to retrieve.
   * @returns A promise that resolves to an array of strings representing the row data.
   */
  getSingleRow: (sheetName: string, rowIndex: number) => Promise<string[]>

  /**
   * Retrieves multiple rows from the specified sheet.
   *
   * @param sheetName - The name of the sheet from which to retrieve the rows.
   * @param rowIndexes - An array of indexes of the rows to retrieve.
   * @returns A promise that resolves to a 2D array of strings representing the rows data.
   */
  getMultipleRows: (
    sheetName: string,
    rowIndexes: number[]
  ) => Promise<string[][]>

  /**
   * Retrieves multiple columns from the specified sheet.
   *
   * @param sheetName - The name of the sheet from which to retrieve the columns.
   * @param columnIndexes - An array of indexes of the columns to retrieve.
   * @returns A promise that resolves to a 2D array of strings representing the columns data.
   */
  getMultipleColumns: (
    sheetName: string,
    columnIndexes: number[]
  ) => Promise<string[][]>

  /**
   * Clear multiple rows from the specified sheet.
   *
   * @param sheetName - The name of the sheet from which to retrieve the rows.
   * @param rowIndexes - An array of indexes of the rows to retrieve.
   * @returns A promise that resolves to a 2D array of strings representing the rows data.
   */
  clearMultipleRows: (sheetName: string, rowIndexes: number[]) => Promise<void>

  appendMultipleRows: (
    sheetName: string,
    rows: (string | null)[][]
  ) => Promise<void>

  /**
   * Gets the complete metadata of the spreadsheet.
   *
   * @returns A promise that resolves with the spreadsheet metadata.
   */
  getSpreadsheet: () => Promise<sheets_v4.Schema$Spreadsheet>

  /**
   * Gets the ID of the sheet with the specified name.
   *
   * @param sheetName - The name of the sheet.
   * @returns A promise that resolves with the ID of the sheet.
   */
  getSheetId: (sheetName: string) => Promise<number>

  /**
   * Gets the authentication client used to access the Google Sheets API.
   *
   * @returns {AuthClient} The authentication client.
   */
  getAuth: () => AuthClient
}
