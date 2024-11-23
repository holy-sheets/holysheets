import { describe, it, expect, vi } from 'vitest'
import { getSheetId } from './getSheetId'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'

describe('getSheetId', () => {
  const mockSpreadsheetId = 'mockSpreadsheetId'
  const mockTitle = 'Sheet1'
  const mockSheetId = 12345

  const mockSheetsService: IGoogleSheetsService = {
    getSpreadsheet: vi.fn()
  } as unknown as IGoogleSheetsService

  it('should return the sheet ID for the given title', async () => {
    ;(
      mockSheetsService.getSpreadsheet as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      sheets: [
        {
          properties: {
            title: mockTitle,
            sheetId: mockSheetId
          }
        }
      ]
    })

    const result = await getSheetId({
      spreadsheetId: mockSpreadsheetId,
      sheets: mockSheetsService,
      title: mockTitle
    })

    expect(result).toBe(mockSheetId)
  })

  it('should throw an error if no sheet is found with the given title', async () => {
    ;(
      mockSheetsService.getSpreadsheet as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      sheets: [
        {
          properties: {
            title: 'AnotherSheet',
            sheetId: 67890
          }
        }
      ]
    })

    await expect(
      getSheetId({
        spreadsheetId: mockSpreadsheetId,
        sheets: mockSheetsService,
        title: mockTitle
      })
    ).rejects.toThrow(`No sheet found with title: ${mockTitle}`)
  })

  it('should throw an error if the sheets service throws an error', async () => {
    const mockError = new Error('Service error')
    ;(
      mockSheetsService.getSpreadsheet as ReturnType<typeof vi.fn>
    ).mockRejectedValue(mockError)

    await expect(
      getSheetId({
        spreadsheetId: mockSpreadsheetId,
        sheets: mockSheetsService,
        title: mockTitle
      })
    ).rejects.toThrow(`Error retrieving sheet ID: ${mockError.message}`)
  })
})
