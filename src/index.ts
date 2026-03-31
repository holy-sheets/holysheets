import { HolySheetsBase } from '@/mixins/HolySheetsBase/HolySheetsBase'
import { WithFindOperations } from '@/mixins/WithFindOperations/WithFindOperations'
import { WithInsertOperations } from '@/mixins/WithInsertOperations/WithInsertOperations'
import { WithClearOperations } from '@/mixins/WithClearOperations/WithClearOperations'
import { WithDeleteOperations } from '@/mixins/WithDeleteOperations/WithDeleteOperations'
import { WithUpdateOperations } from '@/mixins/WithUpdateOperations/WithUpdateOperations'
import { composeMixins } from '@/mixins/composeMixins/composeMixins'
import { DataTypes } from '@/types/RecordSchema.types'
import {
  HolySheetsPublicBase,
  HolySheetsPublicCredentials
} from '@/mixins/HolySheetsPublicBase/HolySheetsPublicBase'
import { WithPublicFindOperations } from '@/mixins/WithPublicFindOperations/WithPublicFindOperations'

const HolySheetsComposed = composeMixins(
  HolySheetsBase,
  WithFindOperations,
  WithInsertOperations,
  WithClearOperations,
  WithDeleteOperations,
  WithUpdateOperations
)

const HolySheetsPublicComposed = composeMixins(
  HolySheetsPublicBase,
  WithPublicFindOperations
)

const HolySheets = Object.assign(HolySheetsComposed, {
  public: (credentials: HolySheetsPublicCredentials) =>
    new HolySheetsPublicComposed(credentials)
})

export default HolySheets
export { DataTypes }
export type { HolySheetsPublicCredentials }
