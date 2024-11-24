import { sheets_v4, google } from 'googleapis'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { CellValue } from '@/types/cellValue'
import { HolySheetsCredentials, AuthClient } from '@/types/credentials'

export class GoogleSheetsService implements IGoogleSheetsService {
  private readonly sheets: sheets_v4.Sheets
  private readonly spreadsheetId: string
  private readonly auth: AuthClient

  constructor(credentials: HolySheetsCredentials) {
    this.spreadsheetId = credentials.spreadsheetId
    this.sheets = google.sheets({ version: 'v4', auth: credentials.auth })
    this.auth = credentials.auth
  }

  /**
   * Gets the authentication client used to access the Google Sheets API.
   *
   * @returns {AuthClient} The authentication client.
   */
  getAuth(): AuthClient {
    return this.auth
  }

  async getValues(range: string): Promise<CellValue[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      })
      return (response.data.values as CellValue[][]) || []
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error getting values: ${error.message}`)
      }
      throw new Error('An unknown error occurred while getting values.')
    }
  }

  async batchGetValues(
    ranges: string[]
  ): Promise<{ valueRanges: { range: string; values?: CellValue[][] }[] }> {
    try {
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: this.spreadsheetId,
        ranges
      })
      return {
        valueRanges: response.data.valueRanges as {
          range: string
          values?: CellValue[][]
        }[]
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error performing batch get: ${error.message}`)
      }
      throw new Error('An unknown error occurred during batch get.')
    }
  }

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
        requestBody: { values }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error updating values: ${error.message}`)
      }
      throw new Error('An unknown error occurred while updating values.')
    }
  }

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

  async batchClearValues(ranges: string[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.batchClear({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          ranges
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error performing batch clear: ${error.message}`)
      }
      throw new Error('An unknown error occurred during batch clear.')
    }
  }

  /**
   * Gets the complete metadata of the spreadsheet.
   *
   * @returns A promise that resolves with the spreadsheet metadata.
   */
  async getSpreadsheet(): Promise<sheets_v4.Schema$Spreadsheet> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        includeGridData: false
      })
      if (!response.data) {
        throw new Error('Spreadsheet data is undefined.')
      }
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error getting spreadsheet: ${error.message}`)
      }
      throw new Error(
        'An unknown error occurred while getting the spreadsheet.'
      )
    }
  }

  /**
   * Gets the sheet ID from the name.
   *
   * @param sheetName - The name of the sheet.
   * @returns The sheet ID.
   */
  private async getSheetId(sheetName: string): Promise<number> {
    try {
      const spreadsheet = await this.getSpreadsheet()
      const sheet = spreadsheet.sheets?.find(
        s => s.properties?.title === sheetName
      )

      if (!sheet?.properties?.sheetId) {
        throw new Error(`Sheet with name "${sheetName}" not found.`)
      }

      return sheet.properties.sheetId
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error getting sheetId: ${error.message}`)
      }
      throw new Error('An unknown error occurred while getting sheetId.')
    }
  }

  /**
   * Deletes a range of rows in the specified sheet.
   *
   * @param sheetName - The name of the sheet from which the rows will be deleted.
   * @param startIndex - The starting index of the rows to be deleted (0-based, inclusive).
   * @param endIndex - The ending index of the rows to be deleted (0-based, exclusive).
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
   * Deletes multiple rows in the specified sheet in a single batch operation.
   *
   * @param sheetName - The name of the sheet from which the rows will be deleted.
   * @param rowIndices - An array of row indices to be deleted (0-based).
   * @returns A promise that resolves when all delete operations are complete.
   */
  async batchDeleteRows(
    sheetName: string,
    rowIndices: number[]
  ): Promise<void> {
    try {
      const sheetId = await this.getSheetId(sheetName)

      // Sort the row indices in descending order to avoid index shifting
      const sortedRowIndices = [...rowIndices].sort((a, b) => b - a)

      const requests = sortedRowIndices.map(rowIndex => ({
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1
          }
        }
      }))

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error performing batch delete: ${error.message}`)
      }
      throw new Error('An unknown error occurred during batch delete.')
    }
  }
}
