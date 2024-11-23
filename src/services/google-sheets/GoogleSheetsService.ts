import { sheets_v4 } from 'googleapis'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { CellValue } from '@/types/cellValue'

export class GoogleSheetsService implements IGoogleSheetsService {
  private sheets: sheets_v4.Sheets
  private spreadsheetId: string

  constructor(sheetsClient: sheets_v4.Sheets, spreadsheetId: string) {
    this.sheets = sheetsClient
    this.spreadsheetId = spreadsheetId
  }

  /**
   * Retrieves values from a specific range in the spreadsheet.
   *
   * @param range - The cell range to retrieve (e.g., 'Sheet1!A1:B2').
   * @returns A promise that resolves with the retrieved values.
   */
  async getValues(range: string): Promise<CellValue[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      })
      return (response.data.values as CellValue[][]) || []
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error retrieving values: ${error.message}`)
      }
      throw new Error('An unknown error occurred while retrieving values.')
    }
  }

  /**
   * Updates values in a specific range in the spreadsheet.
   *
   * @param range - The cell range to update (e.g., 'Sheet1!A1:B2').
   * @param values - The new values to insert.
   * @param valueInputOption - How the input data should be interpreted ('RAW' or 'USER_ENTERED').
   * @returns A promise that resolves when the update is complete.
   */
  async updateValues(
    range: string,
    values: CellValue[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'RAW'
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption,
        requestBody: {
          values
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error updating values: ${error.message}`)
      }
      throw new Error('An unknown error occurred while updating values.')
    }
  }

  /**
   * Performs a batch update on multiple ranges in the spreadsheet.
   *
   * @param data - An array of objects containing the range and values to update.
   * @param valueInputOption - How the input data should be interpreted ('RAW' or 'USER_ENTERED').
   * @returns A promise that resolves when all updates are complete.
   */
  async batchUpdateValues(
    data: { range: string; values: CellValue[][] }[],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'RAW'
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          valueInputOption,
          data
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error performing batch update: ${error.message}`)
      }
      throw new Error('An unknown error occurred during batch update.')
    }
  }

  /**
   * Clears values from a specific range in the spreadsheet.
   *
   * @param range - The cell range to clear (e.g., 'Sheet1!A1:B2').
   * @returns A promise that resolves when the clear operation is complete.
   */
  async clearValues(range: string): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error clearing values: ${error.message}`)
      }
      throw new Error('An unknown error occurred while clearing values.')
    }
  }

  /**
   * Deletes rows from the spreadsheet.
   *
   * @param sheetName - The name of the sheet from which to delete rows.
   * @param startIndex - The starting index of the rows to delete (0-based, inclusive).
   * @param endIndex - The ending index of the rows to delete (0-based, exclusive).
   * @returns A promise that resolves when the delete operation is complete.
   */
  async deleteRows(
    sheetName: string,
    startIndex: number,
    endIndex: number
  ): Promise<void> {
    try {
      const sheetId = await this.getSheetId(sheetName)
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: 'ROWS',
                  startIndex,
                  endIndex
                }
              }
            }
          ]
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error deleting rows: ${error.message}`)
      }
      throw new Error('An unknown error occurred while deleting rows.')
    }
  }

  /**
   * Retrieves the sheet ID for a given sheet name.
   *
   * @param sheetName - The name of the sheet.
   * @returns A promise that resolves with the sheet ID.
   */
  private async getSheetId(sheetName: string): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        ranges: [sheetName],
        includeGridData: false
      })

      const sheet = response.data.sheets?.find(
        s => s.properties?.title === sheetName
      )

      if (!sheet?.properties?.sheetId) {
        throw new Error(`Sheet with name ${sheetName} not found`)
      }

      return sheet.properties.sheetId
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error retrieving sheet ID: ${error.message}`)
      }
      throw new Error('An unknown error occurred while retrieving sheet ID.')
    }
  }
}
