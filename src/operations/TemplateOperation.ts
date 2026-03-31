import {
  OperationParams,
  OperationConfigs,
  OperationOptionsWithSlice
} from '@/operations/types/BaseOperation.types'
import { BaseOperation } from '@/operations/BaseOperation'
import {
  HeaderColumn,
  SingleColumn
} from '@/services/header/HeaderService.types'
import { FetchingColumnsError } from '@/errors/FetchingColumnsError'
import { WhereService } from '@/services/where/WhereService'
import { InvalidWhereKeyError } from '@/errors/InvalidWhereKey'

export abstract class TemplateOperation<
  RecordType extends object
> extends BaseOperation<RecordType> {
  constructor(
    params: OperationParams<RecordType>,
    options: OperationOptionsWithSlice<RecordType>,
    configs: OperationConfigs
  ) {
    super(params, options, configs)
  }

  public async executeOperation(): Promise<RecordType[]> {
    this.validate()
    await this.prepareHeaders()
    const headerColumns = this.filterColumnsByWhere()
    const columnsValues = await this.retrieveColumnsValues(headerColumns)
    const rows = this.retrieveFilteredRows(columnsValues).slice(...this.slice)
    const records = await this.performMainAction(rows)
    return this.processRecords(records)
  }

  protected abstract performMainAction(rows: number[]): Promise<RecordType[]>

  private retrieveFilteredRows(columns: SingleColumn[]): number[] {
    const whereService = new WhereService(
      this.options.where || {},
      columns,
      this.headerRow
    )
    return whereService.matches()
  }

  private filterColumnsByWhere(): HeaderColumn[] {
    const where = this.options.where || {}
    const whereKeys =
      Object.keys(where).length > 0
        ? Object.keys(where)
        : this.headers.map(h => h.header)

    const validWhereKeys = this.headers.filter(header =>
      whereKeys.includes(header.header)
    )

    whereKeys.forEach(whereKey => {
      if (!validWhereKeys.find(header => header.header === whereKey)) {
        throw new InvalidWhereKeyError(whereKey)
      }
    })

    return validWhereKeys.map(header => ({
      header: header.header,
      column: this.headers.findIndex(h => h.header === header.header)
    }))
  }

  private async retrieveColumnsValues(
    userColumns: HeaderColumn[]
  ): Promise<SingleColumn[]> {
    const columns = userColumns.length > 0 ? userColumns : this.headers

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
