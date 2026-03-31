import { parseRecords } from '@/helpers/parseRecords'
import { BaseOperation } from '@/operations/BaseOperation'
import { VisualizationQueryBuilder } from '@/services/visualization/VisualizationQueryBuilder'
import { VisualizationQueryService } from '@/services/visualization/VisualizationQueryService'

export class FindOperation<
  RecordType extends object
> extends BaseOperation<RecordType> {
  public async executeOperation(): Promise<RecordType[]> {
    this.validate()
    await this.prepareHeaders()

    const queryBuilder = new VisualizationQueryBuilder<RecordType>(
      this.options.where || {},
      this.headers
    )
    const gvizQuery = queryBuilder.build()

    const vizService = new VisualizationQueryService(
      this.spreadsheetId,
      this.sheets.getAuth()
    )

    const rows = await vizService.query(this.sheet, gvizQuery, this.headerRow)
    const slicedRows = rows.slice(...this.slice)

    const records = parseRecords<RecordType>(
      slicedRows,
      this.headers,
      this.schema || []
    )

    return this.processRecords(records)
  }
}
