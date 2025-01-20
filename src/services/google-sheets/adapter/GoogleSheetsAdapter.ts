import { AuthClient, HolySheetsCredentials } from '@/types/credentials'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { google, sheets_v4 } from 'googleapis'
import { IGoogleSheetsService } from '../IGoogleSheetsService'
import { GoogleSheetsService } from '../GoogleSheetsService'
import {
  getSingleColumnNotation,
  getSingleRowNotation
} from '../helpers/notation'

export class GoogleSheetsAdapter implements SheetsAdapterService {
  private readonly sheets: sheets_v4.Sheets
  private readonly spreadsheetId: string
  private readonly sheetService: IGoogleSheetsService

  constructor(credentials: HolySheetsCredentials, sheets?: sheets_v4.Sheets) {
    this.spreadsheetId = credentials.spreadsheetId
    this.sheets =
      sheets ?? google.sheets({ version: 'v4', auth: credentials.auth })
    this.sheetService = new GoogleSheetsService(credentials, this.sheets)
  }

  async getSingleRow(sheetName: string, rowIndex: number): Promise<string[]> {
    const notation = getSingleRowNotation(sheetName, rowIndex)
    return this.sheetService.getValues(notation).then(values => values[0])
  }

  async getMultipleRows(
    sheetName: string,
    rowIndexes: number[]
  ): Promise<string[][]> {
    const notations = rowIndexes.map(index =>
      getSingleRowNotation(sheetName, index)
    )
    const response = await this.sheetService.batchGetValues(notations)
    return response.map(row => row[0])
  }

  async getMultipleColumns(
    sheetName: string,
    columnIndexes: number[]
  ): Promise<string[][]> {
    const notations = columnIndexes.map(index =>
      getSingleColumnNotation(sheetName, index)
    )
    const response = await this.sheetService.batchGetValues(notations)
    return response.map(column => column.map(cell => cell[0]))
  }
  async getSpreadsheet(): Promise<sheets_v4.Schema$Spreadsheet> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId
    })
    return response.data
  }
  getAuth(): AuthClient {
    return this.sheetService.getAuth()
  }
}
