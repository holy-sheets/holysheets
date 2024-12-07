import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GoogleSheetsService } from './GoogleSheetsService'
import { sheets_v4 } from 'googleapis'
import { AuthClient, HolySheetsCredentials } from '@/types/credentials'
import { CellValue } from '@/types/cellValue'

const mockSheets = {
  spreadsheets: {
    values: {
      get: vi.fn(),
      batchGet: vi.fn(),
      update: vi.fn(),
      batchUpdate: vi.fn(),
      clear: vi.fn(),
      batchClear: vi.fn()
    },
    get: vi.fn(),
    batchUpdate: vi.fn()
  }
} as unknown as sheets_v4.Sheets

const credentials: HolySheetsCredentials = {
  spreadsheetId: 'test-spreadsheet-id',
  auth: { authorize: vi.fn() } as unknown as AuthClient
}

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new GoogleSheetsService(credentials, mockSheets)
  })

  it('should get authentication client', () => {
    expect(service.getAuth()).toBe(credentials.auth)
  })

  it('should get values', async () => {
    const range = 'Sheet1!A1:B2'
    const values: CellValue[][] = [
      ['A1', 'B1'],
      ['A2', 'B2']
    ]
    ;(
      mockSheets.spreadsheets.values.get as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      data: { values }
    })

    const result = await service.getValues(range)
    expect(result).toEqual(values)
    expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      range
    })
  })

  it('should handle error when getting values', async () => {
    const range = 'Sheet1!A1:B2'
    ;(
      mockSheets.spreadsheets.values.get as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error('Test error'))

    await expect(service.getValues(range)).rejects.toThrow(
      'Error getting values: Test error'
    )
  })

  it('should batch get values', async () => {
    const ranges = ['Sheet1!A1:B2', 'Sheet1!C1:D2']
    const valueRanges = [
      {
        range: 'Sheet1!A1:B2',
        values: [
          ['A1', 'B1'],
          ['A2', 'B2']
        ]
      },
      {
        range: 'Sheet1!C1:D2',
        values: [
          ['C1', 'D1'],
          ['C2', 'D2']
        ]
      }
    ]
    ;(
      mockSheets.spreadsheets.values.batchGet as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      data: { valueRanges }
    })

    const result = await service.batchGetValues(ranges)
    expect(result).toEqual({ valueRanges })
    expect(mockSheets.spreadsheets.values.batchGet).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      ranges
    })
  })

  it('should handle error when batch getting values', async () => {
    const ranges = ['Sheet1!A1:B2', 'Sheet1!C1:D2']
    ;(
      mockSheets.spreadsheets.values.batchGet as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error('Test error'))

    await expect(service.batchGetValues(ranges)).rejects.toThrow(
      'Error performing batch get: Test error'
    )
  })

  it('should update values', async () => {
    const range = 'Sheet1!A1:B2'
    const values: CellValue[][] = [
      ['A1', 'B1'],
      ['A2', 'B2']
    ]
    ;(
      mockSheets.spreadsheets.values.update as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({})

    await service.updateValues(range, values)
    expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values }
    })
  })

  it('should handle error when updating values', async () => {
    const range = 'Sheet1!A1:B2'
    const values: CellValue[][] = [
      ['A1', 'B1'],
      ['A2', 'B2']
    ]
    ;(
      mockSheets.spreadsheets.values.update as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error('Test error'))

    await expect(service.updateValues(range, values)).rejects.toThrow(
      'Error updating values: Test error'
    )
  })

  it('should batch update values', async () => {
    const data = [
      {
        range: 'Sheet1!A1:B2',
        values: [
          ['A1', 'B1'],
          ['A2', 'B2']
        ]
      }
    ]
    ;(
      mockSheets.spreadsheets.values.batchUpdate as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({})

    await service.batchUpdateValues(data)
    expect(mockSheets.spreadsheets.values.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data
      }
    })
  })

  it('should handle error when batch updating values', async () => {
    const data = [
      {
        range: 'Sheet1!A1:B2',
        values: [
          ['A1', 'B1'],
          ['A2', 'B2']
        ]
      }
    ]
    ;(
      mockSheets.spreadsheets.values.batchUpdate as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error('Test error'))

    await expect(service.batchUpdateValues(data)).rejects.toThrow(
      'Error performing batch update: Test error'
    )
  })

  it('should clear values', async () => {
    const range = 'Sheet1!A1:B2'
    ;(
      mockSheets.spreadsheets.values.clear as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({})

    await service.clearValues(range)
    expect(mockSheets.spreadsheets.values.clear).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      range
    })
  })

  it('should handle error when clearing values', async () => {
    const range = 'Sheet1!A1:B2'
    ;(
      mockSheets.spreadsheets.values.clear as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error('Test error'))

    await expect(service.clearValues(range)).rejects.toThrow(
      'Error clearing values: Test error'
    )
  })

  it('should batch clear values', async () => {
    const ranges = ['Sheet1!A1:B2', 'Sheet1!C1:D2']
    ;(
      mockSheets.spreadsheets.values.batchClear as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({})

    await service.batchClearValues(ranges)
    expect(mockSheets.spreadsheets.values.batchClear).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      requestBody: { ranges }
    })
  })

  it('should handle error when batch clearing values', async () => {
    const ranges = ['Sheet1!A1:B2', 'Sheet1!C1:D2']
    ;(
      mockSheets.spreadsheets.values.batchClear as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error('Test error'))

    await expect(service.batchClearValues(ranges)).rejects.toThrow(
      'Error performing batch clear: Test error'
    )
  })

  it('should get spreadsheet metadata', async () => {
    const spreadsheet = { spreadsheetId: 'test-spreadsheet-id' }
    ;(
      mockSheets.spreadsheets.get as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({ data: spreadsheet })

    const result = await service.getSpreadsheet()
    expect(result).toEqual(spreadsheet)
    expect(mockSheets.spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      includeGridData: false
    })
  })

  it('should handle error when getting spreadsheet metadata', async () => {
    ;(
      mockSheets.spreadsheets.get as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error('Test error'))

    await expect(service.getSpreadsheet()).rejects.toThrow(
      'Error getting spreadsheet: Test error'
    )
  })

  it('should delete rows', async () => {
    const sheetName = 'Sheet1'
    const startIndex = 1
    const endIndex = 3
    const sheetId = 123

    // Mock sheets.spreadsheets.get to return the sheet with sheetId
    ;(
      mockSheets.spreadsheets.get as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      data: {
        sheets: [
          {
            properties: {
              title: sheetName,
              sheetId: sheetId
            }
          }
        ]
      }
    })
    ;(
      mockSheets.spreadsheets.batchUpdate as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({})

    await service.deleteRows(sheetName, startIndex, endIndex)

    expect(mockSheets.spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      includeGridData: false
    })

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
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

  it('should handle error when deleting rows', async () => {
    const sheetName = 'Sheet1'
    const startIndex = 1
    const endIndex = 3
    const errorMessage = 'Test error'

    // Mock sheets.spreadsheets.get to reject
    ;(
      mockSheets.spreadsheets.get as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error(errorMessage))

    await expect(
      service.deleteRows(sheetName, startIndex, endIndex)
    ).rejects.toThrow(
      `Error deleting rows: Error getting sheetId: Error getting spreadsheet: ${errorMessage}`
    )

    expect(mockSheets.spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      includeGridData: false
    })

    // Ensure batchUpdate was not called
    expect(mockSheets.spreadsheets.batchUpdate).not.toHaveBeenCalled()
  })

  it('should batch delete rows', async () => {
    const sheetName = 'Sheet1'
    const rowIndices = [1, 3, 5]
    const sheetId = 123

    // Mock sheets.spreadsheets.get to return the sheet with sheetId
    ;(
      mockSheets.spreadsheets.get as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      data: {
        sheets: [
          {
            properties: {
              title: sheetName,
              sheetId: sheetId
            }
          }
        ]
      }
    })

    // Mock batchUpdate to resolve successfully
    ;(
      mockSheets.spreadsheets.batchUpdate as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({})

    await service.batchDeleteRows(sheetName, rowIndices)

    // Verify that sheets.spreadsheets.get was called correctly
    expect(mockSheets.spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      includeGridData: false
    })

    // Rows should be sorted in descending order
    const sortedIndices = [...rowIndices].sort((a, b) => b - a)

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      requestBody: {
        requests: sortedIndices.map(rowIndex => ({
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }))
      }
    })
  })

  it('should handle error when batch deleting rows', async () => {
    const sheetName = 'Sheet1'
    const rowIndices = [1, 3, 5]
    const errorMessage = 'Test error'

    // Mock sheets.spreadsheets.get to throw an error
    ;(
      mockSheets.spreadsheets.get as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error(errorMessage))

    await expect(
      service.batchDeleteRows(sheetName, rowIndices)
    ).rejects.toThrow(
      `Error performing batch delete: Error getting sheetId: Error getting spreadsheet: ${errorMessage}`
    )

    // Verify that sheets.spreadsheets.get was called correctly
    expect(mockSheets.spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: credentials.spreadsheetId,
      includeGridData: false
    })

    // Ensure that batchUpdate was not called due to the error
    expect(mockSheets.spreadsheets.batchUpdate).not.toHaveBeenCalled()
  })
})
