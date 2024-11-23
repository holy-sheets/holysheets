import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { SheetHeaders } from '@/types/headers'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import { CellValue } from '@/types/cellValue'
import { createFirstRowRange } from '@/utils/rangeUtils/rangeUtils'

/**
 * Retrieves the headers of a specified sheet from a Google Sheets document.
 * @param options - The options for retrieving the headers.
 * @param options.sheet - The name of the sheet.
 * @param options.sheets - The Google Sheets service interface.
 * @param options.spreadsheetId - The ID of the spreadsheet.
 * @returns A promise that resolves to an array of SheetHeaders representing the headers of the sheet.
 */
export async function getHeaders<SheetName extends string>(options: {
  sheet: SheetName
  sheets: IGoogleSheetsService
  spreadsheetId: string
}): Promise<SheetHeaders[]> {
  const { sheet, sheets } = options
  try {
    const range = createFirstRowRange(sheet)
    const values: CellValue[][] = await sheets.getValues(range)

    if (values && values.length > 0) {
      return values[0].map((name, index) => ({
        column: indexToColumn(index),
        name: String(name),
        index
      }))
    } else {
      console.log('There are no headers in the sheet.') // eslint-disable-line
      return []
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error getting headers: ${error.message}`) // eslint-disable-line
      throw new Error(`Error getting headers: ${error.message}`)
    }
    console.error('An unknown error occurred while getting headers.') // eslint-disable-line
    throw new Error('An unknown error occurred while getting headers.')
  }
}
