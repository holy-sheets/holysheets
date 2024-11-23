export interface IGoogleSheetsService {
  /**
   * Retrieves values from a specific range in the spreadsheet.
   *
   * @param range - The cell range to retrieve (e.g., 'Sheet1!A1:B2').
   * @returns A promise that resolves with the retrieved values.
   */
  getValues(range: string): Promise<any[][]>

  /**
   * Updates values in a specific range in the spreadsheet.
   *
   * @param range - The cell range to update (e.g., 'Sheet1!A1:B2').
   * @param values - The new values to insert.
   * @param valueInputOption - How the input data should be interpreted ('RAW' or 'USER_ENTERED').
   * @returns A promise that resolves when the update is complete.
   */
  updateValues(
    range: string,
    values: any[][],
    valueInputOption?: 'RAW' | 'USER_ENTERED'
  ): Promise<void>

  /**
   * Performs a batch update on multiple ranges in the spreadsheet.
   *
   * @param data - An array of objects containing the range and values to update.
   * @param valueInputOption - How the input data should be interpreted ('RAW' or 'USER_ENTERED').
   * @returns A promise that resolves when all updates are complete.
   */
  batchUpdateValues(
    data: { range: string; values: any[][] }[],
    valueInputOption?: 'RAW' | 'USER_ENTERED'
  ): Promise<void>

  /**
   * Clears values from a specific range in the spreadsheet.
   *
   * @param range - The cell range to clear (e.g., 'Sheet1!A1:B2').
   * @returns A promise that resolves when the clear operation is complete.
   */
  clearValues(range: string): Promise<void>

  /**
   * Deletes rows from the spreadsheet.
   *
   * @param sheetName - The name of the sheet from which to delete rows.
   * @param startIndex - The starting index of the rows to delete (0-based, inclusive).
   * @param endIndex - The ending index of the rows to delete (0-based, exclusive).
   * @returns A promise that resolves when the delete operation is complete.
   */
  deleteRows(
    sheetName: string,
    startIndex: number,
    endIndex: number
  ): Promise<void>
}
