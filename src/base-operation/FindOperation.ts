import { BaseSheetOperation } from '@/base-operation/BaseOperation'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'

export class FindSheetOperation<
  RecordType
> extends BaseSheetOperation<RecordType> {
  protected async performMainAction(rows: number[]): Promise<RecordType[]> {
    const response = await this.sheets.getMultipleRows(this.sheet, rows)
    return response.map(row =>
      RecordAdapter.toRecord<RecordType>(row, {
        headerColumns: this.headers,
        schema: this.schema || []
      })
    )
  }
}
