import { sheets_v4 } from 'googleapis'
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

interface HollySheetsCredentials {
  clientEmail: string
  privateKey: string
}

export default class HollySheets<RecordType extends Record<string, any> = any> {
  public static sheets: sheets_v4.Sheets
  public table: string = ''
  private readonly credentials: HollySheetsCredentials

  constructor(credentials: HollySheetsCredentials) {
    this.credentials = credentials

    const auth = new JWT({
      email: credentials.clientEmail,
      key: credentials.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    HollySheets.sheets = google.sheets({ version: 'v4', auth })
  }

  public base<T extends Record<string, any>>(table: string): HollySheets<T> {
    const instance = new HollySheets<T>(this.credentials)
    instance.setTable(table)
    return instance
  }

  private setTable(table: string) {
    this.table = table
  }

  public insert(data: Partial<RecordType>) {
    console.log(data) // eslint-disable-line
  }
}
