import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany/findMany'
import { CellValue } from '@/types/cellValue'

/**
 * Updates multiple records that match the given where clause using batchUpdate.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the updateMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the updateMany operation.
 * @param options.where - The where clause to filter records.
 * @param options.data - The data to update.
 * @returns A promise that resolves with an array of updated records.
 *
 * @example
 * ```typescript
 * await updateMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'active' },
 *   data: { status: 'inactive' }
 * });
 * ```
 */
export async function updateMany<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  }
): Promise<RecordType[]> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, data } = options

  // Find all records that match the 'where' clause
  const records = await findMany<RecordType>(
    { spreadsheetId, sheets, sheet },
    { where }
  )

  if (records.length === 0) {
    throw new Error('No records found to update')
  }

  // Prepare the data for batchUpdate
  const batchUpdateData: { range: string; values: CellValue[][] }[] =
    records.map(record => {
      const { range, data: fields } = record
      const updatedFields = { ...fields, ...data } as RecordType

      return {
        range,
        values: [Object.values(updatedFields)]
      }
    })

  try {
    await sheets.batchUpdateValues(batchUpdateData, 'RAW')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating records:', error.message) // eslint-disable-line no-console
      throw new Error(`Error updating records: ${error.message}`)
    }
    console.error('Error updating records:', error) // eslint-disable-line no-console
    throw new Error('An unknown error occurred while updating records.')
  }

  // Return the updated records
  return records.map(record => ({ ...record.data, ...data }) as RecordType)
}
