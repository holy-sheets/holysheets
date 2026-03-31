import { parseRecords } from '@/helpers/parseRecords'
import { TemplateOperation } from '@/operations/TemplateOperation'
import {
  OperationParams,
  OperationConfigs,
  UpdateOperationOptions
} from '@/operations/types/BaseOperation.types'

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

    // Apply updates directly on the raw row arrays to avoid
    // toRecord/fromRecord round-trip issues with schema aliases
    const updatedRows = currentRows.map(row => {
      const updated = [...row]
      const dataEntries = Object.entries(this.data as Record<string, unknown>)
      for (const [key, value] of dataEntries) {
        const colIdx = this.headers.findIndex(h => h.header === key)
        if (colIdx !== -1) {
          while (updated.length <= colIdx) updated.push('')
          updated[colIdx] = value != null ? String(value) : ''
        }
      }
      return updated
    })

    // Write updated rows back to the sheet
    await this.sheets.updateMultipleRows(this.sheet, offsetRows, updatedRows)

    return parseRecords<RecordType>(
      updatedRows,
      this.headers,
      this.schema || []
    )
  }
}
