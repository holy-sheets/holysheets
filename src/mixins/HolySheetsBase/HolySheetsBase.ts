import { IHolySheets } from '@/mixins/IHolySheets'
import { HolySheetsCredentials } from '@/services/google-sheets/types/credentials.type'
import { HeaderService } from '@/services/header/HeaderService'
import { RecordSchema } from '@/types/RecordSchema.types'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { GoogleSheetsAdapter } from '@/services/google-sheets/adapter/GoogleSheetsAdapter'
import { HeaderColumn } from '@/services/header/HeaderService.types'

interface HolySheetsBaseOptions {
  headerRow?: number
}

export class HolySheetsBase<RecordType extends object>
  implements IHolySheets<RecordType>
{
  public sheets: SheetsAdapterService
  public sheet: string = ''
  public spreadsheetId: string = ''
  public headerRow: number = 1
  public schema?: RecordSchema<RecordType>
  protected headerService: HeaderService

  constructor(credentials: HolySheetsCredentials) {
    this.spreadsheetId = credentials.spreadsheetId
    this.sheets = new GoogleSheetsAdapter(credentials)
    this.headerService = HeaderService.getInstance(this.sheets)
  }

  public base(table: string, options: HolySheetsBaseOptions = {}): this {
    this.sheet = table
    if (options.headerRow !== undefined) {
      this.headerRow = options.headerRow
    }
    return this
  }

  public defineSchema(schema: RecordSchema<RecordType>): this {
    this.schema = schema
    return this
  }

  public async getHeaders(): Promise<HeaderColumn[]> {
    return this.headerService.getHeaders(
      this.spreadsheetId,
      this.sheet,
      this.headerRow
    )
  }
}
