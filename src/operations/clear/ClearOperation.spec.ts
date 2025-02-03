import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ClearSheetOperation } from '@/operations/clear/ClearOperation'
import { parseRecords } from '@/helpers/parseRecords'
import type {
  OperationParams,
  OperationOptions,
  OperationConfigs
} from '@/operations/types/BaseOperation.types'

interface DummyRecord {
  id: number
  value: string
}

// Mock da função parseRecords para que possamos controlar o retorno
vi.mock('@/helpers/parseRecords', () => ({
  parseRecords: vi.fn()
}))

describe('ClearSheetOperation', () => {
  let op: ClearSheetOperation<DummyRecord>
  const mockParams: OperationParams<DummyRecord> = {
    sheet: 'TestSheet',
    credentials: {
      spreadsheetId: 'dummy-id',
      auth: {} as any
    },
    sheets: {
      clearMultipleRows: vi.fn().mockResolvedValue(undefined),
      getMultipleRows: vi.fn().mockResolvedValue([
        ['1', 'Alice'],
        ['2', 'Bob']
      ])
    },
    headerRow: 2,
    headers: [{ header: 'A', column: 0 }],
    schema: []
  }
  const mockOptions: OperationOptions<DummyRecord> = {}

  // Config default: returnRecords true
  const configReturnTrue: OperationConfigs = { returnRecords: true }
  // Config default: returnRecords false (ou não definido)
  const configReturnFalse: OperationConfigs = { returnRecords: false }
  const configUndefined: OperationConfigs = {} as OperationConfigs

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when returnRecords is true', () => {
    beforeEach(() => {
      op = new ClearSheetOperation<DummyRecord>(
        mockParams,
        mockOptions,
        configReturnTrue
      )
    })

    it('should call clearMultipleRows with offset rows', async () => {
      await op['performMainAction']([1, 3])
      expect(mockParams.sheets.clearMultipleRows).toHaveBeenCalledWith(
        'TestSheet',
        [3, 5]
      )
    })

    it('should call getMultipleRows before clearing and return parsed records', async () => {
      // Configura parseRecords para retornar um array previsível
      ;(parseRecords as any).mockImplementation((rows: string[][]) => [
        { id: 1, value: 'Alice' },
        { id: 2, value: 'Bob' }
      ])

      const result = await op['performMainAction']([1, 3])

      // Verifica se getMultipleRows é chamado com as linhas offset
      expect(mockParams.sheets.getMultipleRows).toHaveBeenCalledWith(
        'TestSheet',
        [3, 5]
      )
      // Verifica se parseRecords é chamado com a resposta de getMultipleRows, os headers e o schema
      expect(parseRecords).toHaveBeenCalledWith(
        [
          ['1', 'Alice'],
          ['2', 'Bob']
        ],
        mockParams.headers,
        mockParams.schema
      )
      // O resultado deve ser o retorno de parseRecords
      expect(result).toEqual([
        { id: 1, value: 'Alice' },
        { id: 2, value: 'Bob' }
      ])
    })
  })

  describe('when returnRecords is false', () => {
    beforeEach(() => {
      op = new ClearSheetOperation<DummyRecord>(
        mockParams,
        mockOptions,
        configReturnFalse
      )
    })

    it('should call clearMultipleRows with offset rows and not call getMultipleRows', async () => {
      const result = await op['performMainAction']([1, 3])
      expect(mockParams.sheets.clearMultipleRows).toHaveBeenCalledWith(
        'TestSheet',
        [3, 5]
      )
      expect(mockParams.sheets.getMultipleRows).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('when returnRecords is undefined (default behavior)', () => {
    beforeEach(() => {
      op = new ClearSheetOperation<DummyRecord>(
        mockParams,
        mockOptions,
        configUndefined
      )
    })

    it('should not call getMultipleRows and return an empty array', async () => {
      const result = await op['performMainAction']([1, 3])
      expect(mockParams.sheets.getMultipleRows).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('execution order', () => {
    it('should call getMultipleRows before clearMultipleRows when returnRecords is true', async () => {
      // Para verificar a ordem, podemos usar spies e registrar a ordem das chamadas
      const callOrder: string[] = []
      const getMultipleRowsSpy = vi
        .spyOn(mockParams.sheets, 'getMultipleRows')
        .mockImplementation(async (...args) => {
          callOrder.push('getMultipleRows')
          return [
            ['1', 'Alice'],
            ['2', 'Bob']
          ]
        })
      const clearMultipleRowsSpy = vi
        .spyOn(mockParams.sheets, 'clearMultipleRows')
        .mockImplementation(async (...args) => {
          callOrder.push('clearMultipleRows')
        })

      op = new ClearSheetOperation<DummyRecord>(
        mockParams,
        mockOptions,
        configReturnTrue
      )
      await op['performMainAction']([1, 3])

      expect(callOrder).toEqual(['getMultipleRows', 'clearMultipleRows'])
      getMultipleRowsSpy.mockRestore()
      clearMultipleRowsSpy.mockRestore()
    })
  })
})
