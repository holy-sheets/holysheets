import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoogleSheetsAdapter } from './GoogleSheetsAdapter'
import { HolySheetsCredentials } from '@/services/google-sheets/types/credentials.type'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { SheetNotFoundError } from '@/errors/SheetNotFoundError'

vi.mock('../GoogleSheetsService')

describe('GoogleSheetsAdapter', () => {
  let adapter: GoogleSheetsAdapter
  let mockSheetService: IGoogleSheetsService
  const credentials: HolySheetsCredentials = {
    spreadsheetId: 'test-spreadsheet-id',
    auth: {} as any
  }

  beforeEach(() => {
    mockSheetService = {
      getValues: vi.fn(),
      batchGetValues: vi.fn(),
      appendValues: vi.fn(),
      batchClearValues: vi.fn(),
      batchUpdateValues: vi.fn(),
      getAuth: vi.fn()
    } as unknown as IGoogleSheetsService

    adapter = new GoogleSheetsAdapter(credentials, undefined)
    ;(adapter as any).sheetService = mockSheetService
    ;(adapter as any).sheets = {
      spreadsheets: {
        get: vi.fn(),
        batchUpdate: vi.fn()
      }
    }
  })

  it('should get a single row', async () => {
    const expectedRow = ['A1', 'B1', 'C1']
    ;(mockSheetService.getValues as ReturnType<typeof vi.fn>).mockResolvedValue([
      expectedRow
    ])

    const result = await adapter.getSingleRow('Sheet1', 1)

    expect(result).toEqual(expectedRow)
    expect(mockSheetService.getValues).toHaveBeenCalledWith('Sheet1!1:1')
  })

  it('should get multiple rows', async () => {
    ;(mockSheetService.batchGetValues as ReturnType<typeof vi.fn>).mockResolvedValue(
      [[['A1', 'B1']], [['A2', 'B2']]]
    )

    const result = await adapter.getMultipleRows('Sheet1', [1, 2])

    expect(result).toEqual([
      ['A1', 'B1'],
      ['A2', 'B2']
    ])
    expect(mockSheetService.batchGetValues).toHaveBeenCalledWith([
      'Sheet1!1:1',
      'Sheet1!2:2'
    ])
  })

  it('should append multiple rows', async () => {
    const rows = [
      ['1', 'Bulbasaur'],
      ['2', 'Ivysaur']
    ]

    await adapter.appendMultipleRows('Sheet1', rows)

    expect(mockSheetService.appendValues).toHaveBeenCalledWith('Sheet1', rows)
  })

  it('should get multiple columns', async () => {
    ;(mockSheetService.batchGetValues as ReturnType<typeof vi.fn>).mockResolvedValue(
      [[['A1'], ['A2']], [['B1'], ['B2']]]
    )

    const result = await adapter.getMultipleColumns('Sheet1', [1, 2])

    expect(result).toEqual([
      ['A1', 'A2'],
      ['B1', 'B2']
    ])
    expect(mockSheetService.batchGetValues).toHaveBeenCalledWith([
      'Sheet1!B2:B',
      'Sheet1!C2:C'
    ])
  })

  it('should clear multiple rows', async () => {
    await adapter.clearMultipleRows('Sheet1', [2, 4])

    expect(mockSheetService.batchClearValues).toHaveBeenCalledWith([
      'Sheet1!2:2',
      'Sheet1!4:4'
    ])
  })

  it('should update multiple rows', async () => {
    const rowIndexes = [3, 5]
    const data = [
      ['x', 'y'],
      ['z', null]
    ]

    await adapter.updateMultipleRows('Sheet1', rowIndexes, data)

    expect(mockSheetService.batchUpdateValues).toHaveBeenCalledWith([
      { range: 'Sheet1!3:3', values: [['x', 'y']] },
      { range: 'Sheet1!5:5', values: [['z', null]] }
    ])
  })

  it('should delete rows sorted from bottom to top', async () => {
    vi.spyOn(adapter, 'getSheetId').mockResolvedValue(42)
    const batchUpdate = vi.fn().mockResolvedValue({})
    ;(adapter as any).sheets = {
      spreadsheets: {
        batchUpdate
      }
    }

    await adapter.deleteRows('Sheet1', [2, 5, 3])

    expect(batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 42,
                dimension: 'ROWS',
                startIndex: 4,
                endIndex: 5
              }
            }
          },
          {
            deleteDimension: {
              range: {
                sheetId: 42,
                dimension: 'ROWS',
                startIndex: 2,
                endIndex: 3
              }
            }
          },
          {
            deleteDimension: {
              range: {
                sheetId: 42,
                dimension: 'ROWS',
                startIndex: 1,
                endIndex: 2
              }
            }
          }
        ]
      }
    })
  })

  it('should get spreadsheet', async () => {
    const expectedSpreadsheet = { spreadsheetId: 'test-spreadsheet-id' }
    ;(adapter as any).sheets = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({ data: expectedSpreadsheet })
      }
    }

    const result = await adapter.getSpreadsheet()

    expect(result).toEqual(expectedSpreadsheet)
    expect((adapter as any).sheets.spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId
    })
  })

  it('should get sheet id', async () => {
    vi.spyOn(adapter, 'getSpreadsheet').mockResolvedValue({
      sheets: [{ properties: { title: 'Sheet1', sheetId: 123 } }]
    } as any)

    const result = await adapter.getSheetId('Sheet1')

    expect(result).toBe(123)
  })

  it('should return sheet id 0 when sheet exists without sheetId', async () => {
    vi.spyOn(adapter, 'getSpreadsheet').mockResolvedValue({
      sheets: [{ properties: { title: 'Sheet1' } }]
    } as any)

    const result = await adapter.getSheetId('Sheet1')

    expect(result).toBe(0)
  })

  it('should throw SheetNotFoundError if sheet is not found', async () => {
    vi.spyOn(adapter, 'getSpreadsheet').mockResolvedValue({ sheets: [] } as any)

    await expect(adapter.getSheetId('MissingSheet')).rejects.toThrow(
      new SheetNotFoundError('MissingSheet')
    )
  })

  it('should get auth client', () => {
    const authClient = { client: 'auth-client' }
    ;(mockSheetService.getAuth as ReturnType<typeof vi.fn>).mockReturnValue(
      authClient
    )

    const result = adapter.getAuth()

    expect(result).toEqual(authClient)
    expect(mockSheetService.getAuth).toHaveBeenCalled()
  })

  it('should use injected sheets instance when provided in constructor', async () => {
    const spreadsheetsGet = vi.fn().mockResolvedValue({ data: { sheets: [] } })
    const injectedSheets = {
      spreadsheets: {
        get: spreadsheetsGet
      }
    } as any

    const adapterWithInjectedSheets = new GoogleSheetsAdapter(
      credentials,
      injectedSheets
    )

    await adapterWithInjectedSheets.getSpreadsheet()

    expect(spreadsheetsGet).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId
    })
  })
})
