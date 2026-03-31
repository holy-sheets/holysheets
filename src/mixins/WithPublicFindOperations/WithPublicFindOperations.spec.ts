import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WithPublicFindOperations } from '@/mixins/WithPublicFindOperations/WithPublicFindOperations'
import { IHolySheetsPublic } from '@/mixins/IHolySheetsPublic'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'

vi.mock('@/services/visualization/VisualizationQueryService', () => {
  return {
    PublicVisualizationQueryService: vi.fn().mockImplementation(() => ({
      query: vi.fn()
    }))
  }
})

import { PublicVisualizationQueryService } from '@/services/visualization/VisualizationQueryService'

const MockPublicVisualizationQueryService = vi.mocked(
  PublicVisualizationQueryService
)

interface TestRecord {
  name: string
  age: string
}

const headers = [
  { header: 'name', column: 0 },
  { header: 'age', column: 1 }
]

class MockBase implements IHolySheetsPublic<TestRecord> {
  sheet = 'Sheet1'
  spreadsheetId = 'test-id'
  headerRow = 1
  schema = undefined
  getHeaders = vi.fn().mockResolvedValue(headers)
}

function createInstance() {
  const Mixed = WithPublicFindOperations(MockBase as any)
  return new Mixed() as any
}

function mockQueryResult(rows: (string | null)[][]) {
  const mockQuery = vi.fn().mockResolvedValue(rows)
  MockPublicVisualizationQueryService.mockImplementation(
    () =>
      ({
        query: mockQuery
      }) as any
  )
  return mockQuery
}

describe('WithPublicFindOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findMany', () => {
    it('should return all matching records', async () => {
      mockQueryResult([
        ['John', '30'],
        ['Jane', '25']
      ])

      const instance = createInstance()
      const result = await instance.findMany({})

      expect(result).toEqual([
        { name: 'John', age: '30' },
        { name: 'Jane', age: '25' }
      ])
    })

    it('should return empty array when no records match', async () => {
      mockQueryResult([])
      const instance = createInstance()
      const result = await instance.findMany({})
      expect(result).toEqual([])
    })
  })

  describe('findFirst', () => {
    it('should return the first record', async () => {
      mockQueryResult([
        ['John', '30'],
        ['Jane', '25']
      ])

      const instance = createInstance()
      const result = await instance.findFirst({})

      expect(result).toEqual({ name: 'John', age: '30' })
    })

    it('should return undefined when no records match', async () => {
      mockQueryResult([])
      const instance = createInstance()
      const result = await instance.findFirst({})
      expect(result).toBeUndefined()
    })
  })

  describe('findLast', () => {
    it('should return the last record', async () => {
      mockQueryResult([
        ['John', '30'],
        ['Jane', '25']
      ])

      const instance = createInstance()
      const result = await instance.findLast({})

      expect(result).toEqual({ name: 'Jane', age: '25' })
    })
  })

  describe('findUnique', () => {
    it('should return the unique record', async () => {
      mockQueryResult([['John', '30']])

      const instance = createInstance()
      const result = await instance.findUnique({
        where: { name: { equals: 'John' } }
      })

      expect(result).toEqual({ name: 'John', age: '30' })
    })

    it('should throw MultipleRecordsFoundForUniqueError when multiple match', async () => {
      mockQueryResult([
        ['John', '30'],
        ['John', '25']
      ])

      const instance = createInstance()
      await expect(
        instance.findUnique({ where: { name: { equals: 'John' } } })
      ).rejects.toThrow(MultipleRecordsFoundForUniqueError)
    })
  })

  describe('findManyOrThrow', () => {
    it('should return records when found', async () => {
      mockQueryResult([['John', '30']])
      const instance = createInstance()
      const result = await instance.findManyOrThrow({})
      expect(result).toHaveLength(1)
    })

    it('should throw RecordNotFoundError when no records', async () => {
      mockQueryResult([])
      const instance = createInstance()
      await expect(instance.findManyOrThrow({})).rejects.toThrow(
        RecordNotFoundError
      )
    })
  })

  describe('findFirstOrThrow', () => {
    it('should return first record when found', async () => {
      mockQueryResult([['John', '30']])
      const instance = createInstance()
      const result = await instance.findFirstOrThrow({})
      expect(result).toEqual({ name: 'John', age: '30' })
    })

    it('should throw RecordNotFoundError when no records', async () => {
      mockQueryResult([])
      const instance = createInstance()
      await expect(instance.findFirstOrThrow({})).rejects.toThrow(
        RecordNotFoundError
      )
    })
  })

  describe('findUniqueOrThrow', () => {
    it('should return unique record when found', async () => {
      mockQueryResult([['John', '30']])
      const instance = createInstance()
      const result = await instance.findUniqueOrThrow({
        where: { name: { equals: 'John' } }
      })
      expect(result).toEqual({ name: 'John', age: '30' })
    })

    it('should throw RecordNotFoundError when no records', async () => {
      mockQueryResult([])
      const instance = createInstance()
      await expect(
        instance.findUniqueOrThrow({ where: { name: { equals: 'John' } } })
      ).rejects.toThrow(RecordNotFoundError)
    })

    it('should throw MultipleRecordsFoundForUniqueError when multiple match', async () => {
      mockQueryResult([
        ['John', '30'],
        ['John', '25']
      ])
      const instance = createInstance()
      await expect(
        instance.findUniqueOrThrow({ where: { name: { equals: 'John' } } })
      ).rejects.toThrow(MultipleRecordsFoundForUniqueError)
    })
  })

  describe('findLastOrThrow', () => {
    it('should return last record when found', async () => {
      mockQueryResult([
        ['John', '30'],
        ['Jane', '25']
      ])
      const instance = createInstance()
      const result = await instance.findLastOrThrow({})
      expect(result).toEqual({ name: 'Jane', age: '25' })
    })

    it('should throw RecordNotFoundError when no records', async () => {
      mockQueryResult([])
      const instance = createInstance()
      await expect(instance.findLastOrThrow({})).rejects.toThrow(
        RecordNotFoundError
      )
    })
  })
})
