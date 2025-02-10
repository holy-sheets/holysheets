import { IHolySheets } from '@/mixins/IHolySheets'
import {
  OperationOptions,
  OperationConfigs
} from '@/operations/types/BaseOperation.types'
import { ClearSheetOperation } from '@/operations/clear/ClearOperation'
import { Constructor } from '@/mixins/Constructor.type'

export function WithClearOperations<
  RecordType extends object,
  TBase extends Constructor<IHolySheets<RecordType>>
>(Base: TBase) {
  return class extends Base {
    public async clearMany(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      const headers = await this.getHeaders()
      const clearOperation = new ClearSheetOperation<RecordType>(
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
        options,
        configs
      )
      return clearOperation.executeOperation()
    }
  }
}
