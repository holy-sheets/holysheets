import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import { RecordSchema } from '@/types/RecordSchema.types'

export interface IHolySheets<RecordType extends object> {
  sheet: string
  spreadsheetId: string
  headerRow: number
  sheets: SheetsAdapterService
  schema?: RecordSchema<RecordType>
  getHeaders: () => Promise<HeaderColumn[]>
}
