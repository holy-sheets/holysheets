import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FindOperation } from '@/operations/find/FindOperation'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { VisualizationQueryService } from '@/services/visualization/VisualizationQueryService'
import { VisualizationQueryBuilder } from '@/services/visualization/VisualizationQueryBuilder'
import { parseRecords } from '@/helpers/parseRecords'

vi.mock('@/services/visualization/VisualizationQueryService')
vi.mock('@/services/visualization/VisualizationQueryBuilder')
vi.mock('@/helpers/parseRecords', () => ({
  parseRecords: vi.fn()
}))

interface TestRecord {
  name: string
  age: string
}

describe('FindOperation', () => {
  const mockAuth = {} as any
  const mockSheets: SheetsAdapterService = {
    getAuth: vi.fn().mockReturnValue(mockAuth)
  } as unknown as SheetsAdapterService

  const baseParams = {
    sheet: 'TestSheet',
    credentials: { spreadsheetId: 'test-id', auth: mockAuth },
    headerRow: 1,
    headers: [
      { header: 'name', column: 0 },
      { header: 'age', column: 1 }
    ],
    schema: null,
    sheets: mockSheets
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(VisualizationQueryBuilder as any).mockImplementation(() => ({
      build: vi.fn().mockReturnValue('SELECT *')
    }))
    ;(VisualizationQueryService as any).mockImplementation(() => ({
      query: vi.fn().mockResolvedValue([
        ['John', '30'],
        ['Jane', '25']
      ])
    }))
    ;(parseRecords as any).mockImplementation((rows: any) =>
      rows.map((r: string[]) => ({ name: r[0], age: r[1] }))
    )
  })

  it('should use VisualizationQueryService to fetch records', async () => {
    const op = new FindOperation<TestRecord>(baseParams, {}, {})
    const result = await op.executeOperation()

    expect(VisualizationQueryBuilder).toHaveBeenCalledWith(
      {},
      baseParams.headers
    )
    expect(VisualizationQueryService).toHaveBeenCalledWith('test-id', mockAuth)
    expect(result).toEqual([
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' }
    ])
  })

  it('should pass where clause to VisualizationQueryBuilder', async () => {
    const where = { name: 'John' }
    const op = new FindOperation<TestRecord>(baseParams, { where }, {})
    await op.executeOperation()

    expect(VisualizationQueryBuilder).toHaveBeenCalledWith(
      where,
      baseParams.headers
    )
  })

  it('should apply slice to results', async () => {
    ;(VisualizationQueryService as any).mockImplementation(() => ({
      query: vi.fn().mockResolvedValue([
        ['John', '30'],
        ['Jane', '25'],
        ['Bob', '40']
      ])
    }))
    ;(parseRecords as any).mockImplementation((rows: any) =>
      rows.map((r: string[]) => ({ name: r[0], age: r[1] }))
    )

    const op = new FindOperation<TestRecord>(baseParams, { slice: [0, 1] }, {})
    const result = await op.executeOperation()

    // Should only return first element due to slice [0, 1]
    expect(result).toEqual([{ name: 'John', age: '30' }])
  })

  it('should handle empty results', async () => {
    ;(VisualizationQueryService as any).mockImplementation(() => ({
      query: vi.fn().mockResolvedValue([])
    }))
    ;(parseRecords as any).mockReturnValue([])

    const op = new FindOperation<TestRecord>(baseParams, {}, {})
    const result = await op.executeOperation()

    expect(result).toEqual([])
  })

  it('should propagate errors from VisualizationQueryService', async () => {
    ;(VisualizationQueryService as any).mockImplementation(() => ({
      query: vi.fn().mockRejectedValue(new Error('Visualization API error'))
    }))

    const op = new FindOperation<TestRecord>(baseParams, {}, {})
    await expect(op.executeOperation()).rejects.toThrow(
      'Visualization API error'
    )
  })
})
