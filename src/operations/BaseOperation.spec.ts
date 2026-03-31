import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseOperation } from './BaseOperation'
import { HeaderService } from '@/services/header/HeaderService'
import { SelectOmitConflictError } from '@/errors/SelectOmitConflictError'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'

interface TestRecord {
  id: number
  name: string
}

class ConcreteOperation extends BaseOperation<TestRecord> {
  public async executeOperation(): Promise<TestRecord[]> {
    this.validate()
    await this.prepareHeaders()
    return this.processRecords([])
  }
}

function setupTestEnvironment(
  options: {
    headers?: Array<{ header: string; column?: number }>
    select?: string[]
    omit?: string[]
  } = {}
) {
  const sheets: SheetsAdapterService = {} as unknown as SheetsAdapterService

  const params = {
    sheet: 'TestSheet',
    credentials: { spreadsheetId: 'test-id' },
    headerRow: 1,
    schema: null,
    headers:
      options.headers?.map((h, index) => ({
        header: h.header,
        column: h.column ?? index
      })) || [],
    sheets
  }

  const operationOptions = {
    select: options.select,
    omit: options.omit
  }

  return {
    operation: new ConcreteOperation(params, operationOptions, {}),
    sheets,
    params
  }
}

describe('BaseOperation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
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

  it('should prepare headers when not provided', async () => {
    const { operation } = setupTestEnvironment({})
    const getHeadersMock = vi.fn().mockResolvedValue([
      { header: 'id', column: 0 },
      { header: 'name', column: 1 }
    ])
    vi.spyOn(HeaderService, 'getInstance').mockReturnValue({
      getHeaders: getHeadersMock
    } as unknown as HeaderService)

    await operation.executeOperation()

    expect(getHeadersMock).toHaveBeenCalledWith('test-id', 'TestSheet', 1)
  })

  it('should use existing headers when provided', async () => {
    const { operation } = setupTestEnvironment({
      headers: [
        { header: 'id', column: 0 },
        { header: 'name', column: 1 }
      ]
    })
    const getHeadersMock = vi.fn()
    vi.spyOn(HeaderService, 'getInstance').mockReturnValue({
      getHeaders: getHeadersMock
    } as unknown as HeaderService)

    await operation.executeOperation()

    expect(getHeadersMock).not.toHaveBeenCalled()
  })

  it('should default headerRow to 1 when not provided', () => {
    const { operation } = setupTestEnvironment({})
    expect(operation['headerRow']).toBe(1)
  })
})
