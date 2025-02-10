import { IHolySheets } from '@/mixins/IHolySheets'
import { InsertOperationOptions } from '@/operations/types/BaseOperation.types'
import InsertOperation from '@/operations/insert/InsertOperation'
import { Constructor } from '@/mixins/Constructor.type'

export function WithInsertOperations<
  RecordType extends object,
  TBase extends Constructor<IHolySheets<RecordType>>
>(Base: TBase) {
  return class extends Base {
    public async insert(
      options: InsertOperationOptions<Partial<RecordType>>
    ): Promise<RecordType[]> {
      const headers = await this.getHeaders()
      const insertOperation = new InsertOperation<Partial<RecordType>>(
        {
          sheet: this.sheet,
          credentials: {
            spreadsheetId: this.spreadsheetId,
            auth: this.sheets.getAuth()
          },
          sheets: this.sheets,
          schema: this.schema,
          headerRow: this.headerRow,
          headers
        },
        options
      )
      await insertOperation.executeOperation()
      return []
    }
  }
}
