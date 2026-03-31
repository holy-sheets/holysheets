import {
  OperationParams,
  OperationConfigs,
  OperationOptionsWithSlice
} from '@/operations/types/BaseOperation.types'
import { RecordSchema } from '@/types/RecordSchema.types'
import { HeaderService } from '@/services/header/HeaderService'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { RecordPostProcessor } from '@/services/record-post-processor/RecordPostProcessor'
import { SelectOmitConflictError } from '@/errors/SelectOmitConflictError'

export abstract class BaseOperation<RecordType extends object> {
  protected headers: HeaderColumn[] = []
  protected sheet: string
  protected sheets: SheetsAdapterService
  protected spreadsheetId: string
  protected headerRow: number
  protected readonly schema: RecordSchema<RecordType> | null
  protected readonly slice: [start: number, end?: number] = [0]
  private headerService?: HeaderService

  constructor(
    protected params: OperationParams<RecordType>,
    protected options: OperationOptionsWithSlice<RecordType>,
    protected configs: OperationConfigs
  ) {
    this.sheet = params.sheet
    this.spreadsheetId = params.credentials.spreadsheetId
    this.headerRow = params.headerRow ?? 1
    this.schema = params.schema ?? null
    this.headers = params.headers
    this.sheets = params.sheets
    this.slice = options.slice ?? this.slice
  }

  public abstract executeOperation(): Promise<RecordType[]>

  protected validate(): void {
    const { select, omit } = this.options
    if (select && omit) {
      throw new SelectOmitConflictError()
    }
  }

  protected processRecords(records: RecordType[]): RecordType[] {
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

  protected async prepareHeaders(): Promise<void> {
    if (this.headers.length === 0) {
      this.headerService = HeaderService.getInstance(this.sheets)
      this.headers = await this.headerService.getHeaders(
        this.spreadsheetId,
        this.sheet,
        this.headerRow
      )
    }
  }
}
