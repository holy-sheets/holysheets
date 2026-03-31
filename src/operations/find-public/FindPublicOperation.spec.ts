import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FindPublicOperation } from '@/operations/find-public/FindPublicOperation'
import { HeaderColumn } from '@/services/header/HeaderService.types'

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
  city: string
}

describe('FindPublicOperation', () => {
  const headers: HeaderColumn[] = [
    { header: 'name', column: 0 },
    { header: 'age', column: 1 },
    { header: 'city', column: 2 }
  ]

  const baseParams = {
    spreadsheetId: 'test-spreadsheet-id',
    sheet: 'Sheet1',
    headerRow: 1,
    headers
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute a query and return parsed records', async () => {
    mockQueryResult([
      ['John', '30', 'NYC'],
      ['Jane', '25', 'LA']
    ])

    const operation = new FindPublicOperation<TestRecord>(baseParams, {})
    const result = await operation.execute()

    expect(result).toEqual([
      { name: 'John', age: '30', city: 'NYC' },
      { name: 'Jane', age: '25', city: 'LA' }
    ])
  })

  it('should pass where clause to query builder', async () => {
    const mockQuery = mockQueryResult([['Alice', '28', 'SF']])

    const operation = new FindPublicOperation<TestRecord>(baseParams, {
      where: { name: { equals: 'Alice' } }
    })
    await operation.execute()

    expect(mockQuery).toHaveBeenCalledWith(
      'Sheet1',
      expect.stringContaining("A = 'Alice'"),
      1
    )
  })

  it('should apply slice to results', async () => {
    mockQueryResult([
      ['John', '30', 'NYC'],
      ['Jane', '25', 'LA'],
      ['Bob', '35', 'SF']
    ])

    const operation = new FindPublicOperation<TestRecord>(
      baseParams,
      {},
      [0, 1]
    )
    const result = await operation.execute()

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ name: 'John', age: '30', city: 'NYC' })
  })

  it('should apply select option', async () => {
    mockQueryResult([['John', '30', 'NYC']])

    const operation = new FindPublicOperation<TestRecord>(baseParams, {
      select: ['name', 'city']
    })
    const result = await operation.execute()

    expect(result[0]).toEqual({ name: 'John', city: 'NYC' })
    expect(result[0]).not.toHaveProperty('age')
  })

  it('should apply omit option', async () => {
    mockQueryResult([['John', '30', 'NYC']])

    const operation = new FindPublicOperation<TestRecord>(baseParams, {
      omit: ['age']
    })
    const result = await operation.execute()

    expect(result[0]).toEqual({ name: 'John', city: 'NYC' })
    expect(result[0]).not.toHaveProperty('age')
  })

  it('should throw SelectOmitConflictError when both select and omit are provided', async () => {
    const operation = new FindPublicOperation<TestRecord>(baseParams, {
      select: ['name'],
      omit: ['age']
    })

    await expect(operation.execute()).rejects.toThrow('select and omit')
  })

  it('should handle empty results', async () => {
    mockQueryResult([])

    const operation = new FindPublicOperation<TestRecord>(baseParams, {})
    const result = await operation.execute()

    expect(result).toEqual([])
  })

  it('should apply negative slice for last element', async () => {
    mockQueryResult([
      ['John', '30', 'NYC'],
      ['Jane', '25', 'LA']
    ])

    const operation = new FindPublicOperation<TestRecord>(baseParams, {}, [-1])
    const result = await operation.execute()

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ name: 'Jane', age: '25', city: 'LA' })
  })
})
