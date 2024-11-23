import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { CellValue } from '@/types/cellValue'

/**
 * Represents the options for writing data into a sheet.
 */
interface WriteOptions {
  range: string
  spreadsheetId: string
  values: CellValue[][]
  sheets: IGoogleSheetsService
}

/**
 * Inserts values into a Google Sheets spreadsheet.
 *
 * @param options - The options for inserting values.
 * @throws Error if the write operation fails.
 */
export async function write(options: WriteOptions): Promise<void> {
  const { range, values, sheets, spreadsheetId } = options
  try {
    const data = [
      {
        range,
        values
      }
    ]
    const valueInputOption: 'RAW' = 'RAW'
    await sheets.batchUpdateValues(data, valueInputOption)
    console.log(`[INSERT] Row inserted successfully`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`[INSERT] Error: ${error.message}`)
    } else {
      console.error(`[INSERT] An unknown error occurred.`)
    }
    throw error
  }
}
