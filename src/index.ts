import { HolySheetsBase } from '@/mixins/HolySheetsBase/HolySheetsBase'
import { WithFindOperations } from '@/mixins/WithFindOperations/WithFindOperations'
import { WithInsertOperations } from '@/mixins/WithInsertOperations/WithInsertOperations'
import { WithClearOperations } from '@/mixins/WithClearOperations/WithClearOperations'
import { WithDeleteOperations } from '@/mixins/WithDeleteOperations/WithDeleteOperations'
import { WithUpdateOperations } from '@/mixins/WithUpdateOperations/WithUpdateOperations'
import { composeMixins } from '@/mixins/composeMixins/composeMixins'
import { DataTypes } from '@/types/RecordSchema.types'

const HolySheets = composeMixins(
  HolySheetsBase,
  WithFindOperations,
  WithInsertOperations,
  WithClearOperations,
  WithDeleteOperations,
  WithUpdateOperations
)

export default HolySheets
export { DataTypes }
