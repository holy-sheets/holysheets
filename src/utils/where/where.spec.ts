import { describe, it, expect } from 'vitest'
import { checkWhereFilter } from './where'
import { WhereCondition } from '../../types/where'

describe('checkWhereFilter', () => {
  it('should return true when the data equals the string filter', () => {
    const result = checkWhereFilter('John', 'John')
    expect(result).toBe(true)
  })

  it('should return false when the data does not equal the string filter', () => {
    const result = checkWhereFilter('John', 'Doe')
    expect(result).toBe(false)
  })

  it('should return true for the "equals" filter when the data matches', () => {
    const filters: WhereCondition = { equals: 'John' }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(true)
  })

  it('should return false for the "equals" filter when the data does not match', () => {
    const filters: WhereCondition = { equals: 'John' }
    const result = checkWhereFilter(filters, 'Doe')
    expect(result).toBe(false)
  })

  it('should return true for the "not" filter when the data does not match', () => {
    const filters: WhereCondition = { not: 'John' }
    const result = checkWhereFilter(filters, 'Doe')
    expect(result).toBe(true)
  })

  it('should return false for the "not" filter when the data matches', () => {
    const filters: WhereCondition = { not: 'John' }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(false)
  })

  it('should return true for the "contains" filter when the data contains the string', () => {
    const filters: WhereCondition = { contains: 'oh' }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(true)
  })

  it('should return false for the "contains" filter when the data does not contain the string', () => {
    const filters: WhereCondition = { contains: 'xy' }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(false)
  })

  it('should return true for the "startsWith" filter when the data starts with the string', () => {
    const filters: WhereCondition = { startsWith: 'Jo' }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(true)
  })

  it('should return false for the "startsWith" filter when the data does not start with the string', () => {
    const filters: WhereCondition = { startsWith: 'Do' }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(false)
  })

  it('should return true for the "endsWith" filter when the data ends with the string', () => {
    const filters: WhereCondition = { endsWith: 'hn' }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(true)
  })

  it('should return false for the "endsWith" filter when the data does not end with the string', () => {
    const filters: WhereCondition = { endsWith: 'Jo' }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(false)
  })

  it('should return true when all filter conditions are met', () => {
    const filters: WhereCondition = {
      equals: 'John',
      contains: 'oh',
      startsWith: 'Jo',
      endsWith: 'hn'
    }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(true)
  })

  it('should return false when any filter condition is not met', () => {
    const filters: WhereCondition = {
      equals: 'John',
      contains: 'xy',
      startsWith: 'Jo',
      endsWith: 'hn'
    }
    const result = checkWhereFilter(filters, 'John')
    expect(result).toBe(false)
  })
})
