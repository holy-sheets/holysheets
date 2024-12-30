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

/**
 * Options for the find operation.
 *
 * @template RecordType - The type of the record being operated on.
 *
 * This type combines the base operation options with one of the following:
 * - `SelectOption<RecordType>`: Specifies fields to include in the result.
 * - `OmitOption<RecordType>`: Specifies fields to exclude from the result.
 * - `NoOption`: Indicates no specific selection or omission.
 */
export type FindOperationOptions<RecordType> =
  BaseOperationOptions<RecordType> &
    (SelectOption<RecordType> | OmitOption<RecordType> | NoOption)

export type FindAllOptions<RecordType> = FindOperationOptions<RecordType> & {
  includeEmptyRows?: boolean
}

export type UpdateOptions<RecordType> = BaseOperationOptions<RecordType> & {
  data: RecordType
}
