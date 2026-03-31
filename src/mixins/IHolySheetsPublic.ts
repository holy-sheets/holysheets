import { HeaderColumn } from '@/services/header/HeaderService.types'
import { RecordSchema } from '@/types/RecordSchema.types'

export interface IHolySheetsPublic<RecordType extends object> {
  sheet: string
  spreadsheetId: string
  headerRow: number
  schema?: RecordSchema<RecordType>
  getHeaders: () => Promise<HeaderColumn[]>
}
