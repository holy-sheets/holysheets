import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteOperation } from '@/operations/delete/DeleteOperation'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'
import { DataTypes } from '@/types/RecordSchema.types'
import { parseRecords } from '@/helpers/parseRecords'

vi.mock('@/helpers/parseRecords', () => ({
  parseRecords: vi.fn()
}))

interface DummyRecord {
  id: number
  value: string
}

describe('DeleteOperation', () => {
  const mockParams = {
    sheet: 'TestSheet',
    credentials: {
      spreadsheetId: 'dummy-id',
      auth: {} as any
    },
    sheets: {
      deleteRows: vi.fn().mockResolvedValue(undefined),
      getMultipleRows: vi.fn().mockResolvedValue([
        ['1', 'Alice'],
        ['2', 'Bob']
      ])
    } as unknown as SheetsAdapterService,
    headerRow: 2,
    headers: [
      { header: 'id', column: 0 },
      { header: 'value', column: 1 }
    ],
    schema: []
  }

  const mockOptions = {}

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when returnRecords is true', () => {
    const configs = { returnRecords: true }

    it('should call deleteRows with offset rows', async () => {
      const op = new DeleteOperation<DummyRecord>(
        mockParams,
        mockOptions,
        configs
      )
      ;(parseRecords as any).mockReturnValue([
        { id: 1, value: 'Alice' },
        { id: 2, value: 'Bob' }
      ])

      await op['performMainAction']([1, 3])

      expect(mockParams.sheets.deleteRows).toHaveBeenCalledWith(
        'TestSheet',
        [3, 5]
      )
    })

    it('should call getMultipleRows before deleting and return parsed records', async () => {
      const op = new DeleteOperation<DummyRecord>(
        mockParams,
        mockOptions,
        configs
      )
      ;(parseRecords as any).mockReturnValue([
        { id: 1, value: 'Alice' },
        { id: 2, value: 'Bob' }
      ])

      const result = await op['performMainAction']([1, 3])

      expect(mockParams.sheets.getMultipleRows).toHaveBeenCalledWith(
        'TestSheet',
        [3, 5]
      )
      expect(parseRecords).toHaveBeenCalledWith(
        [
          ['1', 'Alice'],
          ['2', 'Bob']
        ],
        mockParams.headers,
        mockParams.schema
      )
      expect(result).toEqual([
        { id: 1, value: 'Alice' },
        { id: 2, value: 'Bob' }
      ])
    })
  })

  describe('when returnRecords is false', () => {
    const configs = { returnRecords: false }

    it('should call deleteRows with offset rows and not call getMultipleRows', async () => {
      const op = new DeleteOperation<DummyRecord>(
        mockParams,
        mockOptions,
        configs
      )

      const result = await op['performMainAction']([1, 3])

      expect(mockParams.sheets.deleteRows).toHaveBeenCalledWith(
        'TestSheet',
        [3, 5]
      )
      expect(mockParams.sheets.getMultipleRows).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('when returnRecords is undefined', () => {
    const configs = {} as any

    it('should not call getMultipleRows and return empty array', async () => {
      const op = new DeleteOperation<DummyRecord>(
        mockParams,
        mockOptions,
        configs
      )

      const result = await op['performMainAction']([1, 3])

      expect(mockParams.sheets.getMultipleRows).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('execution order', () => {
    it('should call getMultipleRows before deleteRows when returnRecords is true', async () => {
      const callOrder: string[] = []
      const sheets = {
        getMultipleRows: vi.fn().mockImplementation(async () => {
          callOrder.push('getMultipleRows')
          return [
            ['1', 'Alice'],
            ['2', 'Bob']
          ]
        }),
        deleteRows: vi.fn().mockImplementation(async () => {
          callOrder.push('deleteRows')
        })
      } as unknown as SheetsAdapterService

      const op = new DeleteOperation<DummyRecord>(
        { ...mockParams, sheets },
        mockOptions,
        { returnRecords: true }
      )
      ;(parseRecords as any).mockReturnValue([])

      await op['performMainAction']([1, 3])

      expect(callOrder).toEqual(['getMultipleRows', 'deleteRows'])
    })
  })
})
