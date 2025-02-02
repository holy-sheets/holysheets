import { sheets_v4, google } from 'googleapis'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { CellValue } from '@/types/cellValue'
import { HolySheetsCredentials } from '@/services/google-sheets/types/credentials.type'
import { AuthClient } from '@/services/google-sheets/types/credentials.type'
import { SheetNotFoundError } from '@/errors/SheetNotFoundError'
import { AuthenticationError } from '@/errors/AuthenticationError'
import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class GoogleSheetsService implements IGoogleSheetsService {
  private readonly sheets: sheets_v4.Sheets
  private readonly spreadsheetId: string
  private readonly auth: AuthClient

  constructor(credentials: HolySheetsCredentials, sheets?: sheets_v4.Sheets) {
    this.spreadsheetId = credentials.spreadsheetId
    this.sheets =
      sheets ?? google.sheets({ version: 'v4', auth: credentials.auth })
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

  async getValues(range: string): Promise<string[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      })
      return (response.data.values as string[][]) || []
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('unable to parse range')) {
          const [sheetName] = range.split('!')
          throw new SheetNotFoundError(sheetName)
        } else if (
          errorMessage.includes('authorization') ||
          errorMessage.includes('auth')
        ) {
          throw new AuthenticationError()
        } else {
          throw new HolySheetsError(
            `Error getting values: ${error.message}`,
            ErrorCodes.FETCH_COLUMNS_ERROR
          )
        }
      }
      throw new HolySheetsError(
        'An unknown error occurred while getting values.',
        ErrorCodes.UNKNOWN_ERROR
      )
    }
  }

  /**
   * Performs a batch get operation for the specified ranges and returns an array
   * of parsed values for each range.
   *
   * @param ranges Array of A1 notation ranges.
   * @returns A promise that resolves to an array where each element is a string[][]
   *          representing the values of a particular range.
   *
   * @throws SheetNotFoundError, AuthenticationError, or HolySheetsError in case of errors.
   */
  async batchGetValues(ranges: string[]): Promise<string[][][]> {
    try {
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: this.spreadsheetId,
        ranges
      })

      // Se response.data.valueRanges for indefinido, retorne um array vazio
      const valueRanges = response.data.valueRanges ?? []

      // Mapeia cada range para um string[][] (ou um array vazio, se nenhum valor for retornado)
      const results: string[][][] = valueRanges.map(vr => {
        return (vr.values as string[][]) || []
      })

      return results
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('unable to parse range')) {
          // Para batchGet, podemos escolher a primeira range para extrair o sheetName
          const [sheetName] = ranges[0].split('!')
          throw new SheetNotFoundError(sheetName)
        } else if (
          errorMessage.includes('authorization') ||
          errorMessage.includes('auth')
        ) {
          throw new AuthenticationError()
        } else {
          throw new HolySheetsError(
            `Error performing batch get: ${error.message}`,
            ErrorCodes.FETCH_COLUMNS_ERROR
          )
        }
      }
      throw new HolySheetsError(
        'An unknown error occurred during batch get.',
        ErrorCodes.UNKNOWN_ERROR
      )
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
                  sheetId,
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

  async batchDeleteRows(
    sheetName: string,
    rowIndices: number[]
  ): Promise<void> {
    try {
      const sheetId = await this.getSheetId(sheetName)
      const sortedRowIndices = [...rowIndices].sort((a, b) => b - a)
      const requests = sortedRowIndices.map(rowIndex => ({
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1
          }
        }
      }))
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: { requests }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error performing batch delete: ${error.message}`)
      }
      throw new Error('An unknown error occurred during batch delete.')
    }
  }
}
