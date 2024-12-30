import { SelectClause } from '@/types/select'
import { WhereClause } from '@/types/where'
import { OmitClause } from '@/types/omit'

interface SelectOption<RecordType> {
  select: SelectClause<RecordType>
  omit?: never
}

interface OmitOption<RecordType> {
  omit: OmitClause<RecordType>
  select?: never
}

interface NoOption {
  select?: never
  omit?: never
}

export type BaseOperationOptions<RecordType> = {
  where: WhereClause<RecordType>
}

export type OperationOptions<RecordType> = BaseOperationOptions<RecordType> &
  (SelectOption<RecordType> | OmitOption<RecordType> | NoOption)

export type FindAllOptions<RecordType> = OperationOptions<RecordType> & {
  includeEmptyRows?: boolean
}

export type UpdateOptions<RecordType> = OperationOptions<RecordType> & {
  data: RecordType
}
