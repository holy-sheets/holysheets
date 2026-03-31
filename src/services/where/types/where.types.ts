import whereFilters from '@/services/where/whereFilters'

export type WhereFilter = (value: string) => boolean
export type WhereConditionAcceptedValues = string | string[] | number

export type WhereFilterKey = keyof typeof whereFilters
export type WhereCondition = {
  [key in WhereFilterKey]?: WhereConditionAcceptedValues
}

export type WhereClause<RecordType> = {
  [column in keyof RecordType]?: WhereCondition | string
}
