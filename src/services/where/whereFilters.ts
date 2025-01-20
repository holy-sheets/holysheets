type StringFilter = (value: string, expected: string) => boolean
type ArrayFilter = (value: string, expected: string[]) => boolean
type NumberFilter = (value: string, expected: number) => boolean
export type WhereFilter = StringFilter | ArrayFilter | NumberFilter
const equals: StringFilter = (value, expected) => value === expected

const not: StringFilter = (value, expected) => value !== expected

const _in: ArrayFilter = (value, expected) =>
  Array.isArray(expected) ? expected.includes(value) : false

const notIn: ArrayFilter = (value, expected) => !_in(value, expected)

const lt: NumberFilter = (value, expected) => parseFloat(value) < expected

const lte: NumberFilter = (value, expected) => parseFloat(value) <= expected

const gt: NumberFilter = (value, expected) => parseFloat(value) > expected

const gte: NumberFilter = (value, expected) => parseFloat(value) >= expected

const contains: StringFilter = (value, expected) => expected.includes(value)

const search: StringFilter = (value, expected) =>
  expected.search(new RegExp(value, 'i')) !== -1

const startsWith: StringFilter = (value, expected) => expected.startsWith(value)

const endsWith: StringFilter = (value, expected) => expected.endsWith(value)

export default {
  equals,
  not,
  in: _in,
  notIn,
  lt,
  lte,
  gt,
  gte,
  contains,
  search,
  startsWith,
  endsWith
}
