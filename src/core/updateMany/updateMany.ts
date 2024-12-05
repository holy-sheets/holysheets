import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany/findMany'
import { CellValue } from '@/types/cellValue'
import { MetadataService } from '@/services/metadata/MetadataService'
import {
  IMetadataService,
  BatchOperationResult
} from '@/services/metadata/IMetadataService'
import { OperationConfigs } from '@/types/operationConfigs'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

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
 * @param configs - Optional configurations for the operation.
 * @returns A batch operation result containing updated records and metadata.
 *
 * @example
 * ```typescript
 * const result = await updateMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'active' },
 *   data: { status: 'inactive' }
 * }, {
 *   includeMetadata: true
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
  },
  configs?: OperationConfigs
): Promise<BatchOperationResult<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, data } = options
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Encontrar todos os registros que correspondem à cláusula 'where'
    const findResult = await findMany<RecordType>(
      { spreadsheetId, sheets, sheet },
      { where },
      { includeMetadata }
    )

    if (!findResult.data || findResult.data.length === 0) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = includeMetadata
        ? metadataService.createMetadata({
            operationType: 'update',
            spreadsheetId,
            sheetId: sheet,
            ranges: findResult.ranges || [],
            recordsAffected: 0,
            status: 'failure',
            error: ErrorMessages[ErrorCode.NoRecordFound],
            duration
          })
        : undefined
      return {
        data: [],
        rows: [],
        ranges: [],
        metadata
      }
    }

    const { data: records, rows, ranges } = findResult

    // Preparar os dados para batchUpdate
    const batchUpdateData = records.map((record, index) => {
      const updatedFields = { ...record, ...data } as RecordType
      if (!ranges) {
        throw new Error('Ranges are undefined or null')
      }
      return {
        range: ranges[index],
        values: [Object.values(updatedFields)]
      }
    })

    // Atualizar os registros usando batchUpdateValues
    await sheets.batchUpdateValues(batchUpdateData, 'RAW')

    const duration = metadataService.calculateDuration(startTime)
    const metadata = includeMetadata
      ? metadataService.createMetadata({
          operationType: 'update',
          spreadsheetId,
          sheetId: sheet,
          ranges: ranges as string[],
          recordsAffected: records.length,
          status: 'success',
          duration
        })
      : undefined

    // Retornar os registros atualizados
    const updatedRecords = records.map(
      record => ({ ...record, ...data }) as RecordType
    )
    return {
      data: updatedRecords,
      rows,
      ranges,
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
        operationType: 'update',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        error: errorMessage,
        duration
      })
      return {
        data: undefined,
        rows: undefined,
        ranges: undefined,
        metadata
      }
    }
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred while updating records.')
  }
}
