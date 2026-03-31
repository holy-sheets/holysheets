import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TemplateOperation } from './TemplateOperation'
import { HeaderService } from '@/services/header/HeaderService'
import { FetchingColumnsError } from '@/errors/FetchingColumnsError'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { SelectOmitConflictError } from '@/errors/SelectOmitConflictError'
import { InvalidWhereKeyError } from '@/errors/InvalidWhereKey'

interface TestRecord {
  id: number
  name: string
}

// Test operation implementation
class TestOperation extends TemplateOperation<TestRecord> {
  protected async performMainAction(rows: number[]): Promise<TestRecord[]> {
    return []
  }
}

// Type for test setup configuration
type TestSetupOptions = {
  headers?: Array<{ header: string; column?: number }>
  where?: Record<string, any>
  select?: string[]
  omit?: string[]
  mockColumns?: any[][]
  headerRow?: number
}

/**
 * Creates a pre-configured test environment
 * @param options Configuration options for the test
 * @returns Configured operation instance and dependencies
 */
function setupTestEnvironment(options: TestSetupOptions = {}) {
  const sheets: SheetsAdapterService = {
    getMultipleColumns: vi.fn().mockImplementation(() => {
      if (options.mockColumns) return Promise.resolve(options.mockColumns)
      return Promise.resolve([])
    })
  } as unknown as SheetsAdapterService

  const params = {
    sheet: 'TestSheet',
    credentials: { spreadsheetId: 'test-spreadsheet-id' },
    headerRow: options.headerRow,
    schema: null,
    headers:
      options.headers?.map((h, index) => ({
        header: h.header,
        column: h.column ?? index
      })) || [],
    sheets
  }

  const operationOptions = {
    where: options.where,
    select: options.select,
    omit: options.omit
  }

  return {
    operation: new TestOperation(params, operationOptions, {}),
    sheets,
    params
  }
}

/**
 * Mocks the HeaderService with specified headers
 * @param headers Headers to return from the mock
 * @returns Mocked getHeaders function for assertions
 */
function mockHeaderService(headers: Array<{ header: string; column: number }>) {
  const getHeadersMock = vi.fn().mockResolvedValue(headers)
  vi.spyOn(HeaderService, 'getInstance').mockReturnValue({
    getHeaders: getHeadersMock
  } as unknown as HeaderService)
  return getHeadersMock
}

describe('TemplateOperation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should prepare headers when not provided', async () => {
    const { operation, sheets } = setupTestEnvironment({
      mockColumns: [['1'], ['John']],
      where: { id: 1 } // Add where clause to filter columns
    })
    const getHeadersMock = mockHeaderService([
      { header: 'id', column: 0 },
      { header: 'name', column: 1 }
    ])

    await operation.executeOperation()

    expect(getHeadersMock).toHaveBeenCalledWith(
      'test-spreadsheet-id',
      'TestSheet',
      1
    )
    expect(operation['headers']).toEqual([
      { header: 'id', column: 0 },
      { header: 'name', column: 1 }
    ])
    // Should only fetch column 0 (id) based on where clause
    expect(sheets.getMultipleColumns).toHaveBeenCalledWith('TestSheet', [0])
  })

  it('should use existing headers when provided', async () => {
    const { operation } = setupTestEnvironment({
      headers: [
        { header: 'id', column: 0 },
        { header: 'name', column: 1 }
      ],
      mockColumns: [['1'], ['John']]
    })
    const getHeadersMock = mockHeaderService([])

    await operation.executeOperation()

    expect(getHeadersMock).not.toHaveBeenCalled()
    expect(operation['headers']).toEqual([
      { header: 'id', column: 0 },
      { header: 'name', column: 1 }
    ])
  })

  it('should throw SelectOmitConflictError when both select and omit are used', async () => {
    const { operation } = setupTestEnvironment({
      select: ['id'],
      omit: ['name']
    })

    await expect(operation.executeOperation()).rejects.toThrow(
      SelectOmitConflictError
    )
  })

  it('should validate where clause against headers', async () => {
    const { operation } = setupTestEnvironment({
      headers: [{ header: 'id', column: 0 }],
      where: { invalidKey: 'test' },
      mockColumns: [[]]
    })

    await expect(operation.executeOperation()).rejects.toThrow(
      InvalidWhereKeyError
    )
  })

  it('should fetch specific columns based on where clause', async () => {
    const { operation, sheets } = setupTestEnvironment({
      headers: [
        { header: 'id', column: 0 },
        { header: 'name', column: 1 }
      ],
      where: { id: 1 },
      mockColumns: [['1'], ['John']]
    })

    await operation.executeOperation()
    expect(sheets.getMultipleColumns).toHaveBeenCalledWith('TestSheet', [0])
  })

  it('should handle column fetching errors', async () => {
    const { operation, sheets } = setupTestEnvironment({
      headers: [
        { header: 'id', column: 0 },
        { header: 'name', column: 1 }
      ],
      where: { id: 1 }
    })
    sheets.getMultipleColumns = vi
      .fn()
      .mockRejectedValue(new Error('Fetch error'))

    await expect(operation.executeOperation()).rejects.toThrow(
      FetchingColumnsError
    )
  })

  it('should use all headers when where clause is undefined', async () => {
    const { operation, sheets } = setupTestEnvironment({
      headers: [
        { header: 'id', column: 0 },
        { header: 'name', column: 1 }
      ],
      where: undefined,
      mockColumns: [
        ['1', '2'],
        ['John', 'Doe']
      ]
    })

    await operation.executeOperation()
    expect(sheets.getMultipleColumns).toHaveBeenCalledWith('TestSheet', [0, 1])
  })

  it('should use all headers when where clause is empty', async () => {
    const { operation, sheets } = setupTestEnvironment({
      headers: [
        { header: 'id', column: 0 },
        { header: 'name', column: 1 }
      ],
      where: {},
      mockColumns: [
        ['1', '2'],
        ['John', 'Doe']
      ]
    })

    await operation.executeOperation()
    expect(sheets.getMultipleColumns).toHaveBeenCalledWith('TestSheet', [0, 1])
  })

  it('should default headerRow to 1 when not provided', () => {
    const { operation } = setupTestEnvironment({
      headerRow: undefined
    })

    expect(operation['headerRow']).toBe(1)
  })

  it('should use provided headerRow when specified', () => {
    const { operation } = setupTestEnvironment({
      headerRow: 2
    })

    expect(operation['headerRow']).toBe(2)
  })
})
