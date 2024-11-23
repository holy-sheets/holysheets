import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'

/**
 * Retrieves the sheet ID for the given sheet title.
 *
 * @param params - The parameters for getting the sheet ID.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.title - The title of the sheet.
 * @returns A promise that resolves with the sheet ID.
 *
 * @example
 * ```typescript
 * const sheetId = await getSheetId({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   title: 'Sheet1'
 * });
 * ```
 */
export async function getSheetId(params: {
  spreadsheetId: string
  sheets: IGoogleSheetsService
  title: string
}): Promise<number> {
  const { spreadsheetId, sheets, title } = params

  try {
    // Retrieve the entire spreadsheet metadata using the interface method
    const spreadsheet = await sheets.getSpreadsheet()

    // Find the sheet with the matching title
    const sheet = spreadsheet.sheets?.find(
      sheet => sheet.properties?.title === title
    )

    if (!sheet?.properties?.sheetId) {
      throw new Error(`No sheet found with title: ${title}`)
    }

    return sheet.properties.sheetId
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error retrieving sheet ID:', error.message)
      throw new Error(`Error retrieving sheet ID: ${error.message}`)
    }
    console.error('Error retrieving sheet ID:', error)
    throw new Error('An unknown error occurred while retrieving sheet ID.')
  }
}
