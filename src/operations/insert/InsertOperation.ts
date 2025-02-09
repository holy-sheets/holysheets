import {
  InsertOperationOptions,
  OperationParams
} from '@/operations/types/BaseOperation.types'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'
import { RecordSchema } from '@/types/RecordSchema.types'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'

export default class InsertOperation<RecordType extends object> {
  protected headers: HeaderColumn[] = []
  protected sheet: string
  protected sheets: SheetsAdapterService
  protected spreadsheetId: string
  protected readonly schema: RecordSchema<RecordType> | null
  protected readonly data: RecordType[]

  constructor(
    protected params: OperationParams<RecordType>,
    protected options: InsertOperationOptions<RecordType>
  ) {
    this.sheet = params.sheet
    this.spreadsheetId = params.credentials.spreadsheetId
    this.schema = params.schema ?? null
    this.headers = params.headers
    this.sheets = params.sheets
    this.data = options.data
  }

  public async executeOperation(): Promise<void> {
    const rows = this.data.map(record => {
      return RecordAdapter.fromRecord(record, {
        schema: this.schema,
        headerColumns: this.headers
      })
    })
    await this.sheets.appendMultipleRows(this.sheet, rows)
  }
}
