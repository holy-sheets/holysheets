import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateOperation } from '@/operations/update/UpdateOperation'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'
import { parseRecords } from '@/helpers/parseRecords'

vi.mock('@/helpers/parseRecords', () => ({
  parseRecords: vi.fn()
}))

interface DummyRecord {
  name: string
  age: string
}

describe('UpdateOperation', () => {
  const headers = [
    { header: 'name', column: 0 },
    { header: 'age', column: 1 }
  ]

  const makeSheets = () =>
    ({
      getMultipleRows: vi.fn().mockResolvedValue([['John', '30']]),
      updateMultipleRows: vi.fn().mockResolvedValue(undefined)
    }) as unknown as SheetsAdapterService

  const baseParams = {
    sheet: 'TestSheet',
    credentials: { spreadsheetId: 'test-id', auth: {} as any },
    headerRow: 1,
    headers,
    schema: null,
    sheets: makeSheets()
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch current rows, merge with update data, and write back', async () => {
    const sheets = makeSheets()
    const op = new UpdateOperation<DummyRecord>(
      { ...baseParams, sheets },
      { data: { age: '31' }, slice: [0] },
      {}
    )

    vi.spyOn(RecordAdapter, 'toRecord').mockReturnValue({
      name: 'John',
      age: '30'
    })
    vi.spyOn(RecordAdapter, 'fromRecord').mockReturnValue(['John', '31'])
    ;(parseRecords as any).mockReturnValue([{ name: 'John', age: '31' }])

    const result = await op['performMainAction']([0])

    expect(sheets.getMultipleRows).toHaveBeenCalledWith('TestSheet', [1])
    expect(RecordAdapter.toRecord).toHaveBeenCalledWith(['John', '30'], {
      headerColumns: headers,
      schema: null
    })
    expect(RecordAdapter.fromRecord).toHaveBeenCalledWith(
      { name: 'John', age: '31' },
      { headerColumns: headers, schema: null }
    )
    expect(sheets.updateMultipleRows).toHaveBeenCalledWith(
      'TestSheet',
      [1],
      [['John', '31']]
    )
    expect(result).toEqual([{ name: 'John', age: '31' }])
  })

  it('should update multiple rows', async () => {
    const sheets = {
      getMultipleRows: vi.fn().mockResolvedValue([
        ['John', '30'],
        ['Jane', '25']
      ]),
      updateMultipleRows: vi.fn().mockResolvedValue(undefined)
    } as unknown as SheetsAdapterService

    const op = new UpdateOperation<DummyRecord>(
      { ...baseParams, sheets },
      { data: { age: '99' }, slice: [0] },
      {}
    )

    vi.spyOn(RecordAdapter, 'toRecord')
      .mockReturnValueOnce({ name: 'John', age: '30' })
      .mockReturnValueOnce({ name: 'Jane', age: '25' })
    vi.spyOn(RecordAdapter, 'fromRecord')
      .mockReturnValueOnce(['John', '99'])
      .mockReturnValueOnce(['Jane', '99'])
    ;(parseRecords as any).mockReturnValue([
      { name: 'John', age: '99' },
      { name: 'Jane', age: '99' }
    ])

    const result = await op['performMainAction']([0, 1])

    expect(sheets.updateMultipleRows).toHaveBeenCalledWith(
      'TestSheet',
      [1, 2],
      [
        ['John', '99'],
        ['Jane', '99']
      ]
    )
    expect(result).toHaveLength(2)
  })

  it('should propagate errors from sheets service', async () => {
    const sheets = {
      getMultipleRows: vi.fn().mockRejectedValue(new Error('Sheets API error')),
      updateMultipleRows: vi.fn()
    } as unknown as SheetsAdapterService

    const op = new UpdateOperation<DummyRecord>(
      { ...baseParams, sheets },
      { data: { age: '31' }, slice: [0] },
      {}
    )

    await expect(op['performMainAction']([0])).rejects.toThrow(
      'Sheets API error'
    )
  })
})
