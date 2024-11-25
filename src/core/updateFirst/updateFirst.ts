import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { OperationError } from '@/services/errors/errors'
import { WhereClause } from '@/types/where'
import { getHeaders } from '@/utils/headers/headers'
import { CellValue } from '@/types/cellValue'
import { findFirst } from '@/core/findFirst/findFirst'
import {
  IMetadataService,
  OperationResult
} from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { OperationConfigs } from '@/types/operationConfigs'

/**
 * Updates the first record that matches the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the updateFirst operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the updateFirst operation.
 * @param options.where - The where clause to filter records.
 * @param options.data - The data to update.
 * @param configs - Configuration options for the operation.
 * @returns An object containing the updated record and optionally metadata, or undefined if no match is found.
 *
 * @example
 * ```typescript
 * const result = await updateFirst<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { id: '123' },
 *   data: { status: 'inactive' }
 * }, { includeMetadata: true });
 *
 * if (result) {
 *   console.log(result.data); // The updated record
 *   console.log(result.metadata); // Operation metadata
 * }
 * ```
 */
export async function updateFirst<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  },
  configs?: OperationConfigs
): Promise<OperationResult<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, data } = options
  const { includeMetadata = false } = configs ?? {}

  // Initialize MetadataService
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()
  try {
    // Find the first matching record
    const findResult = await findFirst<RecordType>(
      { spreadsheetId, sheets, sheet },
      { where },
      { includeMetadata }
    )

    if (!findResult || !findResult.data || !findResult.range) {
      if (includeMetadata && findResult && findResult.metadata) {
        // No record found, return metadata indicating failure
        return {
          data: undefined,
          metadata: findResult.metadata,
          row: undefined,
          range: undefined
        }
      }
      return { data: undefined, row: undefined, range: undefined }
    }

    const rowRange = findResult.range

    // Get the headers to correctly map the fields
    const headers = await getHeaders({
      sheet,
      sheets,
      spreadsheetId
    })

    // Map the updated values based on the headers
    const updatedValues: string[] = headers.map(header => {
      return data[header.name] !== undefined
        ? String(data[header.name])
        : findResult.data
          ? String(findResult.data[header.name])
          : ''
    })

    // Update the values in the spreadsheet
    await sheets.updateValues(rowRange, [updatedValues], 'RAW')

    // Combine the existing fields with the updated data
    const updatedRecord = { ...findResult.data, ...data } as RecordType
    if (includeMetadata) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = metadataService.createMetadata(
        'update',
        spreadsheetId,
        sheet,
        [rowRange],
        1,
        'success'
      )
      metadata.duration = duration
      return {
        data: updatedRecord,
        metadata,
        row: findResult.row,
        range: rowRange
      }
    }

    return { data: updatedRecord, row: findResult.row, range: rowRange }
  } catch (error: unknown) {
    if (includeMetadata) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = metadataService.createMetadata(
        'update',
        spreadsheetId,
        sheet,
        [],
        0,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      )
      metadata.duration = duration

      return { data: undefined, metadata, row: undefined, range: undefined }
    }

    // Re-throw the error if metadata is not requested
    if (error instanceof Error) {
      console.error('Error updating data:', error.message) // eslint-disable-line no-console
      throw new OperationError(`Error updating data: ${error.message}`, {
        operationId: metadataService.generateOperationId(),
        timestamp: new Date().toISOString(),
        duration: metadataService.calculateDuration(startTime),
        recordsAffected: 0,
        status: 'failure',
        operationType: 'update',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: error.message,
        userId: undefined // Replace with actual userId if available
      })
    }

    console.error('Error updating data:', error) // eslint-disable-line no-console
    throw new OperationError('An unknown error occurred while updating data.', {
      operationId: metadataService.generateOperationId(),
      timestamp: new Date().toISOString(),
      duration: metadataService.calculateDuration(startTime),
      recordsAffected: 0,
      status: 'failure',
      operationType: 'update',
      spreadsheetId,
      sheetId: sheet,
      ranges: [],
      error: 'Unknown error'
    })
  }
}
