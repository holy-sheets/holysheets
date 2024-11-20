import { WhereConditionAcceptedValues, WhereFilter } from '../types/where'

/**
 * Object containing various filter functions for querying data.
 */
export const whereFilters = {
  equals:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: WhereConditionAcceptedValues): boolean =>
      expected === value,
  not:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      expected !== value,
  in:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      Array.isArray(value) ? value.includes(expected) : false,
  notIn:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      Array.isArray(value) ? !value.includes(expected) : false,
  lt:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      typeof value === 'number' && parseFloat(expected) < value,
  lte:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      typeof value === 'number' && parseFloat(expected) <= value,
  gt:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      typeof value === 'number' && parseFloat(expected) > value,
  gte:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      typeof value === 'number' && parseFloat(expected) >= value,
  contains:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      typeof value === 'string' && expected.includes(value),
  search:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      typeof value === 'string' &&
      expected.search(new RegExp(value, 'i')) !== -1,
  startsWith:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      typeof value === 'string' && expected.startsWith(value),
  endsWith:
    (value: WhereConditionAcceptedValues): WhereFilter =>
    (expected: string) =>
      typeof value === 'string' && expected.endsWith(value)
}
