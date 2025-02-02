import { TemplateOperation } from '@/operations/TemplateOperation'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'

export class FindSheetOperation<
  RecordType extends object
> extends TemplateOperation<RecordType> {
  protected async performMainAction(rows: number[]): Promise<RecordType[]> {
    const response = await this.sheets.getMultipleRows(
      this.sheet,
      rows.map(row => row + this.headerRow)
    )
    return response.map(row =>
      RecordAdapter.toRecord<RecordType>(row, {
        headerColumns: this.headers,
        schema: this.schema || []
      })
    )
  }
}
