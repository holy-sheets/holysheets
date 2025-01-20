import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseSheetOperation } from './BaseOperation'
import { HeaderService } from '@/services/header/HeaderService'
import { InvalidHeaderError } from '@/errors/InvalidHeaderError'
import { FetchingColumnsError } from '@/errors/FetchingColumnsError'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { HeaderValues } from '@/services/header/HeaderService.types'

interface TestRecord {
  id: number
  name: string
}

class TestOperation extends BaseSheetOperation<TestRecord> {
  protected async performMainAction(values: HeaderValues[]): Promise<void> {
    // Mock implementation for testing
  }
}

describe('BaseSheetOperation', () => {
  let params: any
  let options: any
  let configs: any
  let sheets: SheetsAdapterService

  beforeEach(() => {
    sheets = {
      getMultipleColumns: vi.fn()
    } as unknown as SheetsAdapterService

    params = {
      sheet: 'TestSheet',
      credentials: { spreadsheetId: 'test-spreadsheet-id' },
      headerRow: 1,
      schema: null,
      headers: [],
      sheets
    }

    options = {
      where: { id: 1 }
    }

    configs = {}
  })

  it('should prepare headers if not provided', async () => {
    const getHeadersMock = vi
      .fn()
      .mockResolvedValue([{ header: 'id' }, { header: 'name' }])
    vi.spyOn(HeaderService, 'getInstance').mockReturnValue({
      getHeaders: getHeadersMock
    } as unknown as HeaderService)

    const operation = new TestOperation(params, options, configs)
    await operation.executeOperation()

    expect(getHeadersMock).toHaveBeenCalledWith(
      'test-spreadsheet-id',
      'TestSheet',
      1
    )
    expect(operation['headers']).toEqual([{ header: 'id' }, { header: 'name' }])
  })

  it('should throw InvalidHeaderError if where clause contains invalid headers', async () => {
    params.headers = [{ header: 'id' }]
    options.where = { name: 'test' }

    const operation = new TestOperation(params, options, configs)

    await expect(operation.executeOperation()).rejects.toThrow(
      InvalidHeaderError
    )
  })

  it('should fetch columns based on where clause', async () => {
    params.headers = [{ header: 'id' }, { header: 'name' }]
    options.where = { id: 1 }

    const getMultipleColumnsMock = vi.fn().mockResolvedValue([['1'], ['John']])
    sheets.getMultipleColumns = getMultipleColumnsMock

    const operation = new TestOperation(params, options, configs)
    await operation.executeOperation()

    expect(getMultipleColumnsMock).toHaveBeenCalledWith('TestSheet', [0])
  })

  it('should throw FetchingColumnsError if fetching columns fails', async () => {
    params.headers = [{ header: 'id' }, { header: 'name' }]
    options.where = { id: 1 }

    const getMultipleColumnsMock = vi
      .fn()
      .mockRejectedValue(new Error('Fetching error'))
    sheets.getMultipleColumns = getMultipleColumnsMock

    const operation = new TestOperation(params, options, configs)

    await expect(operation.executeOperation()).rejects.toThrow(
      FetchingColumnsError
    )
  })
})
