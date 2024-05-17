import { sheets_v4 } from 'googleapis'
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

interface HollySheetsCredentials {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
}

type SheetColumn = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | 'AA' | 'AB' | 'AC' | 'AD' | 'AE' | 'AF' | 'AG' | 'AH' | 'AI' | 'AJ' | 'AK' | 'AL' | 'AM' | 'AN' | 'AO' | 'AP' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AV' | 'AW' | 'AX' | 'AY' | 'AZ'
const alphabet: SheetColumn[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ']

const indexToColumn = (index: number): SheetColumn => {  
  return alphabet[index]
}

interface SheetHeaders {
  column: SheetColumn
  name: string
  index: number
} 
/**
 * Deconstructs a record object into an array of values based on the provided headers.
 * 
 * @template RecordType - The type of the record object.
 * @param {RecordType} record - The record object to deconstruct.
 * @param {SheetHeaders[]} headers - The headers to use for deconstruction.
 * @returns {(string | number)[]} - An array of deconstructed values.
 */
const decombine = <RecordType extends Record<string, string>>(record: RecordType, headers: SheetHeaders[]): string[] => {
  const valuesForRow: string[] = []
  headers.forEach(header => {
    const isValidType = typeof record[header.name] === 'string' || typeof record[header.name] === 'number' || typeof record[header.name] === 'boolean'
    valuesForRow.push(isValidType ? record[header.name] : '')
  })
  return valuesForRow
}

/**
 * Retrieves the headers of a specified table from a Google Sheets document.
 * @param options - The options for retrieving the headers.
 * @param options.table - The name of the table.
 * @returns A promise that resolves to an array of SheetHeaders representing the headers of the table.
 */
async function getHeaders<TableName extends string>(options: {table: TableName, sheets: sheets_v4.Sheets, spreadsheetId: string}): Promise<SheetHeaders[]> {
  const { table, sheets, spreadsheetId } = options    
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${table}!1:1`
    })
  
    const values = response.data.values
  
    if (values) {
      return values[0].map((name: string, index: number) => (
        { column: indexToColumn(index), name, index }
      ))
    } else {
        console.log('There are no headers in the sheet.') // eslint-disable-line
      return []
    }
  } catch (error) {
      console.error(`Error getting headers: ${error}`) // eslint-disable-line
    throw error
  }
}

/**
 * Represents the options for writing data into a sheet.
 */
interface WriteOptions {
    tableName?: string;
    range: string;  
    spreadsheetId: string;  
    values: (string | number)[][];
    sheets: sheets_v4.Sheets;
}
/**
 * Inserts values into a Google Sheets spreadsheet.
 * @param options - The options for inserting values.
 * @throws Error if the SPREADSHEET_ID environment variable is missing.
 */
async function write(options: WriteOptions): Promise<void> {  
  const { range, values, tableName, sheets, spreadsheetId } = options
  const rangeWithSheet = `${tableName}!${range}`
  const completeRange = tableName ? rangeWithSheet : range
  try {
    const request = {
      spreadsheetId,
      resource: {
        data: [
          {
            range: completeRange,
            values
          }
        ],
        valueInputOption: 'RAW'
      }
    } 
    console.log(`[INSERT] Row inserted successfully`) // eslint-disable-line
    await sheets.spreadsheets.values.batchUpdate(request)          
  } catch (error) {
    console.error(`[INSERT] Error: ${error}`) // eslint-disable-line
    throw error
  }
}

/**
 * Represents a wrapper class for interacting with Google Sheets using the Google Sheets API.
 * @typeparam RecordType - The type of the records in the table.
 */
export default class HollySheets<RecordType extends Record<string, any> = any> {
  public static sheets: sheets_v4.Sheets
  public table: string = ''
  public static spreadsheetId: string = ''
  private readonly credentials: HollySheetsCredentials

  /**
     * Creates a new instance of the HollySheets class.
     * @param credentials - The credentials required to authenticate with the Google Sheets API.
  */
  constructor(credentials: HollySheetsCredentials) {
    this.credentials = credentials

    const auth = new JWT({
      email: credentials.clientEmail,
      key: credentials.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    HollySheets.spreadsheetId = credentials.spreadsheetId
    HollySheets.sheets = google.sheets({ version: 'v4', auth })
  }

  /**
     * Creates a new instance of HollySheets with the specified table.
     * @param table - The name of the table to use.
     * @returns A new instance of HollySheets with the specified table.
     * @typeparam T - The type of the records in the table.
  */
  public base<T extends Record<string, any>>(table: string): HollySheets<T> {
    const instance = new HollySheets<T>(this.credentials)
    instance.setTable(table)
    return instance
  }

  private setTable(table: string) {
    this.table = table
  }

  /**
     * Inserts data into the spreadsheet.
     * @param options - The options for inserting data.
     * @param options.data - The data to be inserted.
     * @returns A Promise that resolves when the data is successfully inserted.
     * @throws An error if no data is found in the sheet.
  */
  public async insert(options: { data: RecordType[] }) {
    const { data } = options
    const table = this.table
    const response = await HollySheets.sheets.spreadsheets.values.get({
      spreadsheetId: HollySheets.spreadsheetId,
      range: `${table}!${alphabet[0]}:${alphabet[alphabet.length - 1]}`
    })

    if(!response.data.values) {
      throw new Error('No data found in the sheet.')
    }
    const lastLine = response.data.values.length
    const headers = await getHeaders({ table, sheets: HollySheets.sheets, spreadsheetId: HollySheets.spreadsheetId})
    const valuesFromRecords = data.map(record => decombine(record, headers))  
    const range = `A${lastLine + 1}:${indexToColumn(headers.length - 1)}${lastLine + valuesFromRecords.length}`
    await write({
      tableName: table,
      range,
      values: valuesFromRecords,
      spreadsheetId: HollySheets.spreadsheetId,
      sheets: HollySheets.sheets
    })
  }
}
