import { parseRecords } from '@/helpers/parseRecords'
import { TemplateOperation } from '@/operations/TemplateOperation'
import {
  OperationParams,
  OperationConfigs,
  UpdateOperationOptions
} from '@/operations/types/BaseOperation.types'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'

export class UpdateOperation<
  RecordType extends object
> extends TemplateOperation<RecordType> {
  private readonly data: Partial<RecordType>

  constructor(
    params: OperationParams<RecordType>,
    options: UpdateOperationOptions<RecordType>,
    configs: OperationConfigs
  ) {
    super(params, options, configs)
    this.data = options.data
  }

  protected async performMainAction(rows: number[]): Promise<RecordType[]> {
    const offsetRows = rows.map(row => row + this.headerRow)

    // Fetch current row data
    const currentRows = await this.sheets.getMultipleRows(
      this.sheet,
      offsetRows
    )

    // Merge current data with update data for each row
    const updatedRows = currentRows.map(row => {
      const currentRecord = RecordAdapter.toRecord<RecordType>(row, {
        headerColumns: this.headers,
        schema: this.schema
      })
      const mergedRecord = { ...currentRecord, ...this.data }
      return RecordAdapter.fromRecord<RecordType>(mergedRecord, {
        headerColumns: this.headers,
        schema: this.schema
      })
    })

    // Write merged rows back to the sheet
    await this.sheets.updateMultipleRows(this.sheet, offsetRows, updatedRows)

    return parseRecords<RecordType>(
      updatedRows,
      this.headers,
      this.schema || []
    )
  }
}
