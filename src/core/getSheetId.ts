import { sheets_v4 } from 'googleapis'

/**
 * Retrieves the sheet ID for the given sheet title.
 *
 * @param params - The parameters for getting the sheet ID.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets API client.
 * @param params.title - The title of the sheet.
 * @returns The sheet ID.
 *
 * @example
 * ```typescript
 * const sheetId = await getSheetId({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsClient,
 *   title: 'Sheet1'
 * });
 * ```
 */
export async function getSheetId(params: {
  spreadsheetId: string
  sheets: sheets_v4.Sheets
  title: string
}): Promise<number> {
  const { spreadsheetId, sheets, title } = params

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: false
  })

  const sheet = response.data.sheets?.find(
    sheet => sheet.properties?.title === title
  )

  if (!sheet || !sheet.properties?.sheetId) {
    throw new Error(`No sheet found with title: ${title}`)
  }

  return sheet.properties.sheetId
}
