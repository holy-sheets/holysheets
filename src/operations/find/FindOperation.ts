import { parseRecords } from '@/helpers/parseRecords'
import { TemplateOperation } from '@/operations/TemplateOperation'

export class FindOperation<
  RecordType extends object
> extends TemplateOperation<RecordType> {
  protected async performMainAction(rows: number[]): Promise<RecordType[]> {
    const offsetRows = rows.map(row => row + this.headerRow)
    const response = await this.sheets.getMultipleRows(this.sheet, offsetRows)
    return parseRecords<RecordType>(response, this.headers, this.schema || [])
  }
}
