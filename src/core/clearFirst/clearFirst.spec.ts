import { describe, it, expect, vi } from 'vitest'
import { clearFirst } from './clearFirst'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { findFirst } from '@/core/findFirst/findFirst'
import { SheetRecord } from '@/types/sheetRecord'

// Mock the findFirst function
vi.mock('@/core/findFirst/findFirst', () => ({
  findFirst: vi.fn()
}))

describe('clearFirst', () => {
  const mockSheetsService: IGoogleSheetsService = {
    clearValues: vi.fn()
  } as unknown as IGoogleSheetsService

  const spreadsheetId = 'spreadsheet-id'
  const sheet = 'Sheet1'

  it('should clear the first record that matches the where clause', async () => {
    const mockRecord: SheetRecord<{ id: string }> = {
      range: 'Sheet1!A2:B2',
      row: 2,
      fields: { id: '123' }
    }

    // Mock the findFirst function to return a record
    ;(findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRecord
    )

    const result = await clearFirst<{ id: string }>(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } }
    )

    expect(result).toEqual(mockRecord)
    expect(mockSheetsService.clearValues).toHaveBeenCalledWith(mockRecord.range)
  })

  it('should throw an error if no record is found', async () => {
    // Mock the findFirst function to return null
    ;(findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      null
    )

    await expect(
      clearFirst<{ id: string }>(
        { spreadsheetId, sheets: mockSheetsService, sheet },
        { where: { id: '123' } }
      )
    ).rejects.toThrow('No record found to clear')
  })

  it('should handle errors when clearing values', async () => {
    const mockRecord: SheetRecord<{ id: string }> = {
      range: 'Sheet1!A2:B2',
      row: 2,
      fields: { id: '123' }
    }

    // Mock the findFirst function to return a record
    ;(findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRecord
    )

    // Mock the clearValues function to throw an error
    ;(
      mockSheetsService.clearValues as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error('Test error'))

    await expect(
      clearFirst<{ id: string }>(
        { spreadsheetId, sheets: mockSheetsService, sheet },
        { where: { id: '123' } }
      )
    ).rejects.toThrow('Error clearing record: Test error')
  })
})
