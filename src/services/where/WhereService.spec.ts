import { describe, it, expect } from 'vitest'
import { WhereService, WhereClause } from './WhereService'
import { InvalidWhereKeyError } from '@/errors/InvalidWhereKey'
import { SingleColumn } from '@/services/header/HeaderService.types'

interface TestRecord {
  id: string
  name: string
  age: string
}

describe('WhereService with SingleColumn[]', () => {
  // Em vez de string[][], definimos:
  const columns: SingleColumn[] = [
    { header: 'id', values: ['1', '2', '3'] },
    { header: 'name', values: ['Alice', 'Bob', 'Charlie'] },
    { header: 'age', values: ['30', '25', '35'] }
  ]

  it('should initialize correctly with valid where clause', () => {
    const where: WhereClause<TestRecord> = { name: 'Alice' }
    const service = new WhereService(where, columns)
    expect(service).toBeInstanceOf(WhereService)
  })

  it('should throw InvalidWhereKeyError for invalid where clause key', () => {
    const where: WhereClause<TestRecord> = { invalidKey: 'value' } as any
    expect(() => new WhereService(where, columns)).toThrow(InvalidWhereKeyError)
  })

  it('should match rows correctly for simple where clause', () => {
    const where: WhereClause<TestRecord> = { name: 'Alice' }
    const service = new WhereService(where, columns)
    const matches = service.matches()
    // A "name" column tem ['Alice','Bob','Charlie'], 'Alice' está no idx 0
    // mas + headerRow(1) => 1
    expect(matches).toEqual([1])
  })

  it('should match rows correctly using headerRow option', () => {
    const where: WhereClause<TestRecord> = { name: 'Alice' }
    const service = new WhereService(where, columns, 5)
    const matches = service.matches()
    // idx 0 + headerRow(5) => 5
    expect(matches).toEqual([5])
  })

  it('should return empty array if no row matches the condition', () => {
    const where: WhereClause<TestRecord> = { age: '99' }
    const service = new WhereService(where, columns)
    const matches = service.matches()
    expect(matches).toEqual([])
  })

  it('should match multiple conditions with intersection', () => {
    const where: WhereClause<TestRecord> = { name: 'Alice', age: '30' }
    const service = new WhereService(where, columns)
    const matches = service.matches()
    // 'Alice' => idx 0, '30' => idx 0 => interseção => [0 + headerRow(1)]
    expect(matches).toEqual([1])
  })

  it('should match all rows if where clause is empty', () => {
    const where: WhereClause<TestRecord> = {}
    const service = new WhereService(where, columns)
    // Com a clause vazia, retornamos todas as linhas => [1, 2, 3]
    const matches = service.matches()
    expect(matches).toEqual([1, 2, 3])
  })
})
