import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GoogleSheetsAdapter } from './GoogleSheetsAdapter'
import { HolySheetsCredentials } from '@/types/credentials'
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
      getAuth: vi.fn()
    } as unknown as IGoogleSheetsService

    adapter = new GoogleSheetsAdapter(credentials, undefined)
    adapter['sheetService'] = mockSheetService
  })

  it('should get a single row', async () => {
    const sheetName = 'Sheet1'
    const rowIndex = 1
    const expectedRow = ['A1', 'B1', 'C1']
    mockSheetService.getValues = vi.fn().mockResolvedValue([expectedRow])

    const result = await adapter.getSingleRow(sheetName, rowIndex)

    expect(result).toEqual(expectedRow)
    expect(mockSheetService.getValues).toHaveBeenCalledWith(`${sheetName}!1:1`)
  })

  it.skip('should get multiple rows', async () => {
    const sheetName = 'Sheet1'
    const rowIndexes = [1, 2]
    const expectedRows = [
      ['A1', 'B1', 'C1'],
      ['A2', 'B2', 'C2']
    ]
    mockSheetService.batchGetValues = vi.fn().mockResolvedValue(expectedRows)

    const result = await adapter.getMultipleRows(sheetName, rowIndexes)
    expect(result).toEqual(expectedRows)
    expect(mockSheetService.batchGetValues).toHaveBeenCalledWith([
      `${sheetName}!1:1`,
      `${sheetName}!2:2`
    ])
  })

  it.skip('should get multiple columns', async () => {
    const sheetName = 'Sheet1'
    const columnIndexes = [1, 2]
    const expectedColumns = [
      ['A1', 'A2'],
      ['B1', 'B2']
    ]
    mockSheetService.batchGetValues = vi.fn().mockResolvedValue(expectedColumns)

    const result = await adapter.getMultipleColumns(sheetName, columnIndexes)

    expect(result).toEqual(expectedColumns)
    expect(mockSheetService.batchGetValues).toHaveBeenCalledWith([
      `${sheetName}!A:A`,
      `${sheetName}!B:B`
    ])
  })

  it('should get spreadsheet', async () => {
    const expectedSpreadsheet = { spreadsheetId: 'test-spreadsheet-id' }
    adapter['sheets'] = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({ data: expectedSpreadsheet })
      }
    } as any

    const result = await adapter.getSpreadsheet()

    expect(result).toEqual(expectedSpreadsheet)
    expect(adapter['sheets'].spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId
    })
  })

  it('should get sheet id', async () => {
    const sheetName = 'Sheet1'
    const expectedSheetId = 123
    const spreadsheet = {
      sheets: [{ properties: { title: sheetName, sheetId: expectedSheetId } }]
    }
    vi.spyOn(adapter, 'getSpreadsheet').mockResolvedValue(spreadsheet as any)

    const result = await adapter.getSheetId(sheetName)

    expect(result).toEqual(expectedSheetId)
  })

  it('should throw SheetNotFoundError if sheet not found', async () => {
    const sheetName = 'NonExistentSheet'
    const spreadsheet = { sheets: [] }
    vi.spyOn(adapter, 'getSpreadsheet').mockResolvedValue(spreadsheet as any)

    await expect(adapter.getSheetId(sheetName)).rejects.toThrow(
      new SheetNotFoundError(sheetName)
    )
  })

  it('should get auth client', () => {
    const authClient = { client: 'auth-client' }
    mockSheetService.getAuth = vi.fn().mockReturnValue(authClient)

    const result = adapter.getAuth()

    expect(result).toEqual(authClient)
    expect(mockSheetService.getAuth).toHaveBeenCalled()
  })
})
