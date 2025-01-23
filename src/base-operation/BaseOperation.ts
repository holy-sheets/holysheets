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

export abstract class BaseSheetOperation<RecordType> {
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
    await this.prepareHeaders()
    // console.log({ headers: this.headers }) // eslint-disable-line no-console
    const headerColumns = this.prepareWhere()
    // console.log({ headerColumns }) // eslint-disable-line no-console
    const columns = await this.fetchColumns(headerColumns)
    // console.log({ columns: JSON.stringify(columns) }) // eslint-disable-line no-console
    const rows = this.filterRows(columns)
    // console.log({ rows }) // eslint-disable-line no-console
    return await this.performMainAction(rows)
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
    if (!this.options.where) {
      throw new Error('Where clause is required')
    }
    const whereKeys = Object.keys(this.options.where)
    const validWhereKeys = this.headers.filter(header =>
      whereKeys.includes(header.header)
    )
    // eslint-disable-next-line no-console
    console.log({
      headers: this.headers,
      whereKeys,
      validWhereKeys
    })
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

  private async fetchColumns(columns: HeaderColumn[]): Promise<SingleColumn[]> {
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
