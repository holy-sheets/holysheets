import { describe, it, expect, beforeEach, vi } from 'vitest'
import { google, sheets_v4 } from 'googleapis'
import { GoogleSheetsService } from './GoogleSheetsService'
import { SheetNotFoundError } from '@/errors/SheetNotFoundError'
import { AuthenticationError } from '@/errors/AuthenticationError'
import { HolySheetsError } from '@/errors/HolySheetsError'
import { CellValue } from '@/types/cellValue'

// Dummy credentials and auth for tests
const dummyAuth = {} as any
const dummyCredentials = {
  spreadsheetId: 'dummy-spreadsheet-id',
  auth: dummyAuth
}

let sheetsMock: Partial<sheets_v4.Sheets>

beforeEach(() => {
  // Create a mock of the sheets object with the necessary methods
  sheetsMock = {
    spreadsheets: {
      // Methods related to values
      values: {
        get: vi.fn(),
        batchGet: vi.fn(),
        update: vi.fn(),
        batchUpdate: vi.fn(),
        clear: vi.fn(),
        batchClear: vi.fn()
      },
      // Methods to access the spreadsheet and perform batch updates (used in deleteRows)
      get: vi.fn(),
      batchUpdate: vi.fn()
    }
  }
})

describe('GoogleSheetsService', () => {
  // --- getAuth ---
  it('getAuth() should return the authentication client', () => {
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    expect(service.getAuth()).toBe(dummyAuth)
  })

  // --- getValues ---
  it('getValues() should return values when the response is successful', async () => {
    const expectedValues = [
      ['a', 'b'],
      ['c', 'd']
    ]
    ;(sheetsMock.spreadsheets!.values!.get as any).mockResolvedValue({
      data: { values: expectedValues }
    })

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const result = await service.getValues('Sheet1!A1:B2')
    expect(result).toEqual(expectedValues)
  })

  it('getValues() should return an empty array when there are no values', async () => {
    ;(sheetsMock.spreadsheets!.values!.get as any).mockResolvedValue({
      data: { values: undefined }
    })

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const result = await service.getValues('Sheet1!A1:B2')
    expect(result).toEqual([])
  })

  it('getValues() should throw SheetNotFoundError if the error message indicates an invalid range', async () => {
    const error = new Error('Unable to parse range')
    ;(sheetsMock.spreadsheets!.values!.get as any).mockRejectedValue(error)

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.getValues('NonExistentSheet!A1:B2')).rejects.toThrow(
      SheetNotFoundError
    )
  })

  it('getValues() should throw AuthenticationError if the error message indicates an authorization problem', async () => {
    const error = new Error('Authorization failed')
    ;(sheetsMock.spreadsheets!.values!.get as any).mockRejectedValue(error)

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.getValues('Sheet1!A1:B2')).rejects.toThrow(
      AuthenticationError
    )
  })

  it('getValues() should throw HolySheetsError for other errors', async () => {
    const error = new Error('Some other error')
    ;(sheetsMock.spreadsheets!.values!.get as any).mockRejectedValue(error)

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.getValues('Sheet1!A1:B2')).rejects.toThrow(
      HolySheetsError
    )
    await expect(service.getValues('Sheet1!A1:B2')).rejects.toThrow(
      `Error getting values: ${error.message}`
    )
  })

  // --- batchGetValues ---
  it('batchGetValues() should return values for each specified range', async () => {
    const response = {
      data: {
        valueRanges: [{ values: [['a', 'b']] }, { values: [['c', 'd']] }]
      }
    }
    ;(sheetsMock.spreadsheets!.values!.batchGet as any).mockResolvedValue(
      response
    )

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const result = await service.batchGetValues([
      'Sheet1!A1:B2',
      'Sheet1!C1:D2'
    ])
    expect(result).toEqual([[['a', 'b']], [['c', 'd']]])
  })

  it('batchGetValues() should return an empty array if valueRanges is undefined', async () => {
    const response = { data: {} }
    ;(sheetsMock.spreadsheets!.values!.batchGet as any).mockResolvedValue(
      response
    )

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const result = await service.batchGetValues(['Sheet1!A1:B2'])
    expect(result).toEqual([])
  })

  it('batchGetValues() should throw SheetNotFoundError if the error message indicates an invalid range', async () => {
    const error = new Error('Unable to parse range')
    ;(sheetsMock.spreadsheets!.values!.batchGet as any).mockRejectedValue(error)

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(
      service.batchGetValues(['NonExistentSheet!A1:B2'])
    ).rejects.toThrow(SheetNotFoundError)
  })

  it('batchGetValues() should throw AuthenticationError if the error message indicates an authorization problem', async () => {
    const error = new Error('Auth error occurred')
    ;(sheetsMock.spreadsheets!.values!.batchGet as any).mockRejectedValue(error)

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.batchGetValues(['Sheet1!A1:B2'])).rejects.toThrow(
      AuthenticationError
    )
  })

  it('batchGetValues() should throw HolySheetsError for other errors', async () => {
    const error = new Error('Other batch error')
    ;(sheetsMock.spreadsheets!.values!.batchGet as any).mockRejectedValue(error)

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.batchGetValues(['Sheet1!A1:B2'])).rejects.toThrow(
      HolySheetsError
    )
  })

  // --- updateValues ---
  it('updateValues() should call the update method with the correct parameters', async () => {
    ;(sheetsMock.spreadsheets!.values!.update as any).mockResolvedValue({})
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const range = 'Sheet1!A1:B2'
    const values: CellValue[][] = [['a', 'b']]

    await service.updateValues(range, values, 'RAW')

    expect(sheetsMock.spreadsheets!.values!.update).toHaveBeenCalledWith({
      spreadsheetId: dummyCredentials.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values }
    })
  })

  it('updateValues() should throw an error with the correct message if the update fails', async () => {
    const error = new Error('Update failed')
    ;(sheetsMock.spreadsheets!.values!.update as any).mockRejectedValue(error)
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const range = 'Sheet1!A1:B2'
    const values: CellValue[][] = [['a', 'b']]

    await expect(
      service.updateValues(range, values, 'USER_ENTERED')
    ).rejects.toThrow(`Error updating values: ${error.message}`)
  })

  // --- batchUpdateValues ---
  it('batchUpdateValues() should call batchUpdate with the correct parameters', async () => {
    ;(sheetsMock.spreadsheets!.values!.batchUpdate as any).mockResolvedValue({})
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const data = [{ range: 'Sheet1!A1:B2', values: [['a', 'b']] }]

    await service.batchUpdateValues(data, 'USER_ENTERED')

    expect(sheetsMock.spreadsheets!.values!.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: dummyCredentials.spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data
      }
    })
  })

  it('batchUpdateValues() should throw an error with the correct message if the operation fails', async () => {
    const error = new Error('Batch update error')
    ;(sheetsMock.spreadsheets!.values!.batchUpdate as any).mockRejectedValue(
      error
    )
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const data = [{ range: 'Sheet1!A1:B2', values: [['a', 'b']] }]

    await expect(service.batchUpdateValues(data, 'RAW')).rejects.toThrow(
      `Error performing batch update: ${error.message}`
    )
  })

  // --- clearValues ---
  it('clearValues() should call clear with the correct parameters', async () => {
    ;(sheetsMock.spreadsheets!.values!.clear as any).mockResolvedValue({})
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const range = 'Sheet1!A1:B2'

    await service.clearValues(range)

    expect(sheetsMock.spreadsheets!.values!.clear).toHaveBeenCalledWith({
      spreadsheetId: dummyCredentials.spreadsheetId,
      range
    })
  })

  it('clearValues() should throw an error with the correct message if the operation fails', async () => {
    const error = new Error('Clear failed')
    ;(sheetsMock.spreadsheets!.values!.clear as any).mockRejectedValue(error)
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const range = 'Sheet1!A1:B2'

    await expect(service.clearValues(range)).rejects.toThrow(
      `Error clearing values: ${error.message}`
    )
  })

  // --- batchClearValues ---
  it('batchClearValues() should call batchClear with the correct parameters', async () => {
    ;(sheetsMock.spreadsheets!.values!.batchClear as any).mockResolvedValue({})
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const ranges = ['Sheet1!A1:B2', 'Sheet1!C1:D2']

    await service.batchClearValues(ranges)

    expect(sheetsMock.spreadsheets!.values!.batchClear).toHaveBeenCalledWith({
      spreadsheetId: dummyCredentials.spreadsheetId,
      requestBody: { ranges }
    })
  })

  it('batchClearValues() should throw an error with the correct message if the operation fails', async () => {
    const error = new Error('Batch clear error')
    ;(sheetsMock.spreadsheets!.values!.batchClear as any).mockRejectedValue(
      error
    )
    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const ranges = ['Sheet1!A1:B2']

    await expect(service.batchClearValues(ranges)).rejects.toThrow(
      `Error performing batch clear: ${error.message}`
    )
  })

  // --- getSpreadsheet ---
  it('getSpreadsheet() should return the spreadsheet data when successful', async () => {
    const spreadsheetData = {
      spreadsheetId: dummyCredentials.spreadsheetId,
      sheets: []
    }
    ;(sheetsMock.spreadsheets!.get as any).mockResolvedValue({
      data: spreadsheetData
    })

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    const result = await service.getSpreadsheet()
    expect(result).toEqual(spreadsheetData)
  })

  it('getSpreadsheet() should throw an error when data is undefined', async () => {
    ;(sheetsMock.spreadsheets!.get as any).mockResolvedValue({
      data: undefined
    })

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.getSpreadsheet()).rejects.toThrow(
      'Spreadsheet data is undefined.'
    )
  })

  it('getSpreadsheet() should throw an error with the correct message if the operation fails', async () => {
    const error = new Error('Get spreadsheet error')
    ;(sheetsMock.spreadsheets!.get as any).mockRejectedValue(error)

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.getSpreadsheet()).rejects.toThrow(
      `Error getting spreadsheet: ${error.message}`
    )
  })

  // --- deleteRows ---
  it('deleteRows() should call batchUpdate with the correct parameters to delete rows', async () => {
    const sheetName = 'MySheet'
    const sheetId = 123
    const startIndex = 1
    const endIndex = 3

    // Simulate getSpreadsheet returning a spreadsheet with the desired sheet
    ;(sheetsMock.spreadsheets!.get as any).mockResolvedValue({
      data: {
        sheets: [{ properties: { title: sheetName, sheetId } }]
      }
    })
    ;(sheetsMock.spreadsheets!.batchUpdate as any).mockResolvedValue({})

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await service.deleteRows(sheetName, startIndex, endIndex)

    expect(sheetsMock.spreadsheets!.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: dummyCredentials.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex,
                endIndex
              }
            }
          }
        ]
      }
    })
  })

  it('deleteRows() should throw an error when the sheet is not found', async () => {
    const sheetName = 'NonExistentSheet'
    ;(sheetsMock.spreadsheets!.get as any).mockResolvedValue({
      data: { sheets: [] }
    })

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.deleteRows(sheetName, 0, 1)).rejects.toThrow(
      `Sheet with name "${sheetName}" not found.`
    )
  })

  // --- batchDeleteRows ---
  it('batchDeleteRows() should call batchUpdate with the correct parameters to delete multiple rows', async () => {
    const sheetName = 'MySheet'
    const sheetId = 456
    const rowIndices = [2, 5, 3] // unsorted order; expected descending order: [5, 3, 2]

    ;(sheetsMock.spreadsheets!.get as any).mockResolvedValue({
      data: {
        sheets: [{ properties: { title: sheetName, sheetId } }]
      }
    })
    ;(sheetsMock.spreadsheets!.batchUpdate as any).mockResolvedValue({})

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await service.batchDeleteRows(sheetName, rowIndices)

    const expectedRequests = [
      {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: 5,
            endIndex: 6
          }
        }
      },
      {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: 3,
            endIndex: 4
          }
        }
      },
      {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: 2,
            endIndex: 3
          }
        }
      }
    ]
    expect(sheetsMock.spreadsheets!.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: dummyCredentials.spreadsheetId,
      requestBody: {
        requests: expectedRequests
      }
    })
  })

  it('batchDeleteRows() should throw an error when the sheet is not found', async () => {
    const sheetName = 'NonExistentSheet'
    ;(sheetsMock.spreadsheets!.get as any).mockResolvedValue({
      data: { sheets: [] }
    })

    const service = new GoogleSheetsService(
      dummyCredentials,
      sheetsMock as sheets_v4.Sheets
    )
    await expect(service.batchDeleteRows(sheetName, [1, 2])).rejects.toThrow(
      `Sheet with name "${sheetName}" not found.`
    )
  })
})
