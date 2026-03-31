import { OperationOptions } from '@/operations/types/BaseOperation.types'
import { RecordSchema } from '@/types/RecordSchema.types'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import { WhereClause } from '@/services/where/types/where.types'
import { VisualizationQueryBuilder } from '@/services/visualization/VisualizationQueryBuilder'
import { PublicVisualizationQueryService } from '@/services/visualization/VisualizationQueryService'
import { parseRecords } from '@/helpers/parseRecords'
import { RecordPostProcessor } from '@/services/record-post-processor/RecordPostProcessor'
import { SelectOmitConflictError } from '@/errors/SelectOmitConflictError'

export interface FindPublicOperationParams<RecordType> {
  spreadsheetId: string
  sheet: string
  headerRow: number
  headers: HeaderColumn[]
  schema?: RecordSchema<RecordType>
}

export class FindPublicOperation<RecordType extends object> {
  private readonly spreadsheetId: string
  private readonly sheet: string
  private readonly headerRow: number
  private readonly headers: HeaderColumn[]
  private readonly schema: RecordSchema<RecordType> | null
  private readonly options: OperationOptions<RecordType>
  private readonly slice: [start: number, end?: number]

  constructor(
    params: FindPublicOperationParams<RecordType>,
    options: OperationOptions<RecordType>,
    slice: [start: number, end?: number] = [0]
  ) {
    this.spreadsheetId = params.spreadsheetId
    this.sheet = params.sheet
    this.headerRow = params.headerRow
    this.headers = params.headers
    this.schema = params.schema ?? null
    this.options = options
    this.slice = slice
  }

  public async execute(): Promise<RecordType[]> {
    if (this.options.select && this.options.omit) {
      throw new SelectOmitConflictError()
    }

    const where = (this.options.where ?? {}) as WhereClause<RecordType>
    const queryBuilder = new VisualizationQueryBuilder<RecordType>(
      where,
      this.headers
    )
    const gvizQuery = queryBuilder.build()

    const service = new PublicVisualizationQueryService(this.spreadsheetId)
    const rows = await service.query(this.sheet, gvizQuery, this.headerRow)

    const records = parseRecords<RecordType>(
      rows,
      this.headers,
      this.schema || []
    )

    const sliced = records.slice(...this.slice)

    const processor = new RecordPostProcessor(
      { records: sliced, schema: this.schema },
      { select: this.options.select, omit: this.options.omit }
    )
    return processor.process() as RecordType[]
  }
}
