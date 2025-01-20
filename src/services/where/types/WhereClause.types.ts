import whereFilters from '@/services/where/whereFilters'

type WhereFilterKey = keyof typeof whereFilters

export type WhereClause<RecordType> = {
  [P in keyof RecordType]?: string | { [K in WhereFilterKey]?: string }
}
