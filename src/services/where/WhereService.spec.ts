import { describe, it, expect, vi } from 'vitest'
import { WhereService } from './WhereService'
import { InvalidWhereKeyError } from '@/errors/InvalidWhereKey'
import { InvalidWhereFilterError } from '@/errors/InvalidWhereFilter'
import type { SingleColumn } from '@/services/header/HeaderService.types'

type TestRecord = {
  id: string
  name: string
  age: string
  active: string
}

describe('WhereService', () => {
  // Configuração comum para todos os testes
  const defaultColumns: SingleColumn[] = [
    { header: 'id', values: ['1', '2', '3'] },
    { header: 'name', values: ['Alice', 'Bob', 'Charlie'] },
    { header: 'age', values: ['30', '25', '35'] },
    { header: 'active', values: ['true', 'false', 'true'] }
  ]

  const setup = <T>(where: any, columns = defaultColumns, headerRow = 1) => {
    return new WhereService<T>(where, columns, headerRow)
  }

  describe('Validation', () => {
    it('should throw for invalid keys', () => {
      expect(() => setup<TestRecord>({ invalid: 'key' })).toThrow(
        InvalidWhereKeyError
      )
    })
  })

  describe('Matching logic', () => {
    it('should return all rows when no conditions', () => {
      const service = setup<TestRecord>({})
      expect(service.matches()).toEqual([1, 2, 3])
    })

    it('should handle empty dataset gracefully', () => {
      const service = setup<TestRecord>({}, [])
      expect(service.matches()).toEqual([])
    })

    it('should apply headerRow offset correctly', () => {
      const service = setup<TestRecord>({}, defaultColumns, 5)
      expect(service.matches()).toEqual([5, 6, 7])
    })
  })

  describe('Filter conditions', () => {
    it('should match simple equality', () => {
      const service = setup<TestRecord>({ name: 'Alice' })
      expect(service.matches()).toEqual([1])
    })

    it('should combine multiple conditions with AND logic', () => {
      const service = setup<TestRecord>({
        age: '30',
        active: 'true'
      })
      expect(service.matches()).toEqual([1])
    })

    it('should handle complex filter objects', () => {
      const service = setup<TestRecord>({
        age: {
          equals: '25',
          startsWith: '2'
        }
      })
      expect(service.matches()).toEqual([2])
    })

    it('should throw for invalid filter operators', () => {
      const service = setup<TestRecord>({
        age: {
          invalidOperator: '30'
        } as any
      })
      expect(() => service.matches()).toThrow(InvalidWhereFilterError)
    })

    it('should handle boolean conversions', () => {
      const service = setup<TestRecord>({ active: 'true' })
      expect(service.matches()).toEqual([1, 3])
    })
  })

  describe('Edge cases', () => {
    it('should handle empty columns', () => {
      const service = setup<TestRecord>({ name: 'Alice' }, [
        { header: 'name', values: [] }
      ])
      expect(service.matches()).toEqual([])
    })

    it('should handle null/undefined values', () => {
      const columns = [{ header: 'name', values: [undefined, null, ''] as any }]
      const service = setup<TestRecord>({ name: '' }, columns)
      expect(service.matches()).toEqual([3]) // headerRow(1) + index 2
    })
  })
})
