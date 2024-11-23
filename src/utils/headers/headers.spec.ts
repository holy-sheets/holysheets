import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getHeaders } from './headers'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { createFirstRowRange } from '@/utils/rangeUtils/rangeUtils'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import { CellValue } from '@/types/cellValue'

vi.mock('@/utils/rangeUtils/rangeUtils', () => ({
  createFirstRowRange: vi.fn()
}))

vi.mock('@/utils/columnUtils/columnUtils', () => ({
  indexToColumn: vi.fn()
}))

describe('getHeaders', () => {
  let mockSheets: IGoogleSheetsService
  const spreadsheetId = 'test-spreadsheet-id'
  const sheet = 'Sheet1'

  beforeEach(() => {
    mockSheets = {
      getValues: vi.fn()
    } as unknown as IGoogleSheetsService
    vi.clearAllMocks()
  })

  it('should retrieve headers from the sheet', async () => {
    const range = 'Sheet1!1:1'
    const values: CellValue[][] = [['Header1', 'Header2']]
    ;(createFirstRowRange as ReturnType<typeof vi.fn>).mockReturnValue(range)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      values
    )
    ;(indexToColumn as ReturnType<typeof vi.fn>).mockImplementation(
      index => `Column${index + 1}`
    )

    const result = await getHeaders({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })

    expect(createFirstRowRange).toHaveBeenCalledWith(sheet)
    expect(mockSheets.getValues).toHaveBeenCalledWith(range)
    expect(indexToColumn).toHaveBeenCalledTimes(values[0].length)
    expect(result).toEqual([
      { column: 'Column1', name: 'Header1', index: 0 },
      { column: 'Column2', name: 'Header2', index: 1 }
    ])
  })

  it('should return an empty array if there are no headers', async () => {
    const range = 'Sheet1!1:1'
    ;(createFirstRowRange as ReturnType<typeof vi.fn>).mockReturnValue(range)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      []
    )

    const result = await getHeaders({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })

    expect(createFirstRowRange).toHaveBeenCalledWith(sheet)
    expect(mockSheets.getValues).toHaveBeenCalledWith(range)
    expect(result).toEqual([])
  })

  it('should throw an error if getting values fails', async () => {
    const range = 'Sheet1!1:1'
    const errorMessage = 'Test error'
    ;(createFirstRowRange as ReturnType<typeof vi.fn>).mockReturnValue(range)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    await expect(
      getHeaders({ sheet, sheets: mockSheets, spreadsheetId })
    ).rejects.toThrow(`Error getting headers: ${errorMessage}`)

    expect(createFirstRowRange).toHaveBeenCalledWith(sheet)
    expect(mockSheets.getValues).toHaveBeenCalledWith(range)
  })

  it('should throw an unknown error if an unknown error occurs', async () => {
    const range = 'Sheet1!1:1'
    ;(createFirstRowRange as ReturnType<typeof vi.fn>).mockReturnValue(range)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      'Unknown error'
    )

    await expect(
      getHeaders({ sheet, sheets: mockSheets, spreadsheetId })
    ).rejects.toThrow('An unknown error occurred while getting headers.')

    expect(createFirstRowRange).toHaveBeenCalledWith(sheet)
    expect(mockSheets.getValues).toHaveBeenCalledWith(range)
  })
})
