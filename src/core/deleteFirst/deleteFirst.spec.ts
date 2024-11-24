import { describe, it, expect, vi } from 'vitest'
import { deleteFirst } from './deleteFirst'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { getSheetId } from '@/core/getSheetId/getSheetId'
import { findFirst } from '@/core/findFirst/findFirst'
import { SheetRecord } from '@/types/sheetRecord'

// Mock the dependencies
vi.mock('@/core/getSheetId/getSheetId')
vi.mock('@/core/findFirst/findFirst')

describe('deleteFirst', () => {
  const spreadsheetId = 'spreadsheet-id'
  const sheet = 'Sheet1'
  const mockSheetsService: IGoogleSheetsService = {
    deleteRows: vi.fn()
  } as unknown as IGoogleSheetsService

  const mockRecord: SheetRecord<{ id: string }> = {
    range: 'Sheet1!A2:B2',
    row: 2,
    data: { id: '123' }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete the first record that matches the where clause', async () => {
    // Mock the getSheetId and findFirst functions
    vi.mocked(getSheetId).mockResolvedValue(12345)
    vi.mocked(findFirst).mockResolvedValue(mockRecord)

    const result = await deleteFirst<{ id: string }>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet
      },
      {
        where: { id: '123' }
      }
    )

    if (!result) {
      throw new Error('No record found to delete')
    }

    expect(result).toEqual(mockRecord)
    expect(mockSheetsService.deleteRows).toHaveBeenCalledWith(sheet, 1, 2)
  })

  it('should throw an error if no record is found', async () => {
    // Mock the getSheetId and findFirst functions
    vi.mocked(getSheetId).mockResolvedValue(12345)
    vi.mocked(findFirst).mockResolvedValue(undefined)

    await expect(
      deleteFirst<{ id: string }>(
        {
          spreadsheetId,
          sheets: mockSheetsService,
          sheet
        },
        {
          where: { id: '123' }
        }
      )
    ).rejects.toThrow('No record found to delete')

    expect(mockSheetsService.deleteRows).not.toHaveBeenCalled()
  })
})
