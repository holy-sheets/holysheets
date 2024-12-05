import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'

import { OperationConfigs } from '@/types/operationConfigs'
import { MetadataService } from '@/services/metadata/MetadataService'
import {
  IMetadataService,
  OperationResult
} from '@/services/metadata/IMetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

/**
 * Retrieves the sheet ID for the given sheet title.
 *
 * @param params - The parameters for getting the sheet ID.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.title - The title of the sheet.
 * @param configs - Optional configurations for the operation.
 * @returns An operation result containing the sheet ID and metadata.
 *
 * @example
 * ```typescript
 * const result = await getSheetId({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   title: 'Sheet1',
 * }, {
 *   includeMetadata: true,
 * });
 *
 * if (result.metadata?.status === 'success') {
 *   console.log('Sheet ID:', result.data);
 * } else {
 *   console.error('Failed to retrieve sheet ID:', result.metadata?.error);
 * }
 * ```
 */
export async function getSheetId(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    title: string
  },
  configs?: OperationConfigs
): Promise<OperationResult<number>> {
  const { spreadsheetId, sheets, title } = params
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Retrieve the entire spreadsheet metadata using the interface method
    const spreadsheet = await sheets.getSpreadsheet()

    // Find the sheet with the matching title
    const sheet = spreadsheet.sheets?.find(
      sheet => sheet.properties?.title === title
    )

    if (!sheet?.properties?.sheetId) {
      const errorMessage = `No sheet found with title: ${title}`
      const duration = metadataService.calculateDuration(startTime)
      if (includeMetadata) {
        const metadata = metadataService.createMetadata({
          operationType: 'getSheetId',
          spreadsheetId,
          sheetId: title,
          ranges: [],
          recordsAffected: 0,
          status: 'failure',
          error: errorMessage,
          duration
        })
        return {
          data: undefined,
          row: undefined,
          range: undefined,
          metadata
        }
      }
      throw new Error(errorMessage)
    }

    const sheetId = sheet.properties.sheetId
    const duration = metadataService.calculateDuration(startTime)
    const metadata = includeMetadata
      ? metadataService.createMetadata({
          operationType: 'getSheetId',
          spreadsheetId,
          sheetId: title,
          ranges: [],
          recordsAffected: 0,
          status: 'success',
          duration
        })
      : undefined

    return {
      data: sheetId,
      row: undefined,
      range: undefined,
      metadata
    }
  } catch (error: unknown) {
    const duration = metadataService.calculateDuration(startTime)
    const errorMessage =
      error instanceof Error
        ? error.message
        : ErrorMessages[ErrorCode.UnknownError]
    if (includeMetadata) {
      const metadata = metadataService.createMetadata({
        operationType: 'getSheetId',
        spreadsheetId,
        sheetId: title,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        error: errorMessage,
        duration
      })
      return {
        data: undefined,
        row: undefined,
        range: undefined,
        metadata
      }
    }
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred while retrieving sheet ID.')
  }
}
