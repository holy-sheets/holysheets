import { sheets_v4 } from 'googleapis'
import { SheetHeaders } from '../types/headers'
import { indexToColumn } from './columnUtils'

/**
 * Retrieves the headers of a specified table from a Google Sheets document.
 * @param options - The options for retrieving the headers.
 * @param options.table - The name of the table.
 * @returns A promise that resolves to an array of SheetHeaders representing the headers of the table.
 */
export async function getHeaders<SheetName extends string>(options: {
  sheet: SheetName
  sheets: sheets_v4.Sheets
  spreadsheetId: string
}): Promise<SheetHeaders[]> {
  const { sheet, sheets, spreadsheetId } = options
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheet}!1:1`
    })

    const values = response.data.values

    if (values) {
      return values[0].map((name: string, index: number) => ({
        column: indexToColumn(index),
        name,
        index
      }))
    } else {
      console.log('There are no headers in the sheet.') // eslint-disable-line
      return []
    }
  } catch (error) {
    console.error(`Error getting headers: ${error}`) // eslint-disable-line
    throw error
  }
}
