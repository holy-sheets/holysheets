import { WhereCondition, WhereFilterKey } from '@/types/where'
import { whereFilters } from '@/utils/whereFilters/whereFilters'

export const checkWhereFilter = (
  filters: WhereCondition | string,
  data: string | undefined
): boolean => {
  if (typeof filters === 'string') {
    filters = { equals: filters }
  }
  return Object.entries(filters).every(([key, expected]) => {
    const filter = whereFilters[key as WhereFilterKey](expected)
    return filter(data ?? '')
  })
}
