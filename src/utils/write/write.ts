import { sheets_v4 } from 'googleapis'
import { addSheetToRange } from '../rangeUtils/rangeUtils'

/**
 * Represents the options for writing data into a sheet.
 */
interface WriteOptions {
  tableName?: string
  range: string
  spreadsheetId: string
  values: (string | number)[][]
  sheets: sheets_v4.Sheets
}
/**
 * Inserts values into a Google Sheets spreadsheet.
 * @param options - The options for inserting values.
 * @throws Error if the SPREADSHEET_ID environment variable is missing.
 */
export async function write(options: WriteOptions): Promise<void> {
  const { range, values, tableName, sheets, spreadsheetId } = options
  const completeRange = tableName
    ? addSheetToRange({ sheet: tableName, range })
    : range
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
