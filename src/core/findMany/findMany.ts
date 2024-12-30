import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import {
  createSingleColumnRange,
  createSingleRowRange
} from '@/utils/rangeUtils/rangeUtils'
import { CellValue } from '@/types/cellValue'
import { OperationConfigs } from '@/types/operationConfigs'
import { MetadataService } from '@/services/metadata/MetadataService'
import {
  IMetadataService,
  RawBatchOperationResult
} from '@/services/metadata/IMetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'
import { FindOperationOptions } from '@/types/operationOptions'

/**
 * Finds multiple records that match the given where clause.
 *
 * @typeparam RecordType - The type of the records in the table.
 * @param params - The parameters for the findMany operation.
 * @param params.spreadsheetId - The ID of the spreadsheet.
 * @param params.sheets - The Google Sheets service interface.
 * @param params.sheet - The name of the sheet.
 * @param options - The options for the findMany operation.
 * @param options.where - The where clause to filter records.
 * @param options.select - The select clause to specify fields to return.
 * @param configs - Optional configurations for the operation.
 * @returns A batch operation result containing matching records and metadata.
 *
 * @example
 * ```typescript
 * const records = await findMany<RecordType>({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   sheets: googleSheetsServiceInstance,
 *   sheet: 'Sheet1'
 * }, {
 *   where: { status: 'active' },
 *   select: { name: true, email: true }
 * }, {
 *   includeMetadata: true
 * });
 * ```
 */
export async function findMany<RecordType extends Record<string, CellValue>>(
  params: {
    spreadsheetId: string
    sheets: IGoogleSheetsService
    sheet: string
  },
  options: FindOperationOptions<RecordType>,
  configs?: OperationConfigs
): Promise<RawBatchOperationResult<RecordType>> {
  const { spreadsheetId, sheets, sheet } = params
  const { where, select, omit } = options
  if (select && omit) {
    throw new Error(ErrorMessages.SELECT_AND_OMIT_FORBIDDEN)
  }
  const { includeMetadata = false } = configs ?? {}
  const metadataService: IMetadataService = new MetadataService()
  const startTime = Date.now()

  try {
    // Obter os cabeçalhos da planilha
    const headers = await getHeaders({
      sheet,
      sheets,
      spreadsheetId
    })

    // Extrair as colunas do 'where' clause
    const columns = Object.keys(where) as (keyof RecordType)[]
    const firstColumn = columns[0]

    // Encontrar o cabeçalho correspondente à primeira coluna do 'where'
    const header = headers.find(header => header.name === firstColumn)

    if (!header) {
      const errorMessage = `Header not found for column ${String(firstColumn)}`
      const duration = metadataService.calculateDuration(startTime)
      if (includeMetadata) {
        const metadata = metadataService.createMetadata({
          operationType: 'find',
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
      throw new Error(errorMessage)
    }

    // Criar o range para a coluna específica
    const range = createSingleColumnRange({
      sheet,
      column: header.column
    })

    // Obter os valores da coluna específica
    const values: CellValue[][] = await sheets.getValues(range)

    // Encontrar os índices das linhas que atendem ao filtro
    const rowIndexes = values.reduce((acc: number[], row, index) => {
      const filter = where[firstColumn]
      if (
        filter !== undefined &&
        checkWhereFilter(filter, row[0] as string | undefined)
      ) {
        acc.push(index)
      }
      return acc
    }, [])

    if (!rowIndexes || rowIndexes.length === 0) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = includeMetadata
        ? metadataService.createMetadata({
            operationType: 'find',
            spreadsheetId,
            sheetId: sheet,
            ranges: [range],
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

    // Criar os ranges para as linhas encontradas
    const ranges = rowIndexes.map(index =>
      createSingleRowRange({
        sheet,
        row: index + 1,
        lastColumnIndex: headers.length - 1
      })
    )

    // Obter os valores das linhas específicas usando batchGetValues
    const batchGetResponse = await sheets.batchGetValues(ranges)

    if (!batchGetResponse.valueRanges) {
      const duration = metadataService.calculateDuration(startTime)
      const metadata = includeMetadata
        ? metadataService.createMetadata({
            operationType: 'find',
            spreadsheetId,
            sheetId: sheet,
            ranges,
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

    // Combinar os valores com os cabeçalhos selecionados
    const resultData: RecordType[] = batchGetResponse.valueRanges.map(
      valueRange => {
        const selectedHeaders = headers.filter(header =>
          select ? select[header.name] : !omit || !omit[header.name]
        )
        const data = combine<RecordType>(
          valueRange.values
            ? (valueRange.values[0].filter(value => value !== null) as string[])
            : [],
          selectedHeaders
        )
        return data
      }
    )

    const duration = metadataService.calculateDuration(startTime)
    const metadata = includeMetadata
      ? metadataService.createMetadata({
          operationType: 'find',
          spreadsheetId,
          sheetId: sheet,
          ranges,
          recordsAffected: resultData.length,
          status: 'success',
          duration
        })
      : undefined

    return {
      data: resultData,
      rows: rowIndexes.map(index => index + 1),
      ranges: ranges,
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
        operationType: 'find',
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
      : new Error('An unknown error occurred while finding data.')
  }
}
