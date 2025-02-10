import { HolySheetsBase } from '@/mixins/HolySheetsBase/HolySheetsBase'
import { WithFindOperations } from '@/mixins/WithFindOperations/WithFindOperations'
import { WithInsertOperations } from '@/mixins/WithInsertOperations/WithInsertOperations'
import { WithClearOperations } from '@/mixins/WithClearOperations/WithClearOperations'
import { composeMixins } from '@/mixins/composeMixins/composeMixins'
import { DataTypes } from '@/types/RecordSchema.types'

const HolySheets = composeMixins(
  HolySheetsBase,
  WithFindOperations,
  WithInsertOperations,
  WithClearOperations
)

export default HolySheets
export { DataTypes }
