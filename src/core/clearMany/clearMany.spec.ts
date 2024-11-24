import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clearMany } from './clearMany'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { findMany } from '@/core/findMany/findMany'
import { SheetRecord } from '@/types/sheetRecord'

// Mock the findMany function
vi.mock('@/core/findMany/findMany', () => ({
  findMany: vi.fn()
}))

describe('clearMany', () => {
  const spreadsheetId = 'spreadsheet-id'
  const sheet = 'Sheet1'
  const mockSheetsService: IGoogleSheetsService = {
    batchClearValues: vi.fn()
  } as unknown as IGoogleSheetsService

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should clear multiple records that match the where clause', async () => {
    const mockRecords: SheetRecord<any>[] = [
      { range: 'Sheet1!A2:B2', row: 2, data: { name: 'John Doe' } },
      { range: 'Sheet1!A5:B5', row: 5, data: { name: 'Johnny Cash' } }
    ]

    // Mock the findMany function to return mock records
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockRecords)

    const whereClause = { name: { contains: 'John' } }

    const result = await clearMany(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: whereClause }
    )

    expect(result).toEqual(mockRecords)
    expect(mockSheetsService.batchClearValues).toHaveBeenCalledWith(
      mockRecords.map(record => record.range)
    )
  })

  it('should throw an error if no records are found', async () => {
    // Mock the findMany function to return an empty array
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])

    const whereClause = { name: { contains: 'John' } }

    await expect(
      clearMany(
        { spreadsheetId, sheets: mockSheetsService, sheet },
        { where: whereClause }
      )
    ).rejects.toThrow('No records found to clear')

    expect(mockSheetsService.batchClearValues).not.toHaveBeenCalled()
  })

  it('should handle errors when clearing records', async () => {
    const mockRecords: SheetRecord<any>[] = [
      { range: 'Sheet1!A2:B2', row: 2, data: { name: 'John Doe' } }
    ]

    // Mock the findMany function to return mock records
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockRecords)

    // Mock the batchClearValues method to throw an error
    ;(
      mockSheetsService.batchClearValues as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Test error'))

    const whereClause = { name: { contains: 'John' } }

    await expect(
      clearMany(
        { spreadsheetId, sheets: mockSheetsService, sheet },
        { where: whereClause }
      )
    ).rejects.toThrow('Error clearing records: Test error')

    expect(mockSheetsService.batchClearValues).toHaveBeenCalledWith(
      mockRecords.map(record => record.range)
    )
  })
})
