import { parseRecords } from '@/helpers/parseRecords'
import { TemplateOperation } from '@/operations/TemplateOperation'

export class ClearSheetOperation<
  RecordType extends object
> extends TemplateOperation<RecordType> {
  protected async performMainAction(rows: number[]): Promise<RecordType[]> {
    const returnRecords = this.configs.returnRecords === true
    const offsetRows = rows.map(row => row + this.headerRow)
    if (returnRecords) {
      const response = await this.sheets.getMultipleRows(this.sheet, offsetRows)
      await this.sheets.clearMultipleRows(this.sheet, offsetRows)
      return parseRecords<RecordType>(response, this.headers, this.schema || [])
    } else {
      await this.sheets.clearMultipleRows(this.sheet, offsetRows)
    }
    return []
  }
}
