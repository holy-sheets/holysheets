import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FindOperation } from '@/operations/find/FindOperation'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { parseRecords } from '@/helpers/parseRecords'

vi.mock('@/helpers/parseRecords', () => ({ parseRecords: vi.fn() }))

interface TestRecord { name: string; age: string }

describe('FindOperation', () => {
  const mockSheets = {
    getMultipleRows: vi.fn().mockResolvedValue([['John','30'],['Jane','25']])
  }
  const mockParams = {
    sheet: 'TestSheet',
    credentials: { spreadsheetId: 'test-id', auth: {} },
    sheets: mockSheets as unknown as SheetsAdapterService,
    headerRow: 1,
    headers: [{ header: 'name', column: 0 }, { header: 'age', column: 1 }],
    schema: []
  }
  beforeEach(() => { vi.clearAllMocks() })

  it('should call getMultipleRows with row + headerRow offset', async () => {
    const op = new FindOperation(mockParams, {}, {})
    ;(parseRecords as any).mockReturnValue([{ name: 'John', age: '30' }])
    await op['performMainAction']([1, 3])
    expect(mockSheets.getMultipleRows).toHaveBeenCalledWith('TestSheet', [2, 4])
  })

  it('should return parsed records', async () => {
    const op = new FindOperation(mockParams, {}, {})
    ;(parseRecords as any).mockReturnValue([{ name: 'John', age: '30' }, { name: 'Jane', age: '25' }])
    const result = await op['performMainAction']([1, 3])
    expect(parseRecords).toHaveBeenCalledWith([['John','30'],['Jane','25']], mockParams.headers, mockParams.schema)
    expect(result).toEqual([{ name: 'John', age: '30' }, { name: 'Jane', age: '25' }])
  })

  it('should return empty array for empty input', async () => {
    ;(mockSheets.getMultipleRows as any).mockResolvedValue([])
    ;(parseRecords as any).mockReturnValue([])
    const op = new FindOperation(mockParams, {}, {})
    expect(await op['performMainAction']([])).toEqual([])
  })

  it('should respect custom headerRow', async () => {
    const op = new FindOperation({ ...mockParams, headerRow: 3 }, {}, {})
    ;(parseRecords as any).mockReturnValue([])
    await op['performMainAction']([0, 2])
    expect(mockSheets.getMultipleRows).toHaveBeenCalledWith('TestSheet', [3, 5])
  })
})
