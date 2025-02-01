import {
  OperationParams,
  OperationConfigs,
  OperationOptions
} from '@/base-operation/types/BaseOperation.types'
import { RecordSchema } from '@/types/RecordSchema.types'
import { HeaderService } from '@/services/header/HeaderService'
import {
  HeaderColumn,
  SingleColumn
} from '@/services/header/HeaderService.types'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { FetchingColumnsError } from '@/errors/FetchingColumnsError'
import { WhereService } from '@/services/where/WhereService'
import { InvalidWhereKeyError } from '@/errors/InvalidWhereKey'
import { RecordPostProcessor } from '@/services/record-post-processor/RecordPostProcessor'
import { SelectOmitConflictError } from '@/errors/SelectOmitConflictError'

export abstract class BaseSheetOperation<RecordType extends object> {
  protected headers: HeaderColumn[] = []
  protected sheet: string
  protected sheets: SheetsAdapterService
  protected spreadsheetId: string
  protected headerRow: number
  protected readonly schema: RecordSchema<RecordType> | null
  private headerService?: HeaderService

  constructor(
    protected params: OperationParams<RecordType>,
    protected options: OperationOptions<RecordType>,
    protected configs: OperationConfigs
  ) {
    this.sheet = params.sheet
    this.spreadsheetId = params.credentials.spreadsheetId
    this.headerRow = params.headerRow ?? 1
    this.schema = params.schema ?? null
    this.headers = params.headers
    this.sheets = params.sheets
  }

  public async executeOperation(): Promise<RecordType[]> {
    this.validate()
    await this.prepareHeaders()
    // console.log({ headers: this.headers }) // eslint-disable-line no-console
    const headerColumns = this.prepareWhere()
    // console.log({ headerColumns }) // eslint-disable-line no-console
    const columns = await this.fetchColumns(headerColumns)
    // console.log({ columns: JSON.stringify(columns) }) // eslint-disable-line no-console
    const rows = this.filterRows(columns)
    // console.log({ rows }) // eslint-disable-line no-console
    const records = await this.performMainAction(rows)
    const response = this.processResponse(records)
    // console.log({ response }) // eslint-disable-line no-console
    return response
  }

  private validate(): void {
    const { select, omit } = this.options
    if (select && omit) {
      throw new SelectOmitConflictError()
    }
  }

  private processResponse(records: RecordType[]): RecordType[] {
    const { select, omit } = this.options
    const processor = new RecordPostProcessor(
      {
        records,
        schema: this.schema
      },
      {
        select,
        omit
      }
    )
    return processor.process() as RecordType[]
  }

  protected abstract performMainAction(rows: number[]): Promise<RecordType[]>

  private filterRows(columns: SingleColumn[]): number[] {
    const whereService = new WhereService(
      this.options.where || {},
      columns,
      this.headerRow
    )
    return whereService.matches()
  }

  private async prepareHeaders(): Promise<void> {
    if (this.headers.length === 0) {
      this.headerService = HeaderService.getInstance(this.sheets)
      this.headers = await this.headerService.getHeaders(
        this.spreadsheetId,
        this.sheet,
        this.headerRow
      )
    }
  }

  private prepareWhere(): HeaderColumn[] {
    const where = this.options.where || {}
    const whereKeys = Object.keys(where || this.headers.map(h => h.header))

    const validWhereKeys = this.headers.filter(header =>
      whereKeys.includes(header.header)
    )
    whereKeys.forEach(whereKey => {
      if (!validWhereKeys.find(header => header.header === whereKey)) {
        throw new InvalidWhereKeyError(whereKey)
      }
    })
    return validWhereKeys.map(header => {
      const headerColumnIdx = this.headers.findIndex(
        h => h.header === header.header
      )
      return {
        header: header.header,
        column: headerColumnIdx
      }
    })
  }

  private async fetchColumns(
    userColumns: HeaderColumn[]
  ): Promise<SingleColumn[]> {
    const columns = userColumns.length > 0 ? userColumns : this.headers

    try {
      const columnsToFetch = columns.map(c => c.column)
      const values = await this.sheets.getMultipleColumns(
        this.sheet,
        columnsToFetch
      )
      return columns.map((column, idx) => ({
        header: column.header,
        values: values[idx]
      }))
    } catch {
      throw new FetchingColumnsError(this.sheet)
    }
  }
}
